import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService";
import { paymentRepository } from "../repositories/paymentRepository";
import { validateAsync } from "../utils/validation";
import {
  generateMonthlyRentSchema,
  collectRentSchema,
  partialPaymentSchema,
  updatePaymentSchema,
  getPaymentsSchema,
  dashboardFiltersSchema,
  GenerateMonthlyRentRequest,
  CollectRentRequest,
  PartialPaymentRequest,
  UpdatePaymentRequest,
} from "../validators/payment";
import { ApiError, HttpStatusCode, validationError } from "../utils/errors";
import { fileExportService } from "../services/fileExportService";

export const paymentController = {
  /**
   * POST /api/v1/payments/generate-monthly
   * Generate monthly rent for all active tenants
   */
  async generateMonthlyRent(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const validation = await validateAsync(generateMonthlyRentSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const data = validation.data as GenerateMonthlyRentRequest;
      const result = await paymentService.generateMonthlyRent(
        req.user!.userId,
        data.month,
        data.year,
        data.propertyId,
      );

      res.json({
        success: true,
        message: "Monthly rent generated successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/payments/collect
   * Collect rent payment
   */
  async collectRent(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const validation = await validateAsync(collectRentSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const data = validation.data as CollectRentRequest;
      const result = await paymentService.collectRent(req.user!.userId, data);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Rent collected successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/payments/partial
   * Record partial payment
   */
  async recordPartialPayment(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const validation = await validateAsync(partialPaymentSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      const data = validation.data as PartialPaymentRequest;
      const result = await paymentService.recordPartialPayment(req.user!.userId, data);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Partial payment recorded successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments
   * List all payments
   */
  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query params
      const validation = await validateAsync(getPaymentsSchema, req.query);
      if (!validation.isValid) {
        throw new ApiError(
          "Invalid query parameters",
          HttpStatusCode.BAD_REQUEST,
          validation.errors as any,
        );
      }

      const query = validation.data as any;

      // Auto-generate this month's rent rows and sync overdue status before
      // reading — the same self-healing step used by the pending/overdue/
      // dashboard endpoints, so the plain list view is never stale either.
      await paymentService.ensureCurrentMonthRent(req.user!.userId);

      const result = await paymentRepository.getAll(
        req.user!.userId,
        {
          month: query.month,
          year: query.year,
          propertyId: query.propertyId,
          paymentMethod: query.paymentMethod,
          status: query.status,
          search: query.search,
        },
        {
          page: query.page || 1,
          limit: query.limit || 10,
        },
        {
          sortBy: query.sortBy || "paymentDate",
          order: query.order || "desc",
        },
      );

      res.json({
        success: true,
        message: "Payments retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/:id
   * Get payment details
   */
  async getPaymentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Payment ID is required", HttpStatusCode.BAD_REQUEST);
      }

      const payment = await paymentRepository.getById(id, req.user!.userId);
      if (!payment) {
        throw new ApiError("Payment not found", HttpStatusCode.NOT_FOUND);
      }

      res.json({
        success: true,
        message: "Payment details retrieved successfully",
        data: payment,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/history/:tenantId
   * Get tenant payment history
   */
  async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params as { tenantId: string };

      if (!tenantId || typeof tenantId !== "string") {
        throw new ApiError("Tenant ID is required", HttpStatusCode.BAD_REQUEST);
      }

      await paymentService.ensureCurrentMonthRent(req.user!.userId);

      const history = await paymentRepository.getTenantPaymentHistory(tenantId, req.user!.userId);

      res.json({
        success: true,
        message: "Payment history retrieved successfully",
        data: history,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/payments/:id
   * Update payment
   */
  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Payment ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // Validate request
      const validation = await validateAsync(updatePaymentSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }

      // Verify ownership
      const payment = await paymentRepository.getById(id, req.user!.userId);
      if (!payment) {
        throw new ApiError("Payment not found", HttpStatusCode.NOT_FOUND);
      }

      const data = validation.data as UpdatePaymentRequest;
      const updated = await paymentRepository.updatePayment(id, data);

      // Log activity
      await paymentRepository.createActivityLog(id, "PAYMENT_UPDATED", data);

      res.json({
        success: true,
        message: "Payment updated successfully",
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/pending
   * Get pending payments
   */
  async getPendingPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const pending = await paymentService.getPendingPayments(req.user!.userId);

      res.json({
        success: true,
        message: "Pending payments retrieved successfully",
        data: pending,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/overdue
   * Get overdue payments
   */
  async getOverduePayments(req: Request, res: Response, next: NextFunction) {
    try {
      const overdue = await paymentService.getOverduePayments(req.user!.userId);

      res.json({
        success: true,
        message: "Overdue payments retrieved successfully",
        data: overdue,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/dashboard
   * Financial dashboard
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate filters
      const validation = await validateAsync(dashboardFiltersSchema, req.query);
      if (!validation.isValid) {
        throw new ApiError("Invalid filters", HttpStatusCode.BAD_REQUEST, validation.errors as any);
      }

      const filters = validation.data as any;
      const metrics = await paymentService.getDashboardMetrics(
        req.user!.userId,
        filters.month,
        filters.year,
      );

      res.json({
        success: true,
        message: "Dashboard metrics retrieved successfully",
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/payments/:id/cancel
   * Cancel payment
   */
  async cancelPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        throw new ApiError("Payment ID is required", HttpStatusCode.BAD_REQUEST);
      }

      // Verify ownership
      const payment = await paymentRepository.getById(id, req.user!.userId);
      if (!payment) {
        throw new ApiError("Payment not found", HttpStatusCode.NOT_FOUND);
      }

      const cancelled = await paymentRepository.cancelPayment(id);

      // Log activity
      await paymentRepository.createActivityLog(id, "PAYMENT_CANCELLED", {
        previousStatus: payment.status,
        outstandingAmount: cancelled?.outstandingAmount,
      });

      res.json({
        success: true,
        message: "Payment cancelled successfully",
        data: cancelled,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/receipt/:receiptId
   * Get receipt
   */
  async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { receiptId } = req.params as { receiptId: string };

      if (!receiptId || typeof receiptId !== "string") {
        throw new ApiError("Receipt ID is required", HttpStatusCode.BAD_REQUEST);
      }

      const receipt = await paymentRepository.getReceipt(receiptId);
      if (!receipt) {
        throw new ApiError("Receipt not found", HttpStatusCode.NOT_FOUND);
      }

      // Verify ownership
      if (receipt.property.ownerId !== req.user!.userId) {
        throw new ApiError("Unauthorized", HttpStatusCode.FORBIDDEN);
      }

      res.json({
        success: true,
        message: "Receipt retrieved successfully",
        data: receipt,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * GET /api/v1/payments/:id/receipt
   * Rent receipt for a collected payment (ownership enforced in service)
   */
  async getPaymentReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      if (!id) throw new ApiError("Payment ID is required", HttpStatusCode.BAD_REQUEST);

      const receipt = await paymentService.getPaymentReceipt(req.user!.userId, id);

      res.json({
        success: true,
        message: "Receipt retrieved successfully",
        data: receipt,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/payments/:id/receipt/pdf
   * Same receipt data, rendered as a downloadable PDF
   */
  async getPaymentReceiptPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      if (!id) throw new ApiError("Payment ID is required", HttpStatusCode.BAD_REQUEST);

      const receipt = await paymentService.getPaymentReceipt(req.user!.userId, id);
      const buffer = await fileExportService.rentReceipt(receipt);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="receipt-${String(receipt.receiptNumber).replace(/[^a-z0-9-]/gi, "_")}.pdf"`,
      );
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  },
};
