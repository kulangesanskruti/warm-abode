import { z } from "zod";

const reportTypes = [
  "RENT_COLLECTION",
  "PROPERTY_PERFORMANCE",
  "ROOM_OCCUPANCY",
  "TENANT_REPORT",
  "PENDING_RENT",
  "OVERDUE_RENT",
  "MONTHLY_FINANCIAL",
  "ANNUAL_FINANCIAL",
  "CASHBOOK",
  "PAYMENT_HISTORY",
  "BUSINESS_SUMMARY",
] as const;
const formats = ["PDF", "EXCEL", "CSV", "JSON"] as const;
const date = z.coerce.date();

const range = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((value: any, ctx) => {
    if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "startDate must be before endDate",
      });
  });

export const generateReportSchema = range(
  z.object({
    title: z.string().trim().min(1).max(160).default("StayHub Report"),
    reportType: z.enum(reportTypes),
    exportFormat: z.enum(formats).default("PDF"),
    propertyId: z.string().min(1).optional(),
    roomId: z.string().min(1).optional(),
    tenantId: z.string().min(1).optional(),
    startDate: date.optional(),
    endDate: date.optional(),
    status: z.string().min(1).optional(),
    paymentMethod: z.string().min(1).optional(),
    watermark: z.string().trim().max(120).optional(),
    signature: z.string().trim().max(120).optional(),
  }),
);

export const listReportsSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  propertyId: z.string().optional(),
  reportType: z.enum(reportTypes).optional(),
  fileFormat: z.enum(formats).optional(),
  startDate: date.optional(),
  endDate: date.optional(),
  sortBy: z.enum(["generatedAt", "title", "propertyId"]).default("generatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const analyticsQuerySchema = z
  .object({
    propertyId: z.string().optional(),
    roomId: z.string().optional(),
    tenantId: z.string().optional(),
    status: z.string().optional(),
    paymentMethod: z.string().optional(),
    startDate: date.optional(),
    endDate: date.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.startDate > value.endDate)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "startDate must be before endDate",
      });
  });

export type GenerateReportRequest = z.infer<typeof generateReportSchema>;
export type ListReportsRequest = z.infer<typeof listReportsSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
