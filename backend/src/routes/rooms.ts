import { Router } from "express";
import { roomController } from "../controllers/roomController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/errors";

const router = Router();

/**
 * @route POST /api/v1/rooms
 * @description Create a new room with automatic bed generation
 * @access Protected
 * @body {propertyId, roomNumber, floor, capacity, rentPerBed, roomType, description}
 * @returns {room}
 */
router.post(
  "/",
  authenticate,
  asyncHandler((req, res) => roomController.createRoom(req, res)),
);

/**
 * @route GET /api/v1/rooms/:id
 * @description Get room details with bed information
 * @access Protected
 * @query {propertyId}
 * @returns {room with details}
 */
router.get(
  "/:id",
  authenticate,
  asyncHandler((req, res) => roomController.getRoomDetails(req, res)),
);

/**
 * @route GET /api/v1/rooms
 * @description List rooms with filters and pagination
 * @access Protected
 * @query {propertyId, page, limit, search, floor, status, sortBy, sortOrder}
 * @returns {rooms, total, pages}
 */
router.get(
  "/",
  authenticate,
  asyncHandler((req, res) => roomController.listRooms(req, res)),
);

/**
 * @route PUT /api/v1/rooms/:id
 * @description Update room (supports capacity increase/decrease)
 * @access Protected
 * @query {propertyId}
 * @body {roomNumber, floor, capacity, rentPerBed, status, description}
 * @returns {room}
 */
router.put(
  "/:id",
  authenticate,
  asyncHandler((req, res) => roomController.updateRoom(req, res)),
);

/**
 * @route DELETE /api/v1/rooms/:id
 * @description Soft delete room (only if no occupied beds)
 * @access Protected
 * @query {propertyId}
 * @returns {success message}
 */
router.delete(
  "/:id",
  authenticate,
  asyncHandler((req, res) => roomController.deleteRoom(req, res)),
);

/**
 * @route GET /api/v1/rooms/:id/available-beds
 * @description Get available (vacant) beds in a room
 * @access Protected
 * @query {propertyId}
 * @returns {beds array}
 */
router.get(
  "/:id/available-beds",
  authenticate,
  asyncHandler((req, res) => roomController.getAvailableBeds(req, res)),
);

/**
 * @route GET /api/v1/rooms/beds/:bedId
 * @description Get bed details
 * @access Protected
 * @returns {bed}
 */
router.get(
  "/beds/:bedId",
  authenticate,
  asyncHandler((req, res) => roomController.getBedDetails(req, res)),
);

/**
 * @route PUT /api/v1/rooms/beds/:bedId/status
 * @description Update bed status
 * @access Protected
 * @body {status}
 * @returns {bed}
 */
router.put(
  "/beds/:bedId/status",
  authenticate,
  asyncHandler((req, res) => roomController.updateBedStatus(req, res)),
);

export default router;
