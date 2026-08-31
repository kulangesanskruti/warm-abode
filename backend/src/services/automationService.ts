import { getPrismaClient } from "../utils/prisma";

const prisma = getPrismaClient();
import { paymentService } from "./paymentService";
import { whatsappService } from "./whatsappService";
import { notificationService } from "./notificationService";

// Billing months are resolved in server-local time so they agree with
// `computeRentDueDate` and `paymentService.ensureCurrentMonthRent`. Mixing
// UTC here with local time there made the two paths disagree about which
// month was "current" for up to a day around month boundaries, which broke
// dedupe keys and could generate two different months' rent in one day.
const monthParts = (date = new Date()) => ({
  month: date.getMonth() + 1,
  year: date.getFullYear(),
});
const startOfDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const automationService = {
  async generateMonthlyRent(ownerId: string, date = new Date()) {
    const { month, year } = monthParts(date);
    const properties = await prisma.property.findMany({ where: { ownerId, status: "ACTIVE" } });
    const results = [];
    for (const property of properties as Array<{ id: string; propertyName: string }>) {
      // NOTE: generateMonthlyRent takes (ownerId, month, year, propertyId?)
      // — passing the property as ownerId here previously scoped the
      // tenant lookup to a non-existent owner, so this job silently
      // generated zero rent records for every run.
      // Only ACTIVE tenants are considered (see paymentService), so
      // vacated/left tenants never get a new rent row.
      const result = await paymentService.generateMonthlyRent(ownerId, month, year, property.id);

      // One "<Month> rent is due" notification per tenant, keyed on
      // tenant+month+year so re-running the scheduler (or startup
      // recovery) can never produce a second copy.
      for (const rent of result.created) {
        await notificationService.rentDue(ownerId, {
          tenantId: rent.tenantId,
          tenantName: rent.tenantName,
          propertyId: property.id,
          paymentId: rent.paymentId,
          month: rent.month,
          year: rent.year,
          amount: rent.amount,
          dueDate: rent.dueDate,
        });
      }

      if (result.generated)
        await notificationService.create(
          ownerId,
          "Monthly rent generated",
          `${result.generated} rent records were generated for ${property.propertyName}.`,
          "PAYMENT",
          `rent-run:${property.id}:${month}:${year}`,
          { propertyId: property.id },
        );
      results.push({ propertyId: property.id, ...result });
    }
    return results;
  },

  async refreshPaymentStatuses(ownerId: string, now = new Date()) {
    const payments = await prisma.payment.findMany({
      where: { property: { ownerId }, status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
      include: { tenant: true },
    });
    let overdue = 0;
    for (const payment of payments) {
      // Use the tenant's real per-billing-month due date when present.
      // Older rows created before the `dueDate` column existed fall back
      // to the 5th of the month so they don't stay stuck as PENDING
      // forever.
      const due = payment.dueDate ?? new Date(Date.UTC(payment.year, payment.month - 1, 5));
      const status =
        Number(payment.paidAmount) >= Number(payment.rentAmount)
          ? "PAID"
          : now >= due
            ? "OVERDUE"
            : Number(payment.paidAmount) > 0
              ? "PARTIAL"
              : "PENDING";
      if (status !== payment.status)
        await prisma.payment.update({ where: { id: payment.id }, data: { status } });
      if (status === "OVERDUE") {
        overdue++;
        // Exactly one overdue notification per rent record, ever. The key
        // is the payment id, so it survives repeated scheduler ticks and
        // also covers rows that were flipped to OVERDUE by the bulk
        // read-path sync rather than by the branch above.
        await notificationService.rentOverdue(ownerId, {
          paymentId: payment.id,
          tenantId: payment.tenantId,
          tenantName: payment.tenant?.fullName ?? "Tenant",
          propertyId: payment.propertyId,
          month: payment.month,
          year: payment.year,
          outstanding: Number(payment.rentAmount) - Number(payment.paidAmount),
          dueDate: due,
        });
      }
    }
    return { checked: payments.length, overdue };
  },

  async queueReminders(ownerId: string, now = new Date()) {
    const payments = await prisma.payment.findMany({
      where: {
        property: { ownerId },
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
        tenant: { status: "ACTIVE" },
      },
      include: { tenant: true, property: true },
    });
    const queued: unknown[] = [];
    for (const payment of payments) {
      const due = startOfDay(
        payment.dueDate ?? new Date(Date.UTC(payment.year, payment.month - 1, 5)),
      );
      const today = startOfDay(now);
      const days = Math.round((today.getTime() - due.getTime()) / 86400000);
      const window =
        days === -3
          ? "3-days-before"
          : days === 0
            ? "due-date"
            : days === 3
              ? "3-days-overdue"
              : days === 7
                ? "7-days-overdue"
                : null;
      if (!window) continue;
      const message = await whatsappService.send(ownerId, {
        tenantId: payment.tenantId,
        paymentId: payment.id,
        message: `Rent reminder for ${payment.tenant.fullName}: payment for ${payment.month}/${payment.year} is due.`,
        messageType: "PAYMENT_REMINDER",
        idempotencyKey: `automation-reminder:${payment.id}:${window}`,
      });
      await notificationService.paymentReminder(ownerId, payment.id, payment.tenantId, window);
      queued.push(message);
    }
    return { checked: payments.length, queued: queued.length };
  },
};
