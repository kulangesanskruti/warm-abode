import { getPrismaClient } from "./prisma";
import { ApiError, HttpStatusCode } from "./errors";

/**
 * Ownership guards.
 *
 * SECURITY: resource ownership is ALWAYS derived from the database using the
 * authenticated user's id. A propertyId supplied by the client is never
 * trusted as proof of access — it is only ever used as a lookup key that is
 * then validated against `property.ownerId`.
 *
 * Contract:
 *  - resource does not exist (or is soft-deleted) -> 404
 *  - resource exists but belongs to another owner -> 403
 */

export interface OwnedProperty {
  id: string;
  ownerId: string;
}

/** Verify the property exists and belongs to `ownerId`. */
export const assertPropertyOwnership = async (
  propertyId: string,
  ownerId: string,
): Promise<OwnedProperty> => {
  const client = getPrismaClient();
  const property = await client.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, ownerId: true },
  });

  if (!property) {
    throw new ApiError("Property not found", HttpStatusCode.NOT_FOUND);
  }
  if (property.ownerId !== ownerId) {
    throw new ApiError("You do not have access to this property", HttpStatusCode.FORBIDDEN);
  }

  return property;
};

/**
 * Resolve a room from its own id and verify the owning property belongs to
 * `ownerId`. The property is derived from the room row, never from input.
 */
export const assertRoomOwnership = async (
  roomId: string,
  ownerId: string,
): Promise<{ id: string; propertyId: string }> => {
  const client = getPrismaClient();
  const room = await client.room.findFirst({
    where: { id: roomId, deletedAt: null },
    select: { id: true, propertyId: true, property: { select: { ownerId: true } } },
  });

  if (!room) {
    throw new ApiError("Room not found", HttpStatusCode.NOT_FOUND);
  }
  if (room.property.ownerId !== ownerId) {
    throw new ApiError("You do not have access to this room", HttpStatusCode.FORBIDDEN);
  }

  return { id: room.id, propertyId: room.propertyId };
};

/**
 * Resolve a bed from its own id and verify the owning property belongs to
 * `ownerId`, walking bed -> room -> property entirely in the database.
 */
export const assertBedOwnership = async (
  bedId: string,
  ownerId: string,
): Promise<{ id: string; roomId: string; propertyId: string }> => {
  const client = getPrismaClient();
  const bed = await client.bed.findUnique({
    where: { id: bedId },
    select: {
      id: true,
      roomId: true,
      room: {
        select: { propertyId: true, deletedAt: true, property: { select: { ownerId: true } } },
      },
    },
  });

  if (!bed || bed.room.deletedAt !== null) {
    throw new ApiError("Bed not found", HttpStatusCode.NOT_FOUND);
  }
  if (bed.room.property.ownerId !== ownerId) {
    throw new ApiError("You do not have access to this bed", HttpStatusCode.FORBIDDEN);
  }

  return { id: bed.id, roomId: bed.roomId, propertyId: bed.room.propertyId };
};

/**
 * Resolve a tenant and verify the owning property belongs to `ownerId`.
 */
export const assertTenantOwnership = async (
  tenantId: string,
  ownerId: string,
): Promise<{ id: string; propertyId: string }> => {
  const client = getPrismaClient();
  const tenant = await client.tenant.findFirst({
    where: { id: tenantId, deletedAt: null },
    select: { id: true, propertyId: true, property: { select: { ownerId: true } } },
  });

  if (!tenant) {
    throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
  }
  if (tenant.property.ownerId !== ownerId) {
    throw new ApiError("You do not have access to this tenant", HttpStatusCode.FORBIDDEN);
  }

  return { id: tenant.id, propertyId: tenant.propertyId };
};
