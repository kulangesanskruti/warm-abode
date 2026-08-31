import { notificationService } from "../services/notificationService";
import { jobService } from "../services/jobService";

export const automationEventHandler = {
  paymentCollected: (ownerId: string, paymentId: string, tenantId: string, amount: number) =>
    notificationService.paymentCollected(ownerId, paymentId, tenantId, amount),
  paymentStatusChanged: (ownerId: string) =>
    jobService.enqueue(ownerId, {
      type: "PAYMENT_STATUS_REFRESH",
      idempotencyKey: `payment-status:${new Date().toISOString().slice(0, 10)}`,
    }),
  dailyReminders: (ownerId: string) =>
    jobService.enqueue(ownerId, {
      type: "RENT_REMINDERS",
      idempotencyKey: `rent-reminders:${new Date().toISOString().slice(0, 10)}`,
    }),
  monthlyRent: (ownerId: string, month: number, year: number) =>
    jobService.enqueue(ownerId, {
      type: "MONTHLY_RENT",
      idempotencyKey: `monthly-rent:${month}:${year}`,
    }),
  whatsappFailed: (ownerId: string, messageId: string) =>
    notificationService.whatsappFailure(ownerId, messageId),
};
