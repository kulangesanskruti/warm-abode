import { Request, Response } from "express";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { whatsappService } from "../services/whatsappService";
import {
  broadcastSchema,
  createTemplateSchema,
  listWhatsAppLogsSchema,
  reminderSchema,
  sendReceiptSchema,
  sendWhatsAppSchema,
  shareRoomSchema,
  updateTemplateSchema,
} from "../validators/whatsapp";

const respond = (res: Response, data: unknown, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const parse = <T>(
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T; error?: unknown } },
  value: unknown,
): T => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = ((result.error as any)?.issues ?? []) as {
      path?: (string | number)[];
      message?: string;
    }[];
    const detail = issues
      .map((issue) =>
        `${issue.path?.length ? `${issue.path.join(".")}: ` : ""}${issue.message ?? "Invalid value"}`,
      )
      .join("; ");
    throw new ApiError(
      detail ? `Validation failed — ${detail}` : "Validation failed",
      HttpStatusCode.BAD_REQUEST,
      issues,
    );
  }
  return result.data as T;
};
const owner = (req: Request) => {
  if (!req.user?.userId)
    throw new ApiError("Authenticated owner required", HttpStatusCode.UNAUTHORIZED);
  return req.user.userId;
};

export const whatsappController = {
  async send(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.send(owner(req), parse(sendWhatsAppSchema, req.body)),
      "WhatsApp message processed",
      201,
    );
  },
  async reminder(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.reminder(owner(req), parse(reminderSchema, req.body)),
      "Rent reminder processed",
      201,
    );
  },
  async receipt(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.receipt(owner(req), parse(sendReceiptSchema, req.body)),
      "Receipt shared",
      201,
    );
  },
  async shareRoom(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.shareRoom(owner(req), parse(shareRoomSchema, req.body)),
      "Room availability shared",
      201,
    );
  },
  async broadcast(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.broadcast(owner(req), parse(broadcastSchema, req.body)),
      "Broadcast processed",
      201,
    );
  },
  async schedule(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.send(
        owner(req),
        parse(sendWhatsAppSchema, {
          ...req.body,
          scheduledAt: req.body.scheduledAt || req.body.scheduledTime,
        }),
      ),
      "Message scheduled",
      201,
    );
  },
  async history(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.history(owner(req), parse(listWhatsAppLogsSchema, req.query)),
      "Message history fetched",
    );
  },
  async templates(req: Request, res: Response) {
    return respond(res, await whatsappService.templates(owner(req)), "Templates fetched");
  },
  async createTemplate(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.createTemplate(owner(req), parse(createTemplateSchema, req.body)),
      "Template created",
      201,
    );
  },
  async updateTemplate(req: Request, res: Response) {
    return respond(
      res,
      await whatsappService.updateTemplate(
        owner(req),
        String(req.params.id),
        parse(updateTemplateSchema, req.body),
      ),
      "Template updated",
    );
  },
};
