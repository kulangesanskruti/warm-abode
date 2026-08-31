import { z } from "zod";

export const fileCategories = [
  "PROFILE_PHOTO",
  "PROPERTY_IMAGE",
  "TENANT_DOCUMENT",
  "BUSINESS_LOGO",
  "BUSINESS_SIGNATURE",
  "REPORT",
  "RECEIPT",
  "CASHBOOK",
  "ATTACHMENT",
] as const;
export const entityTypes = [
  "USER",
  "PROPERTY",
  "TENANT",
  "REPORT",
  "RECEIPT",
  "CASHBOOK",
  "OTHER",
] as const;

export const fileListSchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.enum(fileCategories).optional(),
  entityType: z.enum(entityTypes).optional(),
  entityId: z.string().min(1).optional(),
  propertyId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  mimeGroup: z.enum(["IMAGE", "PDF"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const fileIdSchema = z.object({ id: z.string().min(1) });
export const fileDeleteSchema = z.object({ id: z.string().min(1) });
export const expirySchema = z.coerce.date().optional();

export type FileListQuery = z.infer<typeof fileListSchema>;
export type FileCategory = (typeof fileCategories)[number];
export type FileEntityType = (typeof entityTypes)[number];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
export const extensionMimeTypes: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  pdf: ["application/pdf"],
};

export function safeFileName(name: string) {
  const normalized = name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.slice(0, 180) || "upload";
}

export function validateFile(file: { originalname: string; mimetype: string; size: number }) {
  if (!file.originalname || !file.mimetype || file.size <= 0)
    throw new Error("Invalid or empty file");
  if (!allowedMimeTypes.has(file.mimetype)) throw new Error("Unsupported file type");
  const ext = file.originalname.toLowerCase().split(".").pop() || "";
  if (!extensionMimeTypes[ext]?.includes(file.mimetype))
    throw new Error("File extension does not match MIME type");
  const max = file.mimetype === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) throw new Error(`File exceeds the ${max / (1024 * 1024)} MB limit`);
  return { safeName: safeFileName(file.originalname), extension: ext };
}
