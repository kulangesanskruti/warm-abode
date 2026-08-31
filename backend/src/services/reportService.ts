import fs from "fs/promises";
import path from "path";
import { analyticsService } from "./analyticsService";
import { fileExportService } from "./fileExportService";
import { reportRepository, ReportFilters } from "../repositories/reportRepository";
import { ReportDataset } from "../utils/reportTypes";
import { GenerateReportRequest } from "../validators/report";
import { ApiError, HttpStatusCode } from "../utils/errors";

const storageRoot = path.resolve(
  process.env.REPORT_STORAGE_PATH || path.join(process.cwd(), "storage", "reports"),
);
const safe = (value: unknown) => String(value ?? "").replace(/[^a-zA-Z0-9._-]/g, "_");
const filtersFor = (input: any): ReportFilters => ({
  from: input.startDate,
  to: input.endDate,
  propertyId: input.propertyId,
  roomId: input.roomId,
  tenantId: input.tenantId,
  status: input.status,
  paymentMethod: input.paymentMethod,
});

export const reportService = {
  async dataset(ownerId: string, input: any): Promise<ReportDataset> {
    const filters = filtersFor(input);
    const type = input.reportType;
    if (type === "ROOM_OCCUPANCY") {
      const result = await analyticsService.occupancy(ownerId, filters);
      return {
        title: input.title,
        columns: [
          "roomId",
          "propertyId",
          "roomNumber",
          "capacity",
          "occupiedBeds",
          "vacantBeds",
          "occupancy",
          "revenue",
        ],
        rows: result.rooms,
        summary: { rooms: result.rooms.length },
        chartPlaceholder: "Occupancy chart",
      };
    }
    if (type === "CASHBOOK") {
      const result = await analyticsService.cashbook(ownerId, filters);
      return {
        title: input.title,
        columns: ["date", "income", "expenses", "closing"],
        rows: result.dailySummary,
        summary: {
          openingBalance: result.openingBalance,
          income: result.income,
          expenses: result.expenses,
          closingBalance: result.closingBalance,
        },
      };
    }
    if (type === "BUSINESS_SUMMARY") {
      const result = await analyticsService.dashboard(ownerId, filters);
      return {
        title: input.title,
        columns: ["metric", "value"],
        rows: Object.entries(result).map(([metric, value]) => ({ metric, value })),
        summary: result,
      };
    }
    if (type === "TENANT_REPORT") {
      const tenants: any[] = await reportRepository.tenants(ownerId, filters);
      return {
        title: input.title,
        columns: ["id", "fullName", "property", "room", "status", "monthlyRent"],
        rows: tenants.map((t) => ({
          id: t.id,
          fullName: t.fullName,
          property: t.property.propertyName,
          room: t.room.roomNumber,
          status: t.status,
          monthlyRent: Number(t.monthlyRent),
        })),
      };
    }
    const payments: any[] = await reportRepository.payments(ownerId, filters);
    const rows = payments
      .filter((p) =>
        type === "PENDING_RENT"
          ? ["PENDING", "PARTIAL"].includes(p.status)
          : type === "OVERDUE_RENT"
            ? p.status === "OVERDUE"
            : true,
      )
      .map((p) => ({
        id: p.id,
        date: p.paymentDate,
        tenant: p.tenant.fullName,
        property: p.property.propertyName,
        room: p.room.roomNumber,
        status: p.status,
        rentAmount: Number(p.rentAmount),
        paidAmount: Number(p.paidAmount),
        outstandingAmount: Number(p.outstandingAmount),
        paymentMethod: p.paymentMethod,
      }));
    return {
      title: input.title,
      columns: [
        "id",
        "date",
        "tenant",
        "property",
        "room",
        "status",
        "rentAmount",
        "paidAmount",
        "outstandingAmount",
        "paymentMethod",
      ],
      rows,
      summary: {
        count: rows.length,
        paidAmount: rows.reduce((s, p: any) => s + p.paidAmount, 0),
        outstandingAmount: rows.reduce((s, p: any) => s + p.outstandingAmount, 0),
      },
    };
  },
  async generate(ownerId: string, input: GenerateReportRequest) {
    const dataset = await this.dataset(ownerId, input);
    if (!dataset.rows.length)
      throw new ApiError("Report contains no records", HttpStatusCode.NOT_FOUND);
    const buffer =
      input.exportFormat === "PDF"
        ? await fileExportService.pdf(dataset, {
            watermark: input.watermark,
            signature: input.signature,
          })
        : input.exportFormat === "EXCEL"
          ? await fileExportService.excel(dataset)
          : input.exportFormat === "CSV"
            ? await fileExportService.csv(dataset)
            : await fileExportService.json(dataset);
    await fs.mkdir(storageRoot, { recursive: true });
    const fileName = `${Date.now()}-${safe(input.reportType)}.${input.exportFormat.toLowerCase() === "excel" ? "xlsx" : input.exportFormat.toLowerCase()}`;
    const filePath = path.join(storageRoot, fileName);
    await fs.writeFile(filePath, buffer);
    const report = await reportRepository.createReport({
      title: input.title,
      ownerId,
      propertyId: input.propertyId,
      reportType: input.reportType,
      fileUrl: filePath,
      fileFormat: input.exportFormat,
      fileSize: buffer.length,
    });
    await reportRepository.logActivity(
      ownerId,
      "REPORT_GENERATED",
      "REPORT",
      report.id,
      `${input.reportType} ${input.exportFormat} generated`,
    );
    if (input.exportFormat === "PDF")
      await reportRepository.logActivity(ownerId, "PDF_GENERATED", "REPORT", report.id);
    return {
      ...report,
      preview: {
        columns: dataset.columns,
        rowCount: dataset.rows.length,
        summary: dataset.summary,
      },
    };
  },
  async regenerate(ownerId: string, report: any) {
    return this.generate(ownerId, {
      title: report.title,
      reportType: report.reportType,
      exportFormat: report.fileFormat,
      propertyId: report.propertyId,
    } as GenerateReportRequest);
  },
  async readFile(ownerId: string, id: string) {
    const report: any = await reportRepository.getReport(ownerId, id);
    if (!report) throw new ApiError("Report not found", HttpStatusCode.NOT_FOUND);
    return { report, buffer: await fs.readFile(report.fileUrl) };
  },
  async delete(ownerId: string, id: string) {
    const report: any = await reportRepository.getReport(ownerId, id);
    if (!report) throw new ApiError("Report not found", HttpStatusCode.NOT_FOUND);
    await fs.rm(report.fileUrl, { force: true });
    await reportRepository.deleteReport(ownerId, id);
    return { deleted: true };
  },
  async receipt(ownerId: string, receiptId: string) {
    const receipt: any = await reportRepository.receipts(ownerId, receiptId);
    if (!receipt) throw new ApiError("Receipt not found", HttpStatusCode.NOT_FOUND);
    return fileExportService.pdf(
      {
        title: `Receipt ${receipt.receiptNumber}`,
        columns: ["field", "value"],
        rows: [
          ["Receipt number", receipt.receiptNumber],
          ["Tenant", receipt.tenant.fullName],
          ["Property", receipt.property.propertyName],
          ["Room", receipt.room.roomNumber],
          ["Bed", receipt.bed.bedNumber],
          ["Amount", Number(receipt.amount)],
          ["Payment method", receipt.paymentMethod],
          ["Reference", receipt.referenceNumber || ""],
          ["Payment date", receipt.payment.paymentDate || ""],
        ].map(([field, value]) => ({ field, value })),
        chartPlaceholder: "QR code placeholder",
      } as any,
      { signature: process.env.REPORT_OWNER_SIGNATURE },
    );
  },
};
