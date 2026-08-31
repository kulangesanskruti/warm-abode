/**
 * Shared UI types/formatters for the Rent Management screens. Actual rent
 * data comes from the real API via src/lib/payments.ts — this file only
 * holds presentation-layer types and metadata (no tenant/payment records).
 */
export type PaymentStatus = "paid" | "due-soon" | "overdue" | "partial";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Card" | "—";

export interface PaymentRecord {
  id: string;
  tenantId: string;
  month: number;
  year: number;
  name: string;
  phone: string;
  photo: string;
  property: string;
  propertyId: string;
  room: string;
  bed: string;
  monthlyRent: number;
  outstanding: number;
  paidAmount: number;
  dueDate: string;
  paymentDate: string | null;
  /** Negative = overdue by n days, positive = due in n days, 0 = due today */
  daysDelta: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptNo: string;
}

export const statusMeta: Record<
  PaymentStatus,
  { label: string; text: string; bg: string; border: string; dot: string; ring: string }
> = {
  paid: {
    label: "Paid",
    text: "text-success-700",
    bg: "bg-success-50",
    border: "border-success-200",
    dot: "bg-success-500",
    ring: "ring-success-100",
  },
  "due-soon": {
    label: "Due Soon",
    text: "text-warning-700",
    bg: "bg-warning-50",
    border: "border-warning-200",
    dot: "bg-warning-500",
    ring: "ring-warning-100",
  },
  overdue: {
    label: "Overdue",
    text: "text-danger-700",
    bg: "bg-danger-50",
    border: "border-danger-200",
    dot: "bg-danger-500",
    ring: "ring-danger-100",
  },
  partial: {
    label: "Partial Payment",
    text: "text-primary-700",
    bg: "bg-primary-50",
    border: "border-primary-200",
    dot: "bg-primary-500",
    ring: "ring-primary-100",
  },
};

export const inr = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export const methodOptions: (PaymentMethod | "All Methods")[] = [
  "All Methods",
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
];

/** Real, currently-selectable billing months — most recent first. */
export function recentMonths(count = 6): { label: string; month: number; year: number }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    };
  });
}
