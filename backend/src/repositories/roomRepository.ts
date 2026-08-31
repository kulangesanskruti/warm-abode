import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { Prisma, RoomStatus } from "@prisma/client";

// Lazy load Prisma client

// Type definitions
export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupiedBeds: number;
  rentPerBed: number;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomWithBeds extends Room {
  beds: Array<{
    id: string;
    bedNumber: string;
    status: string;
    currentTenantId: string | null;
  }>;
}

type RoomWithBedsPrisma = Prisma.RoomGetPayload<{
  include: {
    beds: {
      select: {
        id: true;
        bedNumber: true;
        status: true;
        currentTenantId: true;
      };
    };
  };
}>;

export class RoomRepository {
  /**
   * Create a new room
   */
  async create(data: {
    propertyId: string;
    roomNumber: string;
    floor: number;
    capacity: number;
    rentPerBed: number;
    roomType?: string;
    description?: string;
  }): Promise<Room> {
    try {
      const prismaClient = getPrismaClient();
      const room = await prismaClient.room.create({
        data: {
          propertyId: data.propertyId,
          roomNumber: data.roomNumber,
          floor: data.floor,
          capacity: data.capacity,
          occupiedBeds: 0,
          rentPerBed: data.rentPerBed,
          status: RoomStatus.AVAILABLE,
        },
      });
      logger.info("Room created", { roomId: room.id, roomNumber: room.roomNumber });
      return {
        ...room,
        rentPerBed: Number(room.rentPerBed),
      };
    } catch (error) {
      logger.error("Error creating room:", error);
      throw error;
    }
  }

  /**
   * Find room by ID
   */
  async findById(id: string): Promise<RoomWithBeds | null> {
    try {
      const prismaClient = getPrismaClient();
      const room = await prismaClient.room.findUnique({
        where: { id },
        include: {
          beds: {
            select: {
              id: true,
              bedNumber: true,
              status: true,
              currentTenantId: true,
            },
          },
        },
      });
      if (!room) return null;
      return {
        ...room,
        rentPerBed: Number(room.rentPerBed),
      };
    } catch (error) {
      logger.error("Error finding room by ID:", error);
      throw error;
    }
  }

  /**
   * Find room by property and room number
   */
  async findByPropertyAndNumber(propertyId: string, roomNumber: string): Promise<Room | null> {
    try {
      const prismaClient = getPrismaClient();
      const room = await prismaClient.room.findUnique({
        where: {
          propertyId_roomNumber: {
            propertyId,
            roomNumber,
          },
        },
      });
      if (!room) return null;
      return {
        ...room,
        rentPerBed: Number(room.rentPerBed),
      };
    } catch (error) {
      logger.error("Error finding room:", error);
      throw error;
    }
  }

  /**
   * List rooms with filters and pagination
   */
  async listRooms(options: {
    propertyId?: string;
    floor?: number;
    status?: RoomStatus;
    search?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
  }): Promise<{ rooms: RoomWithBeds[]; total: number; pages: number }> {
    try {
      const prismaClient = getPrismaClient();
      // Soft-deleted rooms must never surface in listings or availability.
      const where: any = { deletedAt: null };


      if (options.propertyId) {
        where.propertyId = options.propertyId;
      }
      if (options.floor !== undefined) {
        where.floor = options.floor;
      }
      if (options.status) {
        where.status = options.status;
      }
      if (options.search) {
        where.OR = [{ roomNumber: { contains: options.search, mode: "insensitive" } }];
      }

      const skip = (options.page - 1) * options.limit;
      const orderBy: any = {};
      orderBy[
        options.sortBy === "occupancy"
          ? "occupiedBeds"
          : options.sortBy === "revenue"
            ? "rentPerBed"
            : options.sortBy
      ] = options.sortOrder;

      const [rooms, total] = await Promise.all([
        prismaClient.room.findMany({
          where,
          include: {
            beds: {
              select: {
                id: true,
                bedNumber: true,
                status: true,
                currentTenantId: true,
              },
            },
          },
          skip,
          take: options.limit,
          orderBy,
        }),
        prismaClient.room.count({ where }),
      ]);

      return {
        rooms: rooms.map((room: RoomWithBedsPrisma) => ({
          ...room,
          rentPerBed: Number(room.rentPerBed),
        })),
        total,
        pages: Math.ceil(total / options.limit),
      };
    } catch (error) {
      logger.error("Error listing rooms:", error);
      throw error;
    }
  }

  /**
   * Update room
   */
  async update(
    id: string,
    data: {
      roomNumber?: string;
      floor?: number;
      capacity?: number;
      rentPerBed?: number;
      status?: RoomStatus;
    },
  ): Promise<Room> {
    try {
      const prismaClient = getPrismaClient();
      const room = await prismaClient.room.update({
        where: { id },
        data,
      });
      logger.info("Room updated", { roomId: id });
      return {
        ...room,
        rentPerBed: Number(room.rentPerBed),
      };
    } catch (error) {
      logger.error("Error updating room:", error);
      throw error;
    }
  }

  /**
   * Update occupied beds count
   */
  async updateOccupiedBeds(id: string, count: number): Promise<Room> {
    try {
      const prismaClient = getPrismaClient();
      const room = await prismaClient.room.update({
        where: { id },
        data: { occupiedBeds: count },
      });
      return {
        ...room,
        rentPerBed: Number(room.rentPerBed),
      };
    } catch (error) {
      logger.error("Error updating occupied beds:", error);
      throw error;
    }
  }

  /**
   * Soft delete room
   */
  async softDelete(id: string): Promise<Room> {
    try {
      const prismaClient = getPrismaClient();
      const room = await prismaClient.room.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return {
        ...room,
        rentPerBed: Number(room.rentPerBed),
      };
    } catch (error) {
      logger.error("Error deleting room:", error);
      throw error;
    }
  }

  /**
   * Get active beds count
   */
  async getOccupiedBedsCount(roomId: string): Promise<number> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.bed.count({
        where: {
          roomId,
          status: "OCCUPIED",
        },
      });
    } catch (error) {
      logger.error("Error getting occupied beds count:", error);
      throw error;
    }
  }
}

export const roomRepository = new RoomRepository();
