import { z } from "zod";

// Enums
export const PropertyStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export type PropertyStatus = z.infer<typeof PropertyStatusEnum>;

// Create Property Schema
export const createPropertySchema = z.object({
  propertyName: z
    .string()
    .min(3, "Property name must be at least 3 characters")
    .max(100, "Property name must not exceed 100 characters"),
  propertyType: z
    .string()
    .min(2, "Property type is required")
    .max(50, "Property type must not exceed 50 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must not exceed 50 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must not exceed 50 characters"),
  totalFloors: z
    .number()
    .int()
    .min(1, "Total floors must be at least 1")
    .max(100, "Total floors must not exceed 100"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
});

export type CreatePropertyRequest = z.infer<typeof createPropertySchema>;

// Update Property Schema
export const updatePropertySchema = z
  .object({
    propertyName: z
      .string()
      .min(3, "Property name must be at least 3 characters")
      .max(100, "Property name must not exceed 100 characters")
      .optional(),
    propertyType: z
      .string()
      .min(2, "Property type is required")
      .max(50, "Property type must not exceed 50 characters")
      .optional(),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address must not exceed 200 characters")
      .optional(),
    city: z
      .string()
      .min(2, "City must be at least 2 characters")
      .max(50, "City must not exceed 50 characters")
      .optional(),
    state: z
      .string()
      .min(2, "State must be at least 2 characters")
      .max(50, "State must not exceed 50 characters")
      .optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be 6 digits")
      .optional(),
    country: z
      .string()
      .min(2, "Country must be at least 2 characters")
      .max(50, "Country must not exceed 50 characters")
      .optional(),
    totalFloors: z
      .number()
      .int()
      .min(1, "Total floors must be at least 1")
      .max(100, "Total floors must not exceed 100")
      .optional(),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .nullable(),
    imageUrl: z.string().url("Invalid image URL").optional().nullable(),
    status: PropertyStatusEnum.optional(),
  })
  .strict();

export type UpdatePropertyRequest = z.infer<typeof updatePropertySchema>;

// Query Schema
export const propertyQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["name", "createdAt", "city", "updatedAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  status: PropertyStatusEnum.optional(),
  city: z.string().optional(),
  propertyType: z.string().optional(),
});

export type PropertyQuery = z.infer<typeof propertyQuerySchema>;

// Upload Image Schema
export const uploadPropertyImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
});

export type UploadPropertyImageRequest = z.infer<typeof uploadPropertyImageSchema>;
