import { z } from "zod";

const id = z.string().trim().min(1).max(100);
// Accepts loose input (spaces, dashes, missing country code) — the service
// normalizes it to strict E.164 and reports a clear error if it can't.
const phone = z
  .string()
  .trim()
  .min(6, "Phone number is too short")
  .max(24)
  .regex(/^[+0-9()\-.\s]+$/, "Phone number contains invalid characters");
const date = z.coerce.date();
const variables = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

export const sendWhatsAppSchema = z
  .object({
    phone: phone.optional(),
    recipient: phone.optional(),
    tenantId: id.optional(),
    propertyId: id.optional(),
    paymentId: id.optional(),
    templateName: z.string().trim().max(120).optional(),
    variables: variables.optional(),
    message: z.string().trim().min(1).max(4096).optional(),
    messageType: z.string().trim().max(60).default("OTHER"),
    mediaUrl: z.string().url().optional(),
    scheduledAt: date.optional(),
    idempotencyKey: z.string().trim().max(160).optional(),
  })
  .refine((v) => v.message || v.templateName, {
    message: "message or templateName is required",
    path: ["message"],
  })
  .refine((v) => v.phone || v.recipient || v.tenantId, {
    message: "phone, recipient, or tenantId is required",
    path: ["phone"],
  });
export const sendRentReminderSchema = z.object({
  tenantId: id,
  paymentId: id.optional(),
  daysOffset: z.coerce.number().int().min(-365).max(365).default(0),
  reminderType: z.enum(["BEFORE_DUE", "DUE_DATE", "OVERDUE"]).default("DUE_DATE"),
  message: z.string().trim().max(4096).optional(),
  templateName: z.string().trim().max(120).optional(),
  variables: variables.optional(),
  scheduledAt: date.optional(),
});
export const reminderSchema = z
  .object({
    tenantIds: z.array(id).min(1).max(100).optional(),
    paymentIds: z.array(id).min(1).max(100).optional(),
    tenantId: id.optional(),
    paymentId: id.optional(),
    reminderType: z.enum(["BEFORE_DUE", "DUE_DATE", "OVERDUE"]),
    offsetDays: z.number().int().min(0).max(365).default(0),
    message: z.string().trim().max(4096).optional(),
    templateName: z.string().trim().max(120).optional(),
    variables: variables.optional(),
    scheduledAt: date.optional(),
  })
  .refine((v) => v.tenantIds?.length || v.paymentIds?.length || v.tenantId || v.paymentId, {
    message: "A tenant or payment target is required",
  });
export const sendReceiptSchema = z
  .object({
    receiptId: id.optional(),
    paymentId: id.optional(),
    phone: phone.optional(),
    recipient: phone.optional(),
    message: z.string().trim().max(4096).optional(),
    scheduledAt: date.optional(),
  })
  .refine((v) => v.receiptId || v.paymentId, { message: "receiptId or paymentId is required" });
export const receiptSchema = sendReceiptSchema;
export const shareRoomSchema = z.object({
  roomId: id,
  propertyId: id.optional(),
  phone: phone.optional(),
  recipient: phone.optional(),
  includeImage: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  scheduledAt: date.optional(),
});
export const broadcastSchema = z
  .object({
    propertyIds: z.array(id).min(1).max(50).optional(),
    propertyId: id.optional(),
    tenantIds: z.array(id).max(500).optional(),
    phoneNumbers: z.array(phone).max(500).optional(),
    allProperties: z.boolean().default(false),
    message: z.string().trim().min(1).max(4096).optional(),
    templateName: z.string().trim().max(120).optional(),
    variables: variables.optional(),
    scheduledAt: date.optional(),
  })
  .refine((v) => v.message || v.templateName, { message: "message or templateName is required" });
export const scheduleMessageSchema = z
  .object({
    phone: phone.optional(),
    recipient: phone.optional(),
    tenantId: id.optional(),
    message: z.string().trim().min(1).max(4096),
    templateName: z.string().trim().max(120).optional(),
    variables: variables.optional(),
    scheduledAt: date,
    scheduledTime: date.optional(),
  })
  .refine((v) => v.phone || v.recipient || v.tenantId, { message: "A recipient is required" });
export const scheduleSchema = scheduleMessageSchema;
export const createTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9_-]+$/),
  category: z.string().trim().min(1).max(60),
  body: z.string().trim().min(1).max(4096),
  language: z.string().trim().min(2).max(10).default("en"),
  variables: z.array(z.string().trim()).max(30).default([]),
  isActive: z.boolean().default(true),
});
export const templateSchema = createTemplateSchema;
export const updateTemplateSchema = createTemplateSchema.partial();
export const listWhatsAppLogsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  tenantId: id.optional(),
  status: z.string().optional(),
  propertyId: id.optional(),
  templateName: z.string().optional(),
  startDate: date.optional(),
  endDate: date.optional(),
});
export const historySchema = listWhatsAppLogsSchema;

export type SendWhatsAppRequest = z.infer<typeof sendWhatsAppSchema>;
export type SendRentReminderRequest = z.infer<typeof sendRentReminderSchema>;
export type SendReceiptRequest = z.infer<typeof sendReceiptSchema>;
export type ShareRoomRequest = z.infer<typeof shareRoomSchema>;
export type BroadcastRequest = z.infer<typeof broadcastSchema>;
export type ScheduleMessageRequest = z.infer<typeof scheduleMessageSchema>;
export type CreateTemplateRequest = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateRequest = z.infer<typeof updateTemplateSchema>;
export type ListWhatsAppLogsRequest = z.infer<typeof listWhatsAppLogsSchema>;
