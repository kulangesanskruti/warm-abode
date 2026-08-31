import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { BedStatus } from "@prisma/client";

// Lazy load Prisma client

// Type definitions
export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: BedStatus;
  currentTenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class BedRepository {
  /**
   * Bulk create beds for a room
   */
  async createBulk(roomId: string, bedNumbers: string[]): Promise<Bed[]> {
    try {
      const prismaClient = getPrismaClient();
      const beds = await prismaClient.bed.createManyAndReturn({
        data: bedNumbers.map((bedNumber) => ({
          roomId,
          bedNumber,
          status: BedStatus.VACANT,
        })),
      });
      logger.info("Beds created", { roomId, count: beds.length });
      return beds;
    } catch (error) {
      logger.error("Error creating beds:", error);
      throw error;
    }
  }

  /**
   * Get bed by ID
   */
  async findById(id: string): Promise<Bed | null> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error("Error finding bed:", error);
      throw error;
    }
  }

  /**
   * Get beds by room
   */
  async findByRoom(roomId: string): Promise<Bed[]> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.findMany({
        where: { roomId },
        orderBy: { bedNumber: "asc" },
      });
    } catch (error) {
      logger.error("Error finding beds by room:", error);
      throw error;
    }
  }

  /**
   * Get vacant beds in room
   */
  async getVacantBeds(roomId: string): Promise<Bed[]> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.findMany({
        where: {
          roomId,
          status: BedStatus.VACANT,
        },
      });
    } catch (error) {
      logger.error("Error getting vacant beds:", error);
      throw error;
    }
  }

  /**
   * Update bed status
   */
  async updateStatus(id: string, status: BedStatus): Promise<Bed> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      logger.error("Error updating bed status:", error);
      throw error;
    }
  }

  /**
   * Assign bed to tenant
   */
  async assignTenant(id: string, tenantId: string): Promise<Bed> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.update({
        where: { id },
        data: {
          currentTenantId: tenantId,
          status: BedStatus.OCCUPIED,
        },
      });
    } catch (error) {
      logger.error("Error assigning tenant to bed:", error);
      throw error;
    }
  }

  /**
   * Vacate bed
   */
  async vacate(id: string): Promise<Bed> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.update({
        where: { id },
        data: {
          currentTenantId: null,
          status: BedStatus.VACANT,
        },
      });
    } catch (error) {
      logger.error("Error vacating bed:", error);
      throw error;
    }
  }

  /**
   * Count beds by status
   */
  async countByStatus(roomId: string, status: BedStatus): Promise<number> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.count({
        where: {
          roomId,
          status,
        },
      });
    } catch (error) {
      logger.error("Error counting beds by status:", error);
      throw error;
    }
  }

  /**
   * Delete beds for a room
   */
  async deleteByRoom(roomId: string): Promise<void> {
    try {
      const prismaClient = getPrismaClient();
      await prismaClient.bed.deleteMany({
        where: { roomId },
      });
      logger.info("Beds deleted for room", { roomId });
    } catch (error) {
      logger.error("Error deleting beds:", error);
      throw error;
    }
  }
}

export const bedRepository = new BedRepository();
