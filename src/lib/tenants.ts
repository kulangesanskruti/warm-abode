/**
 * Shared tenant types + mappers for the `/api/v1/tenants` endpoints.
 *
 * Everything the tenant screens render comes from these shapes — there is no
 * mock/sample tenant anywhere in the UI.
 */
import { apiRequest, apiUpload } from "@/lib/api";

export type TenantPaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "OVERDUE" | string;

export type ApiPayment = {
  id: string;
  month: number;
  year: number;
  rentAmount: number | string;
  paidAmount: number | string;
  outstandingAmount: number | string;
  paymentMethod: string;
  paymentDate: string | null;
  status: TenantPaymentStatus;
  receiptNumber: string | null;
};

export type ApiDocument = {
  id: string;
  documentType: string;
  fileUrl: string;
  uploadedAt: string;
};

export type ApiActivityLog = {
  id: string;
  action: string;
  description: string | null;
  createdAt: string;
};

/** A tenant row as returned by GET /tenants (list). */
export type ApiTenantListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  monthlyRent: number;
  securityDeposit?: number;
  status: string;
  moveInDate: string;
  property?: string;
  room?: string;
  bed?: string;
  photoUrl?: string | null;
  payments?: ApiPayment[];
};

/** A tenant as returned by GET /tenants/:id (envelope: { tenant }). */
export type ApiTenantDetail = ApiTenantListItem & {
  gender?: string | null;
  occupation?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  permanentAddress?: string | null;
  expectedVacateDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  propertyId?: string;
  roomId?: string;
  bedId?: string;
  documents?: ApiDocument[];
  activityLogs?: ApiActivityLog[];
};

export type UiPaymentStatus = "paid" | "due" | "overdue" | "vacating";

export const inr = (value?: number | string | null): string =>
  `₹${Math.round(Number(value ?? 0)).toLocaleString("en-IN")}`;

export const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Human "x months" since move-in, derived from the real move-in date. */
export function tenureLabel(moveInDate?: string | null): string {
  if (!moveInDate) return "—";
  const start = new Date(moveInDate).getTime();
  if (Number.isNaN(start)) return "—";
  const days = Math.max(Math.floor((Date.now() - start) / 86_400_000), 0);
  if (days < 31) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years}y ${rest}m` : `${years} year${years === 1 ? "" : "s"}`;
}

export function paymentStatusOf(tenant: {
  status?: string;
  payments?: ApiPayment[];
}): UiPaymentStatus {
  if (tenant.status === "VACATING") return "vacating";
  const latest = tenant.payments?.[0];
  if (!latest) return "due";
  if (latest.status === "PAID") return "paid";
  if (latest.status === "OVERDUE") return "overdue";
  return "due";
}

export function totalPaid(payments: ApiPayment[] = []): number {
  return payments.reduce((sum, p) => sum + Number(p.paidAmount ?? 0), 0);
}

export const monthLabel = (month: number, year: number): string => {
  const date = new Date(year, Math.max(month - 1, 0), 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export type TenantsListResponse = {
  tenants: ApiTenantListItem[];
  pagination: { total: number; page: number; limit: number; pages: number };
};

export const fetchTenants = (query: string) =>
  apiRequest<TenantsListResponse>(`/tenants${query ? `?${query}` : ""}`);

export const fetchTenant = (id: string) =>
  apiRequest<{ tenant: ApiTenantDetail }>(`/tenants/${id}`).then((res) => res.tenant);

export type UpdateTenantBody = {
  fullName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  gender?: string | undefined;
  occupation?: string | undefined;
  emergencyContact?: string | undefined;
  emergencyPhone?: string | undefined;
  permanentAddress?: string | undefined;
  monthlyRent?: number | undefined;
  securityDeposit?: number | undefined;
  expectedVacateDate?: string | undefined;
  notes?: string | undefined;
};

export const updateTenant = (id: string, body: UpdateTenantBody) =>
  apiRequest<{ tenant: ApiTenantDetail }>(`/tenants/${id}`, { method: "PUT", body });

export const deleteTenant = (id: string) =>
  apiRequest<unknown>(`/tenants/${id}`, { method: "DELETE" });

/** Query keys invalidated after any tenant write (occupancy can change). */
export const TENANT_WRITE_INVALIDATIONS = [
  ["tenants"],
  ["tenant"],
  ["properties"],
  ["rooms"],
  ["beds"],
  ["dashboard"],
] as const;

// Must mirror the backend prisma DocumentType enum exactly.
export const DOCUMENT_TYPES = [
  "AADHAAR",
  "PASSPORT",
  "DRIVER_LICENSE",
  "RENTAL_AGREEMENT",
  "UTILITY_BILL",
  "OTHER",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const documentLabel = (type: string): string =>
  type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/** Uploads the file, then links the stored URL to the tenant as a document. */
export async function uploadTenantDocument(
  tenantId: string,
  file: File,
  documentType: DocumentType,
): Promise<ApiDocument> {
  const asset = await apiUpload<{ url: string }>("/files/tenant-document", file, {
    category: "TENANT_DOCUMENT",
    entityType: "TENANT",
    entityId: tenantId,
    tenantId,
  });
  if (!asset?.url) throw new Error("Upload succeeded but no file URL was returned.");
  const documentUrl = /^https?:\/\//i.test(asset.url)
    ? asset.url
    : `${typeof window === "undefined" ? "" : window.location.origin}${asset.url}`;
  const res = await apiRequest<{ document: ApiDocument }>(`/tenants/${tenantId}/documents`, {
    method: "POST",
    body: { documentType, documentUrl },
  });
  return res.document;
}

/** Tenant notes are a single stored text field on the tenant record. */
export const saveTenantNotes = (id: string, notes: string) => updateTenant(id, { notes });

export type VacateTenantBody = {
  vacatingDate: string;
  reason: string;
  securityDepositReturned: number;
  finalNotes?: string;
};

/** Existing backend endpoint: POST /api/v1/tenants/:id/vacate */
export const vacateTenant = (id: string, body: VacateTenantBody) =>
  apiRequest<{ tenant: ApiTenantDetail }>(`/tenants/${id}/vacate`, { method: "POST", body });
