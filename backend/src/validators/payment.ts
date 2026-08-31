import { z } from "zod";

// ============================================
// Enums
// ============================================

export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CASH = "CASH",
  UPI = "UPI",
  BANK_TRANSFER = "BANK_TRANSFER",
  CARD = "CARD",
}

export enum ActivityType {
  RENT_GENERATED = "RENT_GENERATED",
  PAYMENT_COLLECTED = "PAYMENT_COLLECTED",
  PARTIAL_PAYMENT = "PARTIAL_PAYMENT",
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  PAYMENT_CANCELLED = "PAYMENT_CANCELLED",
  RECEIPT_GENERATED = "RECEIPT_GENERATED",
}

// ============================================
// Validation Schemas
// ============================================

export const generateMonthlyRentSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  propertyId: z.string().min(1).optional(),
});

export const collectRentSchema = z.object({
  tenantId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  amountPaid: z.number().min(0.01),
  lateFee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.UPI,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CARD,
  ]),
  referenceNumber: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const partialPaymentSchema = z.object({
  tenantId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  amountPaid: z.number().min(0.01),
  paymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.UPI,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CARD,
  ]),
  referenceNumber: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const updatePaymentSchema = z.object({
  amountPaid: z.number().min(0.01).optional(),
  lateFee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z
    .enum([PaymentMethod.CASH, PaymentMethod.UPI, PaymentMethod.BANK_TRANSFER, PaymentMethod.CARD])
    .optional(),
  referenceNumber: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const getPaymentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  month: z.string().transform(Number).optional(),
  year: z.string().transform(Number).optional(),
  propertyId: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const dashboardFiltersSchema = z.object({
  month: z.string().transform(Number).optional(),
  year: z.string().transform(Number).optional(),
  propertyId: z.string().optional(),
});

// ============================================
// Type Exports
// ============================================

export type GenerateMonthlyRentRequest = z.infer<typeof generateMonthlyRentSchema>;
export type CollectRentRequest = z.infer<typeof collectRentSchema>;
export type PartialPaymentRequest = z.infer<typeof partialPaymentSchema>;
export type UpdatePaymentRequest = z.infer<typeof updatePaymentSchema>;
export type GetPaymentsRequest = z.infer<typeof getPaymentsSchema>;
export type DashboardFiltersRequest = z.infer<typeof dashboardFiltersSchema>;
