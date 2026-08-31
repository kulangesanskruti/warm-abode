import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analyticsService";
import { reportService } from "../services/reportService";
import { reportRepository } from "../repositories/reportRepository";
import {
  analyticsQuerySchema,
  generateReportSchema,
  listReportsSchema,
} from "../validators/report";
import { validateAsync } from "../utils/validation";
import { ApiError, HttpStatusCode, validationError } from "../utils/errors";

const parsed = async (schema: any, value: unknown) => {
  const result = await validateAsync(schema, value);
  if (!result.isValid) throw validationError(result.errors);
  return result.data as any;
};
const filters = (query: any) => ({
  from: query.startDate,
  to: query.endDate,
  propertyId: query.propertyId,
  roomId: query.roomId,
  tenantId: query.tenantId,
  status: query.status,
  paymentMethod: query.paymentMethod,
});
const userId = (req: Request) => {
  if (!req.user?.userId) throw new ApiError("Authentication required", HttpStatusCode.UNAUTHORIZED);
  return req.user.userId;
};
const send = (res: Response, message: string, data: unknown, status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });

export const reportController = {
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await parsed(analyticsQuerySchema, req.query);
      send(
        res,
        "Dashboard analytics retrieved successfully",
        await analyticsService.dashboard(userId(req), filters(query)),
      );
    } catch (e) {
      next(e);
    }
  },
  async health(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await parsed(analyticsQuerySchema, req.query);
      send(
        res,
        "Business health retrieved successfully",
        await analyticsService.businessHealth(userId(req), filters(query)),
      );
    } catch (e) {
      next(e);
    }
  },
  async revenue(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await parsed(analyticsQuerySchema, req.query);
      send(
        res,
        "Revenue analytics retrieved successfully",
        await analyticsService.revenue(userId(req), filters(query)),
      );
    } catch (e) {
      next(e);
    }
  },
  async occupancy(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await parsed(analyticsQuerySchema, req.query);
      send(
        res,
        "Occupancy analytics retrieved successfully",
        await analyticsService.occupancy(userId(req), filters(query)),
      );
    } catch (e) {
      next(e);
    }
  },
  async cashbook(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await parsed(analyticsQuerySchema, req.query);
      const result = await analyticsService.cashbook(userId(req), filters(query));
      const id = `cashbook-${Date.now()}`;
      await reportRepository.logActivity(userId(req), "CASHBOOK_GENERATED", "REPORT", id);
      send(res, "Cashbook retrieved successfully", result);
    } catch (e) {
      next(e);
    }
  },
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const input = await parsed(generateReportSchema, req.body);
      send(
        res,
        "Report generated successfully",
        await reportService.generate(userId(req), input),
        201,
      );
    } catch (e) {
      next(e);
    }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await parsed(listReportsSchema, req.query);
      send(
        res,
        "Reports retrieved successfully",
        await reportRepository.listReports(userId(req), query),
      );
    } catch (e) {
      next(e);
    }
  },
  async details(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportRepository.getReport(userId(req), String(req.params.id));
      if (!report) throw new ApiError("Report not found", HttpStatusCode.NOT_FOUND);
      send(res, "Report details retrieved successfully", report);
    } catch (e) {
      next(e);
    }
  },
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { report, buffer } = await reportService.readFile(userId(req), String(req.params.id));
      await reportRepository.logActivity(
        userId(req),
        `${report.fileFormat}_EXPORTED`,
        "REPORT",
        report.id,
      );
      const contentType =
        report.fileFormat === "PDF"
          ? "application/pdf"
          : report.fileFormat === "EXCEL"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : report.fileFormat === "CSV"
              ? "text/csv"
              : "application/json";
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, "_")}.${report.fileFormat === "EXCEL" ? "xlsx" : report.fileFormat.toLowerCase()}"`,
      );
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      send(
        res,
        "Report deleted successfully",
        await reportService.delete(userId(req), String(req.params.id)),
      );
    } catch (e) {
      next(e);
    }
  },
  async regenerate(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportRepository.getReport(userId(req), String(req.params.id));
      if (!report) throw new ApiError("Report not found", HttpStatusCode.NOT_FOUND);
      send(
        res,
        "Report regenerated successfully",
        await reportService.regenerate(userId(req), report),
        201,
      );
    } catch (e) {
      next(e);
    }
  },
  async receipt(req: Request, res: Response, next: NextFunction) {
    try {
      const buffer = await reportService.receipt(userId(req), String(req.params.receiptId));
      await reportRepository.logActivity(
        userId(req),
        "RECEIPT_GENERATED",
        "RECEIPT",
        String(req.params.receiptId),
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="receipt-${String(req.params.receiptId)}.pdf"`,
      );
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  },
};
