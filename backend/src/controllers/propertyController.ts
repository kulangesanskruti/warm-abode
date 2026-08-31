import { Request, Response } from "express";
import { propertyService } from "../services/propertyService";
import { validateAsync } from "../utils/validation";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
  uploadPropertyImageSchema,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyQuery,
  UploadPropertyImageRequest,
} from "../validators/property";
import { sendSuccessResponse, ApiError, HttpStatusCode, validationError } from "../utils/errors";
import { logger } from "../utils/logger";

export class PropertyController {
  /**
   * Create Property
   * POST /api/v1/properties
   */
  async createProperty(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      // Validate request
      const validation = await validateAsync<CreatePropertyRequest>(createPropertySchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const createData = validation.data as CreatePropertyRequest;
      const property = await propertyService.createProperty(req.user.userId, createData);

      return sendSuccessResponse(
        res,
        property,
        "Property created successfully",
        HttpStatusCode.CREATED,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error creating property:", error);
      throw new ApiError("Failed to create property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get All Properties
   * GET /api/v1/properties
   */
  async getAllProperties(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      // Validate query
      const validation = await validateAsync<PropertyQuery>(propertyQuerySchema, req.query);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const queryData = validation.data as PropertyQuery;
      const result = await propertyService.getAllProperties(req.user.userId, queryData);

      return sendSuccessResponse(
        res,
        {
          properties: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        "Properties retrieved successfully",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error fetching properties:", error);
      throw new ApiError("Failed to fetch properties", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get Property By ID
   * GET /api/v1/properties/:id
   */
  async getPropertyById(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Property ID is required", HttpStatusCode.BAD_REQUEST);
      }

      const property = await propertyService.getPropertyById(id, req.user.userId);

      return sendSuccessResponse(res, property, "Property retrieved successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error fetching property by ID:", error);
      throw new ApiError("Failed to fetch property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update Property
   * PUT /api/v1/properties/:id
   */
  async updateProperty(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Property ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // Validate request
      const validation = await validateAsync<UpdatePropertyRequest>(updatePropertySchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const updateData = validation.data as UpdatePropertyRequest;
      const property = await propertyService.updateProperty(id, req.user.userId, updateData);

      return sendSuccessResponse(res, property, "Property updated successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error updating property:", error);
      throw new ApiError("Failed to update property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete Property (soft by default, permanent with ?permanent=true)
   * DELETE /api/v1/properties/:id
   */
  async deleteProperty(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Property ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // ?permanent=true removes the property and all of its floors/rooms/tenants
      const permanent = String(req.query["permanent"] ?? "").toLowerCase() === "true";

      await propertyService.deleteProperty(id, req.user.userId, permanent);

      return sendSuccessResponse(
        res,
        undefined,
        permanent
          ? "Property and all related floors, rooms and tenant records deleted successfully"
          : "Property deleted successfully",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error deleting property:", error);
      throw new ApiError("Failed to delete property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Upload Property Image
   * POST /api/v1/properties/:id/image
   */
  async uploadImage(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Property ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // Validate request
      const validation = await validateAsync<UploadPropertyImageRequest>(
        uploadPropertyImageSchema,
        req.body,
      );
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const uploadData = validation.data as UploadPropertyImageRequest;
      const property = await propertyService.uploadPropertyImage(
        id,
        req.user.userId,
        uploadData.imageUrl,
      );

      return sendSuccessResponse(res, property, "Property image uploaded successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error uploading property image:", error);
      throw new ApiError("Failed to upload property image", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}

export const propertyController = new PropertyController();
