/**
 * Shared payment/rent types + API calls for the `/api/v1/payments`
 * endpoints, plus an adapter that maps a real Payment row (as returned by
 * the backend, with tenant/property/room/bed included) into the
 * `PaymentRecord` shape the existing Rent Management UI components expect.
 *
 * There is no mock/sample payment anywhere in this file or in the screens
 * that consume it — every value comes from the API.
 */
import { apiRequest, API_BASE_URL, getAccessToken } from "@/lib/api";
import type { PaymentMethod, PaymentRecord, PaymentStatus as UiStatus } from "@/components/rent/rentData";

export type ApiPaymentStatus = "PENDING" | "PARTIAL" | "OVERDUE" | "PAID" | "CANCELLED" | "REFUNDED";

export type ApiPaymentTenant = {
  id: string;
  fullName: string;
  phone: string;
  photoUrl?: string | null;
  monthlyRent?: number | string;
};

export type ApiPaymentProperty = {
  id: string;
  propertyName: string;
};

export type ApiPayment = {
  id: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  bedId: string;
  month: number;
  year: number;
  rentAmount: number | string;
  paidAmount: number | string;
  outstandingAmount: number | string;
  lateFee: number | string;
  discount: number | string;
  paymentMethod: string;
  transactionReference: string | null;
  paymentDate: string | null;
  dueDate: string | null;
  status: ApiPaymentStatus;
  receiptNumber: string | null;
  notes: string | null;
  createdAt: string;
  tenant?: ApiPaymentTenant | null;
  property?: ApiPaymentProperty | null;
  room?: { roomNumber: string } | null;
  bed?: { bedNumber: string } | null;
};

export type PaymentsListResponse = {
  payments: ApiPayment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type DashboardMetrics = {
  todayCollection: number;
  monthlyCollection: number;
  pendingRent: number;
  overdueRent: number;
  collectionRate: number;
  activeProperties: number;
  highestPayingProperty: string | null;
  lowestPayingProperty: string | null;
};

export const fetchPayments = (query: string) =>
  apiRequest<PaymentsListResponse>(`/payments${query ? `?${query}` : ""}`);

export const fetchPaymentDashboard = () => apiRequest<DashboardMetrics>("/payments/dashboard");

export const fetchTenantPaymentHistoryRaw = (tenantId: string) =>
  apiRequest<ApiPayment[]>(`/payments/history/${tenantId}`);

export type CollectRentBody = {
  tenantId: string;
  month: number;
  year: number;
  amountPaid: number;
  lateFee?: number;
  discount?: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CARD";
  referenceNumber?: string;
  notes?: string;
};

export const collectRent = (body: CollectRentBody) =>
  apiRequest<{ payment: ApiPayment; receiptNumber: string; status: string }>("/payments/collect", {
    method: "POST",
    body,
  });

export const recordPartialPayment = (body: Omit<CollectRentBody, "lateFee" | "discount">) =>
  apiRequest<{ payment: ApiPayment; receiptNumber: string; status: string }>("/payments/partial", {
    method: "POST",
    body,
  });

export type GenerateMonthlyRentBody = {
  month: number;
  year: number;
  propertyId?: string;
};

export type GenerateMonthlyRentResult = {
  generated: number;
  skipped: number;
  errors: string[];
};

export const generateMonthlyRent = (body: GenerateMonthlyRentBody) =>
  apiRequest<GenerateMonthlyRentResult>("/payments/generate-monthly", {
    method: "POST",
    body,
  });

/** Query keys invalidated after any rent/payment write. */
export const PAYMENT_WRITE_INVALIDATIONS = [
  ["payments"],
  ["tenants"],
  ["tenant"],
  ["dashboard"],
] as const;

export const num = (value: unknown): number => Number(value ?? 0) || 0;

const methodLabel: Record<string, PaymentMethod> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
};

export const toApiPaymentMethod = (label: PaymentMethod): CollectRentBody["paymentMethod"] => {
  const entry = Object.entries(methodLabel).find(([, l]) => l === label);
  return (entry?.[0] as CollectRentBody["paymentMethod"]) ?? "CASH";
};

const formatDueDate = (iso: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Whole-day difference between the due date and now (negative = overdue). */
const daysUntil = (iso: string | null): number => {
  if (!iso) return 0;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return 0;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDue = new Date(due);
  startOfDue.setHours(0, 0, 0, 0);
  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
};

const toUiStatus = (payment: ApiPayment): UiStatus => {
  if (payment.status === "PAID") return "paid";
  if (payment.status === "OVERDUE") return "overdue";
  if (payment.status === "PARTIAL") return "partial";
  // PENDING (not yet due) — the UI's "due-soon" bucket covers every rent
  // that's been generated but not yet paid or overdue.
  return "due-soon";
};

/** A simple "initials on a colour" avatar — used whenever a tenant has no
 * uploaded photo, so the UI never falls back to a fake stock photo. */
export function initialsAvatar(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
  const colors = ["4f46e5", "0891b2", "059669", "d97706", "dc2626", "7c3aed"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const bg = colors[hash % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="#${bg}"/><text x="50%" y="53%" dy=".1em" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="700" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Maps a real API payment row into the `PaymentRecord` shape the existing
 * Rent Management cards/modals were built against, so those components
 * don't need to be redesigned — only fed real data instead of the mock
 * array they used to import from rentData.ts.
 */
export function toPaymentRecord(payment: ApiPayment): PaymentRecord {
  const tenantName = payment.tenant?.fullName ?? "Unknown Tenant";
  const daysDelta = daysUntil(payment.dueDate);
  const monthlyRent = num(payment.rentAmount);
  const outstanding = num(payment.outstandingAmount);
  const paidAmount = num(payment.paidAmount);

  return {
    id: payment.id,
    tenantId: payment.tenantId,
    month: payment.month,
    year: payment.year,
    name: tenantName,
    phone: payment.tenant?.phone ?? "—",
    photo: payment.tenant?.photoUrl || initialsAvatar(tenantName),
    property: payment.property?.propertyName ?? "—",
    propertyId: payment.propertyId,
    room: payment.room?.roomNumber ?? "—",
    bed: payment.bed?.bedNumber ?? "—",
    monthlyRent,
    outstanding,
    paidAmount,
    dueDate: formatDueDate(payment.dueDate),
    paymentDate: payment.paymentDate,
    daysDelta,
    method: payment.paymentMethod ? (methodLabel[payment.paymentMethod] ?? "—") : "—",
    status: toUiStatus(payment),
    receiptNo: payment.receiptNumber ?? "—",
  };
}

/** Rent receipt DTO returned by GET /payments/:id/receipt. */
export type RentReceipt = {
  receiptId: string;
  receiptNumber: string;
  status: "PAID" | "PARTIAL";
  paymentId: string;
  generatedAt: string;
  paymentDate: string;
  dueDate: string | null;
  month: number;
  year: number;
  rentAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  lateFee: number;
  discount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
  tenant: { id: string; fullName: string; phone: string; email: string | null };
  property: {
    id: string;
    propertyName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  room: { number: string };
  bed: { number: string };
  owner: { fullName: string; phone: string | null; email: string | null };
};

export const fetchPaymentReceipt = (paymentId: string) =>
  apiRequest<RentReceipt>(`/payments/${paymentId}/receipt`);

/** True when this payment has money collected against it, i.e. a receipt exists. */
export const isReceiptAvailable = (record: { status: string; paidAmount: number }) =>
  (record.status === "paid" || record.status === "partial") && record.paidAmount > 0;

/**
 * Downloads the server-rendered receipt PDF (pdfkit, same data as the
 * on-screen receipt) and saves it via a temporary object URL.
 */
export async function downloadReceiptPdf(paymentId: string, receiptNumber: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/receipt/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to generate the receipt PDF.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${receiptNumber.replace(/[^a-z0-9-]/gi, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const monthLabel = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const formatReceiptDate = (iso: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const methodDisplay = (code: string | null | undefined) =>
  code ? (methodLabel[code] ?? code.replace(/_/g, " ")) : "—";

/** WhatsApp share text for a receipt — real values only. */
export function receiptWhatsAppText(receipt: RentReceipt): string {
  const lines = [
    `*StayHub Rent Receipt*`,
    `Receipt No: ${receipt.receiptNumber}`,
    `Tenant: ${receipt.tenant.fullName}`,
    `Property: ${receipt.property.propertyName} · Room ${receipt.room.number} · Bed ${receipt.bed.number}`,
    `Month: ${monthLabel(receipt.month, receipt.year)}`,
    `Rent: ₹${Math.round(receipt.rentAmount).toLocaleString("en-IN")}`,
    `Amount Paid: ₹${Math.round(receipt.amountPaid).toLocaleString("en-IN")}`,
    `Method: ${methodDisplay(receipt.paymentMethod)}`,
  ];
  if (receipt.referenceNumber) lines.push(`Reference: ${receipt.referenceNumber}`);
  if (receipt.outstandingAmount > 0)
    lines.push(`Outstanding: ₹${Math.round(receipt.outstandingAmount).toLocaleString("en-IN")}`);
  lines.push(`Status: ${receipt.status}`);
  lines.push(`Paid on ${formatReceiptDate(receipt.paymentDate)}`);
  lines.push(`— ${receipt.owner.fullName}`);
  return lines.join("\n");
}
