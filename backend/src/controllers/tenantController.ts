import { Request, Response } from "express";
import { tenantService } from "../services/tenantService";
import { paymentService } from "../services/paymentService";
import { validateAsync } from "../utils/validation";
import {
  createTenantSchema,
  updateTenantSchema,
  transferBedSchema,
  vacateSchema,
  uploadDocumentSchema,
  tenantSearchSchema,
  CreateTenantRequest,
  UpdateTenantRequest,
  TransferBedRequest,
  VacateRequest,
  UploadDocumentRequest,
  TenantSearchQuery,
} from "../validators/tenant";
import {
  sendSuccessResponse,
  sendErrorResponse,
  validationError,
  ApiError,
  HttpStatusCode,
} from "../utils/errors";
import { logger } from "../utils/logger";

export class TenantController {
  /**
   * Create tenant
   * POST /api/v1/tenants
   */
  async createTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
      }

      const validation = await validateAsync<CreateTenantRequest>(createTenantSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const tenantData = validation.data as CreateTenantRequest;
      const tenant = await tenantService.createTenant(req.user.userId, tenantData);

      return sendSuccessResponse(
        res,
        { tenant },
        "Tenant created successfully",
        HttpStatusCode.CREATED,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error creating tenant:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get tenant by ID
   * GET /api/v1/tenants/:id
   */
  async getTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Tenant ID required", HttpStatusCode.BAD_REQUEST);
      }

      // Make sure this tenant's current-month rent row exists and any
      // overdue status is fresh before returning their payment history.
      await paymentService.ensureCurrentMonthRent(req.user!.userId);

      const tenant = await tenantService.getTenant(id, req.user!.userId);
      return sendSuccessResponse(res, { tenant }, "Tenant retrieved successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error fetching tenant:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllTenants(req: Request, res: Response): Promise<Response | void> {
    try {
      const validation = await validateAsync<TenantSearchQuery>(tenantSearchSchema, req.query);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const query = validation.data as TenantSearchQuery;

      await paymentService.ensureCurrentMonthRent(req.user!.userId);

      const result = await tenantService.getAllTenants({
        ownerId: req.user!.userId,
        propertyId: query.propertyId,
        roomId: query.roomId,
        status: query.status,
        paymentStatus: query.paymentStatus,
        search: query.search,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      return sendSuccessResponse(res, result, "Tenants retrieved successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error fetching tenants:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update tenant
   * PUT /api/v1/tenants/:id
   */
  async updateTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Tenant ID required", HttpStatusCode.BAD_REQUEST);
      }

      const validation = await validateAsync<UpdateTenantRequest>(updateTenantSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const updateData = validation.data as UpdateTenantRequest;
      const tenant = await tenantService.updateTenant(id, req.user!.userId, updateData);

      return sendSuccessResponse(res, { tenant }, "Tenant updated successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error updating tenant:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Transfer tenant to different bed
   * POST /api/v1/tenants/:id/transfer
   */
  async transferBed(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Tenant ID required", HttpStatusCode.BAD_REQUEST);
      }

      const validation = await validateAsync<TransferBedRequest>(transferBedSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const transferData = validation.data as TransferBedRequest;
      const tenant = await tenantService.transferBed(id, req.user!.userId, transferData);

      return sendSuccessResponse(res, { tenant }, "Tenant transferred successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error transferring tenant:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Vacate tenant
   * POST /api/v1/tenants/:id/vacate
   */
  async vacateTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Tenant ID required", HttpStatusCode.BAD_REQUEST);
      }

      const validation = await validateAsync<VacateRequest>(vacateSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const vacateData = validation.data as VacateRequest;
      const tenant = await tenantService.vacateTenant(id, req.user!.userId, vacateData);

      return sendSuccessResponse(res, { tenant }, "Tenant vacated successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error vacating tenant:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Upload tenant document
   * POST /api/v1/tenants/:id/documents
   */
  async uploadDocument(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Tenant ID required", HttpStatusCode.BAD_REQUEST);
      }

      const validation = await validateAsync<UploadDocumentRequest>(uploadDocumentSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const docData = validation.data as UploadDocumentRequest;
      const document = await tenantService.uploadDocument(id, req.user!.userId, docData);

      return sendSuccessResponse(
        res,
        { document },
        "Document uploaded successfully",
        HttpStatusCode.CREATED,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error uploading document:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete tenant
   * DELETE /api/v1/tenants/:id
   */
  async deleteTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params as { id: string };
      if (!id || typeof id !== "string") {
        throw new ApiError("Tenant ID required", HttpStatusCode.BAD_REQUEST);
      }

      await tenantService.deleteTenant(id, req.user!.userId);
      return sendSuccessResponse(res, null, "Tenant deleted successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      logger.error("Error deleting tenant:", error);
      return sendErrorResponse(res, error as Error, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}

export const tenantController = new TenantController();
