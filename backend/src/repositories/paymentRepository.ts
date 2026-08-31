import { getPrismaClient } from "../utils/prisma";
import { PaymentStatus, PaymentMethod } from "../validators/payment";
import { logger } from "../utils/logger";
import { getStartOfDay } from "../utils/date";

export const paymentRepository = {
  /**
   * Create a monthly rent record.
   *
   * `dueDate` is the tenant's computed due date for this specific
   * month/year. If it has already passed at creation time (e.g. rent is
   * being generated retroactively for a month that's already underway),
   * the record is created straight into OVERDUE so status is correct from
   * the moment it exists — it doesn't wait for the next sync pass.
   */
  async createMonthlyRent(
    tenantId: string,
    propertyId: string,
    roomId: string,
    bedId: string,
    monthlyRent: number,
    month: number,
    year: number,
    dueDate: Date,
  ) {
    const client = getPrismaClient();
    const isAlreadyOverdue = dueDate.getTime() < Date.now();
    return client.payment.create({
      data: {
        tenantId,
        propertyId,
        roomId,
        bedId,
        month,
        year,
        rentAmount: monthlyRent,
        paidAmount: 0,
        outstandingAmount: monthlyRent,
        status: isAlreadyOverdue ? PaymentStatus.OVERDUE : PaymentStatus.PENDING,
        lateFee: 0,
        discount: 0,
        dueDate,
      },
    });
  },

  /**
   * Self-healing status sync: any PENDING/PARTIAL rent whose due date has
   * passed is flipped to OVERDUE. Cheap bulk UPDATE, safe to call before
   * every read so the stored status field never drifts from "now" without
   * needing a cron job or scheduler.
   */
  async syncOverdueStatuses(propertyUserId: string): Promise<number> {
    const client = getPrismaClient();
    const result = await client.payment.updateMany({
      where: {
        property: { ownerId: propertyUserId },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
        dueDate: { lt: getStartOfDay() },
      },
      data: { status: PaymentStatus.OVERDUE },
    });
    return result.count;
  },

  /**
   * Check if rent already exists for tenant/month/year
   */
  async rentExists(tenantId: string, month: number, year: number) {
    const client = getPrismaClient();
    return client.payment.findFirst({
      where: { tenantId, month, year },
    });
  },

  /**
   * Get payment by ID
   */
  async getById(paymentId: string, propertyUserId?: string) {
    const client = getPrismaClient();
    const payment = await client.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: true,
        property: true,
        activityLogs: true,
      },
    });

    // Verify ownership if userId provided
    if (propertyUserId && payment?.property.ownerId !== propertyUserId) {
      return null;
    }

    return payment;
  },

  /**
   * Get all payments with filters
   */
  async getAll(
    propertyUserId: string,
    filters?: {
      month?: number;
      year?: number;
      propertyId?: string;
      paymentMethod?: string;
      status?: string;
      search?: string;
    },
    pagination?: { page: number; limit: number },
    sorting?: { sortBy: string; order: "asc" | "desc" },
  ) {
    const client = getPrismaClient();
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 10, 100);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      property: { ownerId: propertyUserId },
    };

    if (filters?.month) whereClause.month = filters.month;
    if (filters?.year) whereClause.year = filters.year;
    if (filters?.propertyId) whereClause.propertyId = filters.propertyId;
    if (filters?.paymentMethod) whereClause.paymentMethod = filters.paymentMethod;
    if (filters?.status) whereClause.status = filters.status;

    if (filters?.search) {
      // NOTE: Tenant's phone field is `phone`, not `phoneNumber` — the old
      // filter referenced a field that doesn't exist on the model, which
      // silently produced a Prisma validation error any time a search was
      // combined with this filter.
      whereClause.OR = [
        { tenant: { fullName: { contains: filters.search, mode: "insensitive" } } },
        { tenant: { phone: { contains: filters.search, mode: "insensitive" } } },
        { receiptNumber: { contains: filters.search, mode: "insensitive" } },
        { transactionReference: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sorting?.sortBy) {
      orderBy[sorting.sortBy] = sorting.order || "desc";
    } else {
      orderBy.dueDate = "asc";
    }

    const [payments, total] = await Promise.all([
      client.payment.findMany({
        where: whereClause,
        include: {
          tenant: true,
          property: { select: { id: true, propertyName: true } },
          room: { select: { roomNumber: true } },
          bed: { select: { bedNumber: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      client.payment.count({ where: whereClause }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get payment history for tenant
   */
  async getTenantPaymentHistory(tenantId: string, propertyUserId: string) {
    const client = getPrismaClient();
    return client.payment.findMany({
      where: {
        tenantId,
        property: { ownerId: propertyUserId },
      },
      include: {
        activityLogs: true,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });
  },

  /**
   * Get pending payments
   */
  async getPendingPayments(propertyUserId: string) {
    const client = getPrismaClient();
    return client.payment.findMany({
      where: {
        property: { ownerId: propertyUserId },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      include: {
        tenant: true,
        property: { select: { id: true, propertyName: true } },
        room: { select: { roomNumber: true } },
        bed: { select: { bedNumber: true } },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
  },

  /**
   * Get overdue payments (due date has passed, still unpaid/partially paid).
   * Callers are expected to run `syncOverdueStatuses` first so this is a
   * plain status read rather than a re-derivation — kept here as a direct
   * `dueDate` comparison as well so it's correct even if that sync is ever
   * skipped.
   */
  async getOverduePayments(propertyUserId: string) {
    const client = getPrismaClient();
    return client.payment.findMany({
      where: {
        property: { ownerId: propertyUserId },
        OR: [
          { status: PaymentStatus.OVERDUE },
          {
            status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
            dueDate: { lt: getStartOfDay() },
          },
        ],
      },
      include: {
        tenant: true,
        property: { select: { id: true, propertyName: true } },
        room: { select: { roomNumber: true } },
        bed: { select: { bedNumber: true } },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
  },

  /**
   * Record payment collection
   */
  async recordPayment(
    paymentId: string,
    amountPaid: number,
    lateFee: number,
    discount: number,
    paymentMethod: PaymentMethod,
    referenceNumber: string,
    notes: string,
    receiptNumber: string,
  ) {
    const client = getPrismaClient();
    // Get current payment
    const payment = await client.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) return null;

    // Calculate new values
    const newPaidAmount = Number(payment.paidAmount) + amountPaid;
    const newOutstandingAmount = Math.max(
      0,
      Number(payment.rentAmount) + lateFee - discount - newPaidAmount,
    );
    const newStatus =
      newOutstandingAmount === 0
        ? PaymentStatus.PAID
        : newPaidAmount > 0
          ? PaymentStatus.PARTIAL
          : PaymentStatus.PENDING;

    // Update payment. `receiptNumber` reflects the most recent receipt
    // issued against this rent record — the Payment row is a summary of
    // the month's billing, not a single transaction, so this is a
    // "latest receipt" pointer; the Receipt table (one-to-many) remains
    // the full, authoritative history of every individual payment/receipt.
    const updated = await client.payment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
        status: newStatus,
        lateFee,
        discount,
        paymentMethod,
        transactionReference: referenceNumber,
        notes,
        paymentDate: new Date(),
        receiptNumber,
      },
    });

    logger.info("Payment recorded", { paymentId, amountPaid, status: newStatus, receiptNumber });
    return updated;
  },

  /**
   * Update payment
   */
  async updatePayment(paymentId: string, data: any) {
    const client = getPrismaClient();
    return client.payment.update({
      where: { id: paymentId },
      data,
    });
  },

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string) {
    const client = getPrismaClient();
    const payment = await client.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) return null;

    return client.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
        outstandingAmount: Number(payment.rentAmount) + Number(payment.lateFee) - Number(payment.discount),
      },
    });
  },

  /**
   * Get financial dashboard data
   */
  async getDashboardMetrics(propertyUserId: string) {
    const client = getPrismaClient();
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const whereClause = {
      property: { ownerId: propertyUserId },
    };

    const [
      todayCollection,
      monthlyCollection,
      pendingRent,
      overdueRent,
      totalActiveProperties,
      allPayments,
    ] = await Promise.all([
      client.payment.aggregate({
        where: {
          ...whereClause,
          paymentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: { in: [PaymentStatus.PAID, PaymentStatus.PARTIAL] },
        },
        _sum: { paidAmount: true },
      }),
      client.payment.aggregate({
        where: {
          ...whereClause,
          paymentDate: { gte: startDate, lt: endDate },
          status: { in: [PaymentStatus.PAID, PaymentStatus.PARTIAL] },
        },
        _sum: { paidAmount: true },
      }),
      // `syncOverdueStatuses` (run before this on every read path) already
      // flips any PENDING/PARTIAL row whose due date has passed to OVERDUE,
      // so by the time this query runs, remaining PENDING/PARTIAL rows are
      // guaranteed to be not-yet-due. Pending therefore covers both
      // statuses, and overdue is a plain status read — a PARTIAL payment
      // that isn't due yet must not inflate the overdue total.
      client.payment.aggregate({
        where: { ...whereClause, status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] } },
        _sum: { outstandingAmount: true },
      }),
      client.payment.aggregate({
        where: { ...whereClause, status: PaymentStatus.OVERDUE },
        _sum: { outstandingAmount: true },
      }),
      client.property.count({
        where: { ownerId: propertyUserId, status: "ACTIVE" },
      }),
      client.payment.findMany({
        where: { property: { ownerId: propertyUserId } },
        select: { propertyId: true, paidAmount: true, rentAmount: true },
      }),
    ]);

    // Calculate collection rate
    const totalRent = allPayments.reduce((sum: number, p: any) => sum + Number(p.rentAmount), 0);
    const totalCollected = allPayments.reduce((sum: number, p: any) => sum + Number(p.paidAmount), 0);
    const collectionRate = totalRent > 0 ? (totalCollected / totalRent) * 100 : 0;

    // Top paying property
    const propertyCollection = allPayments.reduce(
      (acc: Record<string, number>, p: any) => {
        acc[p.propertyId] = (acc[p.propertyId] || 0) + Number(p.paidAmount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(propertyCollection as Record<string, number>).sort(
      ([, a], [, b]) => b - a,
    );
    const highestProperty = sorted[0];
    const lowestProperty = Object.entries(propertyCollection as Record<string, number>).sort(
      ([, a], [, b]) => a - b,
    )[0];

    return {
      todayCollection: Number(todayCollection._sum.paidAmount || 0),
      monthlyCollection: Number(monthlyCollection._sum.paidAmount || 0),
      pendingRent: Number(pendingRent._sum.outstandingAmount || 0),
      overdueRent: Number(overdueRent._sum.outstandingAmount || 0),
      collectionRate: Math.round(collectionRate * 100) / 100,
      activeProperties: totalActiveProperties,
      highestPayingProperty: highestProperty ? highestProperty[0] : null,
      lowestPayingProperty: lowestProperty ? lowestProperty[0] : null,
    };
  },

  /**
   * Create activity log
   */
  async createActivityLog(paymentId: string, activityType: string, metadata: Record<string, any>) {
    const client = getPrismaClient();
    return client.paymentActivityLog.create({
      data: {
        paymentId,
        activityType,
        metadata,
      },
    });
  },

  /**
   * Generate receipt metadata
   */
  async createReceipt(
    paymentId: string,
    receiptNumber: string,
    tenantId: string,
    propertyId: string,
    roomId: string,
    bedId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    referenceNumber: string,
  ) {
    const client = getPrismaClient();
    return client.receipt.create({
      data: {
        receiptNumber,
        paymentId,
        tenantId,
        propertyId,
        roomId,
        bedId,
        amount,
        paymentMethod,
        referenceNumber,
        generatedAt: new Date(),
        metadata: {},
      },
    });
  },

  /**
   * Get receipt
   */
  async getReceipt(receiptId: string) {
    const client = getPrismaClient();
    return client.receipt.findUnique({
      where: { id: receiptId },
      include: {
        payment: true,
        tenant: true,
        property: true,
      },
    });
  },
  /**
   * Full payment row for receipt generation (tenant, property, room, bed).
   */
  async getPaymentForReceipt(paymentId: string, ownerId: string) {
    const client = getPrismaClient();
    const payment = await client.payment.findUnique({
      where: { id: paymentId },
      include: { tenant: true, property: true, room: true, bed: true },
    });
    if (!payment || payment.property.ownerId !== ownerId) return null;
    return payment;
  },

  /**
   * The persisted receipt for a payment (latest one wins). Receipts are
   * never duplicated per click — one row per recorded collection.
   */
  async getReceiptByPaymentId(paymentId: string) {
    const client = getPrismaClient();
    return client.receipt.findFirst({
      where: { paymentId },
      orderBy: { generatedAt: "desc" },
      include: { payment: true, tenant: true, property: true, room: true, bed: true },
    });
  },

  /** Backfills a missing receiptNumber pointer on the payment row. */
  async setPaymentReceiptNumber(paymentId: string, receiptNumber: string) {
    const client = getPrismaClient();
    return client.payment.update({ where: { id: paymentId }, data: { receiptNumber } });
  },
};
