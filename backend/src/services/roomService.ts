import { RoomStatus as PrismaRoomStatus } from "@prisma/client";
import { roomRepository } from "../repositories/roomRepository";
import { bedRepository } from "../repositories/bedRepository";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { logger } from "../utils/logger";
import { ensureRoomBeds } from "../utils/roomOccupancy";
import { getPrismaClient } from "../utils/prisma";
import { BedStatus, CreateRoomRequest, UpdateRoomRequest } from "../validators/room";

import {
  assertBedOwnership,
  assertPropertyOwnership,
  assertRoomOwnership,
} from "../utils/ownership";

// Generate bed letters (A, B, C, D, etc.)
const generateBedNumbers = (capacity: number): string[] => {
  const bedLetters = [];
  for (let i = 0; i < capacity; i++) {
    bedLetters.push(String.fromCharCode(65 + i)); // A, B, C, D...
  }
  return bedLetters;
};

export class RoomService {
  /**
   * Create a room with automatic bed generation
   */
  async createRoom(propertyId: string, ownerId: string, data: CreateRoomRequest): Promise<any> {
    try {
      // SECURITY: property must exist AND belong to the authenticated owner.
      await assertPropertyOwnership(propertyId, ownerId);

      // Check for duplicate room number
      const existingRoom = await roomRepository.findByPropertyAndNumber(
        propertyId,
        data.roomNumber,
      );
      if (existingRoom) {
        throw new ApiError(
          `Room number ${data.roomNumber} already exists in this property`,
          HttpStatusCode.CONFLICT,
        );
      }

      // Create room
      const room = await roomRepository.create({
        propertyId,
        roomNumber: data.roomNumber,
        floor: data.floor,
        capacity: data.capacity,
        rentPerBed: data.rentPerBed,
        roomType: data.roomType,
        description: data.description,
      });

      // Generate bed letters and create beds. ensureRoomBeds is idempotent, so
      // a retried/partial insert can never leave a room without vacant beds.
      const bedNumbers = generateBedNumbers(data.capacity);
      await bedRepository.createBulk(room.id, bedNumbers).catch(() => undefined);
      await ensureRoomBeds(getPrismaClient(), room.id, data.capacity);


      logger.info("Room created with beds", {
        roomId: room.id,
        bedCount: data.capacity,
      });

      return room;
    } catch (error) {
      logger.error("Error creating room:", error);
      throw error;
    }
  }

  /**
   * Update room with optional capacity change
   */
  async updateRoom(roomId: string, ownerId: string, data: UpdateRoomRequest): Promise<any> {
    try {
      // SECURITY: ownership derived from the room row, not from client input.
      const { propertyId } = await assertRoomOwnership(roomId, ownerId);

      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new ApiError("Room not found", HttpStatusCode.NOT_FOUND);
      }

      // Check for duplicate room number if changing it
      if (data.roomNumber && data.roomNumber !== room.roomNumber) {
        const existing = await roomRepository.findByPropertyAndNumber(propertyId, data.roomNumber);
        if (existing) {
          throw new ApiError(
            `Room number ${data.roomNumber} already exists`,
            HttpStatusCode.CONFLICT,
          );
        }
      }

      // Handle capacity increase
      if (data.capacity && data.capacity > room.capacity) {
        const newBedCount = data.capacity - room.capacity;
        const startLetter = room.capacity;
        const newBedNumbers = Array.from({ length: newBedCount }).map((_, idx) =>
          String.fromCharCode(65 + startLetter + idx),
        );
        await bedRepository.createBulk(roomId, newBedNumbers);
        logger.info("Beds added to room", { roomId, count: newBedCount });
      }

      // Handle capacity decrease
      if (data.capacity && data.capacity < room.capacity) {
        const occupiedCount = await bedRepository.countByStatus(roomId, BedStatus.OCCUPIED);
        if (occupiedCount > data.capacity) {
          throw new ApiError(
            `Cannot reduce capacity below occupied beds (${occupiedCount} occupied)`,
            HttpStatusCode.BAD_REQUEST,
          );
        }

        // Validate no occupied beds in removal range
        const beds = await bedRepository.findByRoom(roomId);
        const bedsToDelete = beds.slice(data.capacity);
        for (const bedToRemove of bedsToDelete) {
          if (bedToRemove.status === BedStatus.OCCUPIED) {
            throw new ApiError("Cannot delete occupied beds", HttpStatusCode.BAD_REQUEST);
          }
        }
      }

      const updatedRoom = await roomRepository.update(roomId, {
        roomNumber: data.roomNumber,
        floor: data.floor,
        capacity: data.capacity,
        rentPerBed: data.rentPerBed,
        status: data.status as PrismaRoomStatus,
      });
      logger.info("Room updated", { roomId });

      return updatedRoom;
    } catch (error) {
      logger.error("Error updating room:", error);
      throw error;
    }
  }

  /**
   * Get room with details
   */
  async getRoomDetails(roomId: string, ownerId: string): Promise<any> {
    try {
      await assertRoomOwnership(roomId, ownerId);

      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new ApiError("Room not found", HttpStatusCode.NOT_FOUND);
      }

      const occupiedCount = room.beds.filter((b: any) => b.status === BedStatus.OCCUPIED).length;
      const vacantCount = room.beds.filter((b: any) => b.status === BedStatus.VACANT).length;

      return {
        ...room,
        occupiedBeds: occupiedCount,
        vacantBeds: vacantCount,
        occupancyPercentage: ((occupiedCount / room.capacity) * 100).toFixed(2),
        monthlyRevenue: room.rentPerBed * occupiedCount * 30,
      };
    } catch (error) {
      logger.error("Error getting room details:", error);
      throw error;
    }
  }

  /**
   * List rooms with filtering
   */
  async listRooms(propertyId: string, ownerId: string, options: any): Promise<any> {
    try {
      await assertPropertyOwnership(propertyId, ownerId);

      const result = await roomRepository.listRooms({
        ...options,
        // Always last: an undefined propertyId in the query options must never
        // widen the query to every property.
        propertyId,
      });

      // Self-heal rooms whose beds were never generated — otherwise a brand new,
      // completely empty room reports 0 vacant beds and vanishes from the
      // tenant assignment dropdown.
      const roomsMissingBeds = result.rooms.filter(
        (room: any) => (room.beds?.length ?? 0) < room.capacity,
      );
      if (roomsMissingBeds.length > 0) {
        const prisma = getPrismaClient();
        for (const room of roomsMissingBeds) {
          await ensureRoomBeds(prisma, room.id, room.capacity);
        }
        const healed = await roomRepository.listRooms({ ...options, propertyId });
        result.rooms = healed.rooms;
        result.total = healed.total;
        result.pages = healed.pages;
      }

      return {
        rooms: result.rooms.map((room: any) => {
          const beds = room.beds ?? [];
          const occupiedBeds = beds.filter((b: any) => b.status === BedStatus.OCCUPIED).length;
          const vacantBeds = beds.filter((b: any) => b.status === BedStatus.VACANT).length;
          return {
            ...room,
            occupiedBeds,
            vacantBeds,
            isAvailable: vacantBeds > 0 && room.status !== "MAINTENANCE",
            occupancyPercentage:
              room.capacity > 0 ? ((occupiedBeds / room.capacity) * 100).toFixed(2) : "0.00",
          };
        }),
        total: result.total,
        pages: result.pages,
      };
    } catch (error) {
      logger.error("Error listing rooms:", error);
      throw error;
    }
  }


  /**
   * Delete room (soft delete)
   */
  async deleteRoom(roomId: string, ownerId: string): Promise<any> {
    try {
      await assertRoomOwnership(roomId, ownerId);

      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new ApiError("Room not found", HttpStatusCode.NOT_FOUND);
      }

      const occupiedCount = room.beds.filter((b: any) => b.status === BedStatus.OCCUPIED).length;
      if (occupiedCount > 0) {
        throw new ApiError(
          `Cannot delete room with ${occupiedCount} occupied beds`,
          HttpStatusCode.BAD_REQUEST,
        );
      }

      return await roomRepository.softDelete(roomId);
    } catch (error) {
      logger.error("Error deleting room:", error);
      throw error;
    }
  }

  /**
   * Get available beds in room
   */
  async getAvailableBeds(roomId: string, ownerId: string): Promise<any> {
    try {
      await assertRoomOwnership(roomId, ownerId);

      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new ApiError("Room not found", HttpStatusCode.NOT_FOUND);
      }

      // Guarantee the room's beds exist before reporting vacancies.
      await ensureRoomBeds(getPrismaClient(), roomId, room.capacity);

      return await bedRepository.getVacantBeds(roomId);

    } catch (error) {
      logger.error("Error getting available beds:", error);
      throw error;
    }
  }

  /**
   * Assign bed to tenant (for future tenant module)
   */
  async assignBedToTenant(
    bedId: string,
    tenantId: string,
    roomId: string,
    ownerId: string,
  ): Promise<any> {
    try {
      await assertRoomOwnership(roomId, ownerId);
      await assertBedOwnership(bedId, ownerId);

      const bed = await bedRepository.findById(bedId);
      if (!bed) {
        throw new ApiError("Bed not found", HttpStatusCode.NOT_FOUND);
      }

      if (bed.roomId !== roomId) {
        throw new ApiError("Bed does not belong to this room", HttpStatusCode.BAD_REQUEST);
      }

      if (bed.status !== BedStatus.VACANT) {
        throw new ApiError("Bed is not vacant", HttpStatusCode.BAD_REQUEST);
      }

      return await bedRepository.assignTenant(bedId, tenantId);
    } catch (error) {
      logger.error("Error assigning bed to tenant:", error);
      throw error;
    }
  }

  /**
   * Vacate bed (for future tenant module)
   */
  async vacateBed(bedId: string, roomId: string, ownerId: string): Promise<any> {
    try {
      await assertRoomOwnership(roomId, ownerId);
      await assertBedOwnership(bedId, ownerId);

      const bed = await bedRepository.findById(bedId);
      if (!bed) {
        throw new ApiError("Bed not found", HttpStatusCode.NOT_FOUND);
      }

      return await bedRepository.vacate(bedId);
    } catch (error) {
      logger.error("Error vacating bed:", error);
      throw error;
    }
  }
}

export const roomService = new RoomService();
