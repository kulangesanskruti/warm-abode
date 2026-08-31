import { paymentRepository } from "../repositories/paymentRepository";
import { tenantRepository } from "../repositories/tenantRepository";
import { propertyRepository } from "../repositories/propertyRepository";
import { userRepository } from "../repositories/userRepository";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { logger } from "../utils/logger";
import { computeRentDueDate } from "../utils/date";
import {
  ActivityType,
  CollectRentRequest,
  PartialPaymentRequest,
  PaymentStatus,
} from "../validators/payment";

/**
 * Confirms the tenant belongs to a property owned by `ownerId` before any
 * payment is recorded against them. Both collect endpoints previously
 * skipped this check entirely (the userId parameter was received but never
 * used), which meant any authenticated user could record a payment against
 * any tenant in the system just by guessing/enumerating a tenantId.
 */
async function assertOwnsTenant(tenantId: string, ownerId: string) {
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant) {
    throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
  }
  const property = await propertyRepository.findById(tenant.propertyId, ownerId);
  if (!property) {
    throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
  }
  return tenant;
}

/** A rent row that was actually created by this generation run. */
export type GeneratedRent = {
  paymentId: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  month: number;
  year: number;
  amount: number;
  dueDate: Date;
};

export const paymentService = {

  /**
   * Generate monthly rent for all active tenants owned by this user
   * (optionally scoped to a single property). This is the manually
   * triggered variant — `ensureCurrentMonthRent` below is the automatic,
   * self-healing counterpart used every time rent data is read.
   */
  async generateMonthlyRent(
    ownerId: string,
    month: number,
    year: number,
    propertyId?: string,
  ) {
    try {
      // Get all active tenants for this owner (optionally scoped to one
      // property). `findAll` already scopes strictly to `ownerId`, so this
      // can never leak another owner's tenants.
      const tenantsResult = await tenantRepository.findAll({
        ownerId,
        ...(propertyId ? { propertyId } : {}),
        status: "ACTIVE",
        page: 1,
        limit: 10000,
        sortBy: "createdAt",
        sortOrder: "asc",
      });
      const tenantList = tenantsResult.tenants;

      if (!tenantList.length) {
        return { generated: 0, skipped: 0, errors: [] as string[], created: [] as GeneratedRent[] };
      }

      let generated = 0;
      let skipped = 0;
      const errors: string[] = [];
      const created: GeneratedRent[] = [];

      for (const tenant of tenantList) {
        try {
          // Check if rent already exists — the DB also enforces this via a
          // unique(tenantId, month, year) constraint, so this can never
          // result in a duplicate rent record for the same billing month.
          const exists = await paymentRepository.rentExists(tenant.id, month, year);
          if (exists) {
            skipped++;
            continue;
          }

          if (!tenant.roomId || !tenant.bedId) {
            errors.push(`Tenant ${tenant.fullName}: Room/bed not assigned`);
            continue;
          }

          const dueDate = computeRentDueDate(new Date(tenant.moveInDate), month, year);

          // Create monthly rent record
          let createdPayment;
          try {
            createdPayment = await paymentRepository.createMonthlyRent(
              tenant.id,
              tenant.propertyId,
              tenant.roomId,
              tenant.bedId,
              Number(tenant.monthlyRent || 0),
              month,
              year,
              dueDate,
            );
          } catch (createErr) {
            // Concurrent run (scheduler tick + startup recovery + a manual
            // trigger) lost the race on unique(tenantId, month, year). The
            // row exists, so this is a skip, never a duplicate or an error.
            if ((createErr as { code?: string })?.code === "P2002") {
              skipped++;
              continue;
            }
            throw createErr;
          }

          // Log activity — must reference the payment row just created, not
          // the tenant id. The activity log's FK is payment_activity_logs.paymentId
          // -> payments.id, so passing tenant.id here violated that FK on
          // every single generation (the payment row itself was still created,
          // but `generated` was never incremented and the tenant surfaced in
          // `errors` instead — the count reported by this endpoint was wrong
          // for every tenant, every month).
          await paymentRepository.createActivityLog(createdPayment.id, ActivityType.RENT_GENERATED, {
            month,
            year,
            amount: Number(tenant.monthlyRent || 0),
            dueDate: dueDate.toISOString(),
          });

          created.push({
            paymentId: createdPayment.id,
            tenantId: tenant.id,
            tenantName: tenant.fullName,
            propertyId: tenant.propertyId,
            month,
            year,
            amount: Number(tenant.monthlyRent || 0),
            dueDate,
          });
          generated++;
        } catch (err) {
          errors.push(`Tenant ${tenant.fullName}: ${(err as Error).message}`);
        }
      }

      logger.info("Monthly rent generated", { ownerId, propertyId, month, year, generated, skipped });
      return { generated, skipped, errors, created };

    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error("Generate monthly rent failed", { error: (err as Error).message });
      throw new ApiError("Failed to generate monthly rent", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Auto-generates the current calendar month's rent record for every
   * active tenant owned by this user that doesn't already have one, then
   * syncs any stale PENDING/PARTIAL rows whose due date has passed into
   * OVERDUE. Called at the top of every rent-read endpoint so the Rent
   * Management screen, tenant history, property rent view, and dashboard
   * always reflect real, current-month rows without a manual "generate"
   * step or a cron job.
   */
  async ensureCurrentMonthRent(ownerId: string): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    try {
      await this.generateMonthlyRent(ownerId, month, year);
    } catch (err) {
      // Never let auto-generation break a read — log and continue so the
      // page still renders whatever rent data already exists.
      logger.error("ensureCurrentMonthRent failed", { ownerId, error: (err as Error).message });
    }
    await paymentRepository.syncOverdueStatuses(ownerId);
  },

  /**
   * Collect rent payment (full or top-up on an existing partial).
   */
  async collectRent(userId: string, data: CollectRentRequest) {
    try {
      // Verify tenant exists AND belongs to this owner — previously this
      // check was entirely missing (userId was accepted but never used),
      // so any authenticated user could pay against any tenantId.
      const tenant = await assertOwnsTenant(data.tenantId, userId);

      if (tenant.status !== "ACTIVE") {
        throw new ApiError("Can only collect from active tenants", HttpStatusCode.BAD_REQUEST);
      }

      if (data.amountPaid <= 0) {
        throw new ApiError("Payment amount must be greater than 0", HttpStatusCode.BAD_REQUEST);
      }

      // Get or auto-create the rent record for this billing month — mirrors
      // ensureCurrentMonthRent so a collection can be recorded even if the
      // read path hasn't run yet for this exact month/tenant.
      let payment = await paymentRepository.rentExists(data.tenantId, data.month, data.year);
      if (!payment) {
        if (!tenant.roomId || !tenant.bedId) {
          throw new ApiError("Tenant has no room/bed assigned", HttpStatusCode.BAD_REQUEST);
        }
        const dueDate = computeRentDueDate(new Date(tenant.moveInDate), data.month, data.year);
        payment = await paymentRepository.createMonthlyRent(
          data.tenantId,
          tenant.propertyId,
          tenant.roomId,
          tenant.bedId,
          Number(tenant.monthlyRent || 0),
          data.month,
          data.year,
          dueDate,
        );
      }

      // Prevent recording anything against a billing month that's already
      // fully settled — this is the "prevent duplicate/overpayment for the
      // same billing month" guard for the already-PAID case.
      if (payment.status === PaymentStatus.PAID) {
        throw new ApiError(
          "This billing month is already fully paid",
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // Validate payment amount against the actual current outstanding
      // balance (source of truth), not a recomputed rentAmount formula —
      // the old formula ignored any amount already paid, which could let
      // repeated collect calls overpay past the real outstanding balance.
      const maxPayable =
        Number(payment.outstandingAmount) + Number(data.lateFee || 0) - Number(data.discount || 0);
      if (data.amountPaid > maxPayable) {
        throw new ApiError(
          `Cannot pay more than outstanding balance (${maxPayable}).`,
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Record payment
      const updated = await paymentRepository.recordPayment(
        payment.id,
        data.amountPaid,
        data.lateFee || 0,
        data.discount || 0,
        data.paymentMethod,
        data.referenceNumber || "",
        data.notes || "",
        receiptNumber,
      );

      if (!updated) {
        throw new ApiError("Failed to record payment", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }
      payment = updated;

      // Create receipt metadata
      await paymentRepository.createReceipt(
        payment.id,
        receiptNumber,
        data.tenantId,
        tenant.propertyId,
        tenant.roomId!,
        tenant.bedId!,
        data.amountPaid,
        data.paymentMethod,
        data.referenceNumber || "",
      );

      // Create activity log
      await paymentRepository.createActivityLog(payment.id, ActivityType.PAYMENT_COLLECTED, {
        tenantId: data.tenantId,
        amountPaid: data.amountPaid,
        lateFee: data.lateFee,
        discount: data.discount,
        paymentMethod: data.paymentMethod,
        receiptNumber,
      });

      logger.info("Rent payment collected", {
        tenantId: data.tenantId,
        amount: data.amountPaid,
        receiptNumber,
      });

      return { payment, receiptNumber, status: "success" };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error("Collect rent failed", { error: (err as Error).message });
      throw new ApiError("Failed to collect rent", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Record partial payment
   */
  async recordPartialPayment(userId: string, data: PartialPaymentRequest) {
    try {
      // Same ownership fix as collectRent above.
      const tenant = await assertOwnsTenant(data.tenantId, userId);

      if (data.amountPaid <= 0) {
        throw new ApiError("Payment amount must be greater than 0", HttpStatusCode.BAD_REQUEST);
      }

      // Get or create payment record
      let payment = await paymentRepository.rentExists(data.tenantId, data.month, data.year);
      if (!payment) {
        if (!tenant.roomId || !tenant.bedId) {
          throw new ApiError("Tenant has no room/bed assigned", HttpStatusCode.BAD_REQUEST);
        }
        const dueDate = computeRentDueDate(new Date(tenant.moveInDate), data.month, data.year);
        payment = await paymentRepository.createMonthlyRent(
          data.tenantId,
          tenant.propertyId,
          tenant.roomId,
          tenant.bedId,
          Number(tenant.monthlyRent || 0),
          data.month,
          data.year,
          dueDate,
        );
      }

      if (payment.status === PaymentStatus.PAID) {
        throw new ApiError(
          "This billing month is already fully paid",
          HttpStatusCode.BAD_REQUEST,
        );
      }

      const maxPayable = Number(payment.outstandingAmount);
      if (data.amountPaid > maxPayable) {
        throw new ApiError(
          `Cannot pay more than outstanding ${maxPayable}`,
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Record partial payment (lateFee/discount preserved as-is on the
      // existing record — a partial top-up shouldn't reset them to 0)
      const updated = await paymentRepository.recordPayment(
        payment.id,
        data.amountPaid,
        Number(payment.lateFee),
        Number(payment.discount),
        data.paymentMethod,
        data.referenceNumber || "",
        data.notes || "",
        receiptNumber,
      );

      if (!updated) {
        throw new ApiError(
          "Failed to record partial payment",
          HttpStatusCode.INTERNAL_SERVER_ERROR,
        );
      }
      payment = updated;

      // Create receipt
      await paymentRepository.createReceipt(
        payment.id,
        receiptNumber,
        data.tenantId,
        tenant.propertyId,
        tenant.roomId!,
        tenant.bedId!,
        data.amountPaid,
        data.paymentMethod,
        data.referenceNumber || "",
      );

      // Log activity
      await paymentRepository.createActivityLog(payment.id, ActivityType.PARTIAL_PAYMENT, {
        amountPaid: data.amountPaid,
        remainingBalance: payment.outstandingAmount,
        receiptNumber,
      });

      logger.info("Partial payment recorded", {
        tenantId: data.tenantId,
        amount: data.amountPaid,
        remaining: payment.outstandingAmount,
      });

      return { payment, receiptNumber, status: payment.status === PaymentStatus.PAID ? "success" : "partial" };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error("Record partial payment failed", { error: (err as Error).message });
      throw new ApiError("Failed to record partial payment", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get pending payments
   */
  async getPendingPayments(userId: string) {
    try {
      await this.ensureCurrentMonthRent(userId);
      const payments = await paymentRepository.getPendingPayments(userId);
      return payments;
    } catch (err) {
      logger.error("Get pending payments failed", { error: (err as Error).message });
      throw new ApiError("Failed to fetch pending payments", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get overdue payments
   */
  async getOverduePayments(userId: string) {
    try {
      await this.ensureCurrentMonthRent(userId);
      const payments = await paymentRepository.getOverduePayments(userId);
      return payments;
    } catch (err) {
      logger.error("Get overdue payments failed", { error: (err as Error).message });
      throw new ApiError("Failed to fetch overdue payments", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(userId: string, _month?: number, _year?: number) {
    try {
      await this.ensureCurrentMonthRent(userId);
      const metrics = await paymentRepository.getDashboardMetrics(userId);
      return metrics;
    } catch (err) {
      logger.error("Get dashboard metrics failed", { error: (err as Error).message });
      throw new ApiError("Failed to fetch dashboard data", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  },
  /**
   * Builds the rent receipt for a single PAID/PARTIAL payment.
   *
   * Ownership is enforced through paymentRepository.getPaymentForReceipt —
   * a payment belonging to another owner's property is indistinguishable
   * from a non-existent one (404). Receipt numbers are stable: the
   * persisted Receipt row (created when the payment was collected) is
   * reused, and only legacy rows without one get a deterministic number
   * derived from the payment id, so repeat clicks never duplicate.
   */
  async getPaymentReceipt(ownerId: string, paymentId: string) {
    const payment = await paymentRepository.getPaymentForReceipt(paymentId, ownerId);
    if (!payment) {
      throw new ApiError("Payment not found", HttpStatusCode.NOT_FOUND);
    }

    const paidAmount = Number(payment.paidAmount);
    const isSettled =
      payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.PARTIAL;
    if (!isSettled || paidAmount <= 0) {
      throw new ApiError(
        "A receipt is available only after rent has been collected for this month.",
        HttpStatusCode.BAD_REQUEST,
      );
    }

    let receipt = await paymentRepository.getReceiptByPaymentId(paymentId);
    if (!receipt) {
      const receiptNumber =
        payment.receiptNumber ??
        `RCP-${payment.year}${String(payment.month).padStart(2, "0")}-${paymentId
          .slice(-8)
          .toUpperCase()}`;
      await paymentRepository.createReceipt(
        payment.id,
        receiptNumber,
        payment.tenantId,
        payment.propertyId,
        payment.roomId,
        payment.bedId,
        paidAmount,
        payment.paymentMethod as any,
        payment.transactionReference || "",
      );
      if (!payment.receiptNumber) {
        await paymentRepository.setPaymentReceiptNumber(payment.id, receiptNumber);
      }
      receipt = await paymentRepository.getReceiptByPaymentId(paymentId);
    }

    const owner = await userRepository.findById(ownerId);

    return {
      receiptId: receipt?.id ?? payment.id,
      receiptNumber: receipt?.receiptNumber ?? payment.receiptNumber ?? "—",
      status: payment.status === PaymentStatus.PAID ? "PAID" : "PARTIAL",
      paymentId: payment.id,
      generatedAt: (receipt?.generatedAt ?? new Date()).toISOString(),
      paymentDate: (payment.paymentDate ?? receipt?.generatedAt ?? payment.createdAt).toISOString(),
      dueDate: payment.dueDate ? payment.dueDate.toISOString() : null,
      month: payment.month,
      year: payment.year,
      rentAmount: Number(payment.rentAmount),
      amountPaid: paidAmount,
      outstandingAmount: Number(payment.outstandingAmount),
      lateFee: Number(payment.lateFee),
      discount: Number(payment.discount),
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.transactionReference || receipt?.referenceNumber || null,
      notes: payment.notes || null,
      tenant: {
        id: payment.tenantId,
        fullName: payment.tenant.fullName,
        phone: payment.tenant.phone,
        email: payment.tenant.email ?? null,
      },
      property: {
        id: payment.propertyId,
        propertyName: payment.property.propertyName,
        address: payment.property.address,
        city: payment.property.city,
        state: payment.property.state,
        pincode: payment.property.pincode,
      },
      room: { number: payment.room?.roomNumber ?? "—" },
      bed: { number: payment.bed?.bedNumber ?? "—" },
      owner: {
        fullName: owner?.fullName ?? "Property Owner",
        phone: owner?.phone ?? null,
        email: owner?.email ?? null,
      },
    };
  },
};
