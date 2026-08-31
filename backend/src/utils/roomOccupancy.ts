import { Prisma } from "@prisma/client";
import { getPrismaClient } from "./prisma";
import { logger } from "./logger";

/**
 * Recomputes a room's denormalised occupancy fields (`occupiedBeds`, `status`)
 * from the authoritative bed rows.
 *
 * Bed status is the single source of truth. Any flow that flips a bed
 * (tenant create / transfer / vacate / delete) MUST call this so room
 * availability stays correct everywhere it is read — the Rooms page, the
 * property summaries and the tenant assignment dropdown.
 */
export async function syncRoomOccupancy(
  client: Prisma.TransactionClient | ReturnType<typeof getPrismaClient>,
  roomId: string | null | undefined,
): Promise<void> {
  if (!roomId) return;

  try {
    const room = await client.room.findUnique({
      where: { id: roomId },
      select: { id: true, capacity: true, status: true },
    });
    if (!room) return;

    const beds = await client.bed.findMany({
      where: { roomId },
      select: { status: true },
    });

    const occupied = beds.filter((b: { status: string }) => b.status === "OCCUPIED").length;
    const vacant = beds.filter((b: { status: string }) => b.status === "VACANT").length;

    // MAINTENANCE is an operator-set state: never overwrite it automatically.
    let status = room.status;
    if (room.status !== "MAINTENANCE") {
      if (vacant === 0 && beds.length > 0) status = "FULL";
      else if (occupied > 0) status = "PARTIALLY_OCCUPIED";
      else status = "AVAILABLE";
    }

    await client.room.update({
      where: { id: roomId },
      data: { occupiedBeds: occupied, status },
    });
  } catch (error) {
    logger.error("Error syncing room occupancy:", error);
    throw error;
  }
}

/**
 * Ensures a room has exactly `capacity` bed rows.
 *
 * Self-heals rooms whose beds were never generated (partial legacy writes, a
 * failed bulk insert, or a capacity bump that missed bed creation). Without
 * bed rows a room reports zero vacant beds and disappears from the tenant
 * form even though it is completely empty.
 */
export async function ensureRoomBeds(
  client: Prisma.TransactionClient | ReturnType<typeof getPrismaClient>,
  roomId: string,
  capacity: number,
): Promise<void> {
  if (!capacity || capacity < 1) return;

  const existing = await client.bed.findMany({
    where: { roomId },
    select: { bedNumber: true },
  });
  if (existing.length >= capacity) return;

  const taken = new Set(existing.map((b: { bedNumber: string }) => b.bedNumber));
  const missing: string[] = [];
  for (let i = 0; i < capacity; i++) {
    const bedNumber = String.fromCharCode(65 + i);
    if (!taken.has(bedNumber)) missing.push(bedNumber);
  }
  if (missing.length === 0) return;

  await client.bed.createMany({
    data: missing.map((bedNumber) => ({ roomId, bedNumber, status: "VACANT" as const })),
    skipDuplicates: true,
  });
  logger.info("Backfilled missing beds for room", { roomId, count: missing.length });
}
