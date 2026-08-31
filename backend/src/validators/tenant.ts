import { z } from "zod";

// Tenant status enum
export enum TenantStatus {
  ACTIVE = "ACTIVE",
  VACATING = "VACATING",
  LEFT = "LEFT",
}

// Payment status enum
export enum PaymentStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  OVERDUE = "OVERDUE",
}

// Document type enum
// Must mirror prisma's DocumentType enum exactly. This previously listed
// PAN, PHOTO, and POLICE_VERIFICATION (none of which exist in the database
// enum) and was missing PASSPORT and UTILITY_BILL (which do). A request
// using any of the old bogus values passed validation here and then failed
// with an unhandled Prisma "invalid enum value" error instead of a clean
// 400; PASSPORT/UTILITY_BILL uploads were rejected by validation even
// though the database fully supports them.
export enum DocumentType {
  AADHAAR = "AADHAAR",
  PASSPORT = "PASSPORT",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  RENTAL_AGREEMENT = "RENTAL_AGREEMENT",
  UTILITY_BILL = "UTILITY_BILL",
  OTHER = "OTHER",
}

// Activity type enum
export enum ActivityType {
  TENANT_CREATED = "TENANT_CREATED",
  PROFILE_UPDATED = "PROFILE_UPDATED",
  BED_ASSIGNED = "BED_ASSIGNED",
  ROOM_CHANGED = "ROOM_CHANGED",
  RENT_COLLECTED = "RENT_COLLECTED",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
  TENANT_VACATED = "TENANT_VACATED",
  TENANT_DELETED = "TENANT_DELETED",
}

// Create Tenant Schema
export const createTenantSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  occupation: z.string().min(2).max(100),
  dateOfBirth: z.string().datetime().optional(),
  emergencyContact: z.string().min(2).max(100),
  emergencyPhone: z.string().min(10).max(15),
  permanentAddress: z.string().min(10).max(500),
  photoUrl: z.string().url().optional(),
  monthlyRent: z.number().positive(),
  // Security deposit is optional on the form and the client sends 0 when the
  // field is left blank, so 0 must be accepted here — `positive()` rejected
  // it, which made every tenant with no deposit unsavable.
  securityDeposit: z.number().nonnegative().optional().default(0),
  moveInDate: z.string().datetime(),
  expectedVacateDate: z.string().datetime().optional(),
  propertyId: z.string().min(1),
  roomId: z.string().min(1),
  bedId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

// Update Tenant Schema
export const updateTenantSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  occupation: z.string().min(2).max(100).optional(),
  emergencyContact: z.string().min(2).max(100).optional(),
  emergencyPhone: z.string().min(10).max(15).optional(),
  permanentAddress: z.string().min(10).max(500).optional(),
  photoUrl: z.string().url().optional(),
  monthlyRent: z.number().positive().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  expectedVacateDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

// Assign Bed Schema
export const assignBedSchema = z.object({
  bedId: z.string().min(1),
  roomId: z.string().min(1),
  propertyId: z.string().min(1),
});

// Transfer Bed Schema
export const transferBedSchema = z.object({
  newBedId: z.string().min(1),
  newRoomId: z.string().min(1),
  newPropertyId: z.string().min(1),
  reason: z.string().min(2).max(200).optional(),
});

// Vacate Schema
export const vacateSchema = z.object({
  vacatingDate: z.string().datetime(),
  reason: z.string().min(2).max(200),
  securityDepositReturned: z.number().nonnegative(),
  finalNotes: z.string().max(500).optional(),
});

// Upload Document Schema
export const uploadDocumentSchema = z.object({
  documentType: z.enum([
    DocumentType.AADHAAR,
    DocumentType.PASSPORT,
    DocumentType.DRIVER_LICENSE,
    DocumentType.RENTAL_AGREEMENT,
    DocumentType.UTILITY_BILL,
    DocumentType.OTHER,
  ]),
  documentUrl: z.string().url(),
  notes: z.string().max(200).optional(),
});

// Search Query Schema
export const tenantSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "VACATING", "LEFT"]).optional(),
  // Filters directly against Payment.status (tenantRepository.findAll),
  // so this must accept the full Prisma PaymentStatus enum — it previously
  // allowed only PAID/PENDING/OVERDUE, silently rejecting legitimate
  // searches for tenants with a PARTIAL, CANCELLED, or REFUNDED payment.
  paymentStatus: z.enum(["PAID", "PENDING", "OVERDUE", "PARTIAL", "CANCELLED", "REFUNDED"]).optional(),
  propertyId: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["fullName", "moveInDate", "monthlyRent", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type CreateTenantRequest = z.infer<typeof createTenantSchema>;
export type UpdateTenantRequest = z.infer<typeof updateTenantSchema>;
export type AssignBedRequest = z.infer<typeof assignBedSchema>;
export type TransferBedRequest = z.infer<typeof transferBedSchema>;
export type VacateRequest = z.infer<typeof vacateSchema>;
export type UploadDocumentRequest = z.infer<typeof uploadDocumentSchema>;
export type TenantSearchQuery = z.infer<typeof tenantSearchSchema>;
