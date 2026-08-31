import { z } from "zod";

// Room status enum
export enum RoomStatus {
  AVAILABLE = "AVAILABLE",
  PARTIALLY_OCCUPIED = "PARTIALLY_OCCUPIED",
  FULL = "FULL",
  MAINTENANCE = "MAINTENANCE",
}

// Bed status enum
// Must mirror prisma's BedStatus enum exactly (VACANT | OCCUPIED |
// MAINTENANCE) — this validator previously also accepted "RESERVED", which
// isn't a value the database enum supports. That let a request pass
// validation here and then fail with an unhandled Prisma error when
// bedRepository.updateStatus() tried to persist it, instead of failing
// cleanly with a 400.
export enum BedStatus {
  VACANT = "VACANT",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
}

// ============================================
// ROOM VALIDATION SCHEMAS
// ============================================

export const createRoomSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  roomNumber: z.string().min(1, "Room number is required").max(50),
  floor: z.coerce.number().int().min(0, "Floor cannot be negative"),
  capacity: z
    .number()
    .int()
    .min(1, "Capacity must be at least 1")
    .max(20, "Capacity cannot exceed 20"),
  rentPerBed: z.number().positive("Rent per bed must be positive"),
  roomType: z.string().min(2, "Room type is required").max(50),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").max(50).optional(),
  floor: z.coerce.number().int().min(0, "Floor cannot be negative").optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(20).optional(),
  rentPerBed: z.number().positive("Rent per bed must be positive").optional(),
  roomType: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  status: z
    .enum([
      RoomStatus.AVAILABLE,
      RoomStatus.PARTIALLY_OCCUPIED,
      RoomStatus.FULL,
      RoomStatus.MAINTENANCE,
    ])
    .optional(),
});

export const roomQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  propertyId: z.string().optional(),
  floor: z.coerce.number().int().optional(),
  status: z
    .enum([
      RoomStatus.AVAILABLE,
      RoomStatus.PARTIALLY_OCCUPIED,
      RoomStatus.FULL,
      RoomStatus.MAINTENANCE,
    ])
    .optional(),
  sortBy: z.enum(["roomNumber", "floor", "occupancy", "revenue"]).default("roomNumber"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ============================================
// BED VALIDATION SCHEMAS
// ============================================

export const updateBedStatusSchema = z.object({
  status: z.enum([BedStatus.VACANT, BedStatus.OCCUPIED, BedStatus.MAINTENANCE]),
});

export const bedQuerySchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  status: z
    .enum([BedStatus.VACANT, BedStatus.OCCUPIED, BedStatus.MAINTENANCE])
    .optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;
export type UpdateRoomRequest = z.infer<typeof updateRoomSchema>;
export type RoomQueryRequest = z.infer<typeof roomQuerySchema>;
export type UpdateBedStatusRequest = z.infer<typeof updateBedStatusSchema>;
export type BedQueryRequest = z.infer<typeof bedQuerySchema>;
