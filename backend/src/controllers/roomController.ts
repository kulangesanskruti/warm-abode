import { Request, Response } from "express";
import { roomService } from "../services/roomService";
import { bedRepository } from "../repositories/bedRepository";
import { validateAsync } from "../utils/validation";
import {
  createRoomSchema,
  updateRoomSchema,
  roomQuerySchema,
  updateBedStatusSchema,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomQueryRequest,
} from "../validators/room";
import { sendSuccessResponse, ApiError, HttpStatusCode, validationError } from "../utils/errors";
import { logger } from "../utils/logger";
import { assertBedOwnership } from "../utils/ownership";

export class RoomController {
  /**
   * Create a room
   * POST /api/v1/rooms
   */
  async createRoom(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const validation = await validateAsync<CreateRoomRequest>(createRoomSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const createData = validation.data as CreateRoomRequest;
      const room = await roomService.createRoom(createData.propertyId, req.user.userId, createData);

      logger.info("Room created via API", { userId: req.user.userId, roomId: room.id });
      return sendSuccessResponse(res, room, "Room created successfully", HttpStatusCode.CREATED);
    } catch (error) {
      logger.error("Error in createRoom:", error);
      throw error;
    }
  }

  /**
   * Get room details
   * GET /api/v1/rooms/:id
   */
  async getRoomDetails(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Room ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // SECURITY: any client-supplied propertyId is ignored; ownership is
      // resolved from the room row against the authenticated user.
      const room = await roomService.getRoomDetails(id, req.user.userId);

      return sendSuccessResponse(res, room, "Room details retrieved");
    } catch (error) {
      logger.error("Error in getRoomDetails:", error);
      throw error;
    }
  }

  /**
   * List rooms
   * GET /api/v1/rooms
   */
  async listRooms(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { propertyId, ...queryParams } = req.query;
      if (!propertyId || typeof propertyId !== "string") {
        throw new ApiError("Property ID is required", HttpStatusCode.BAD_REQUEST);
      }

      const validation = await validateAsync<RoomQueryRequest>(roomQuerySchema, {
        ...queryParams,
        page: queryParams.page ? parseInt(queryParams.page as string) : 1,
        limit: queryParams.limit ? parseInt(queryParams.limit as string) : 10,
      });

      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const queryData = validation.data as any;
      const result = await roomService.listRooms(propertyId, req.user.userId, queryData);

      return sendSuccessResponse(res, result, "Rooms retrieved");
    } catch (error) {
      logger.error("Error in listRooms:", error);
      throw error;
    }
  }

  /**
   * Update room
   * PUT /api/v1/rooms/:id
   */
  async updateRoom(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Room ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // SECURITY: any client-supplied propertyId is ignored; ownership is
      // resolved from the room row against the authenticated user.
      const validation = await validateAsync<UpdateRoomRequest>(updateRoomSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const updateData = validation.data as UpdateRoomRequest;
      const room = await roomService.updateRoom(id, req.user.userId, updateData);

      logger.info("Room updated via API", { userId: req.user.userId, roomId: id });
      return sendSuccessResponse(res, room, "Room updated successfully");
    } catch (error) {
      logger.error("Error in updateRoom:", error);
      throw error;
    }
  }

  /**
   * Delete room
   * DELETE /api/v1/rooms/:id
   */
  async deleteRoom(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Room ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // SECURITY: any client-supplied propertyId is ignored; ownership is
      // resolved from the room row against the authenticated user.
      await roomService.deleteRoom(id, req.user.userId);

      logger.info("Room deleted via API", { userId: req.user.userId, roomId: id });
      return sendSuccessResponse(res, null, "Room deleted successfully");
    } catch (error) {
      logger.error("Error in deleteRoom:", error);
      throw error;
    }
  }

  /**
   * Get available beds in room
   * GET /api/v1/rooms/:id/available-beds
   */
  async getAvailableBeds(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Room ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // SECURITY: any client-supplied propertyId is ignored; ownership is
      // resolved from the room row against the authenticated user.
      const beds = await roomService.getAvailableBeds(id, req.user.userId);

      return sendSuccessResponse(res, beds, "Available beds retrieved");
    } catch (error) {
      logger.error("Error in getAvailableBeds:", error);
      throw error;
    }
  }

  /**
   * Get bed details
   * GET /api/v1/rooms/beds/:bedId
   */
  async getBedDetails(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { bedId } = req.params as { bedId: string };
      if (!bedId) {
        throw new ApiError("Bed ID is required", HttpStatusCode.BAD_REQUEST);
      }

      await assertBedOwnership(bedId, req.user.userId);

      const bed = await bedRepository.findById(bedId);
      if (!bed) {
        throw new ApiError("Bed not found", HttpStatusCode.NOT_FOUND);
      }

      return sendSuccessResponse(res, bed, "Bed details retrieved");
    } catch (error) {
      logger.error("Error in getBedDetails:", error);
      throw error;
    }
  }

  /**
   * Update bed status
   * PUT /api/v1/rooms/beds/:bedId/status
   */
  async updateBedStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { bedId } = req.params as { bedId: string };
      if (!bedId) {
        throw new ApiError("Bed ID is required", HttpStatusCode.BAD_REQUEST);
      }

      await assertBedOwnership(bedId, req.user.userId);

      const validation = await validateAsync(updateBedStatusSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const statusData = validation.data as any;
      const bed = await bedRepository.updateStatus(bedId, statusData.status);

      logger.info("Bed status updated via API", { userId: req.user.userId, bedId });
      return sendSuccessResponse(res, bed, "Bed status updated");
    } catch (error) {
      logger.error("Error in updateBedStatus:", error);
      throw error;
    }
  }
}

export const roomController = new RoomController();
