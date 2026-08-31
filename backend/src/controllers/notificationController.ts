import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notificationService";
import { notificationIdSchema, notificationListSchema } from "../validators/notifications";
import { validateAsync } from "../utils/validation";
import { ApiError, HttpStatusCode, sendSuccessResponse, validationError } from "../utils/errors";

const userId = (req: Request) => {
  if (!req.user?.userId) throw new ApiError("Authentication required", HttpStatusCode.UNAUTHORIZED);
  return req.user.userId;
};
const parse = async (schema: any, value: unknown): Promise<any> => {
  const result = await validateAsync(schema, value);
  if (!result.isValid) throw validationError(result.errors);
  return result.data;
};

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccessResponse(
        res,
        await notificationService.list(userId(req), await parse(notificationListSchema, req.query)),
        "Notifications retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  },
  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccessResponse(
        res,
        { count: await notificationService.unreadCount(userId(req)) },
        "Unread count retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  },
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = await parse(notificationIdSchema, req.params);
      sendSuccessResponse(
        res,
        await notificationService.markRead(userId(req), id),
        "Notification marked as read",
      );
    } catch (error) {
      next(error);
    }
  },
  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccessResponse(
        res,
        await notificationService.markAllRead(userId(req)),
        "Notifications marked as read",
      );
    } catch (error) {
      next(error);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = await parse(notificationIdSchema, req.params);
      sendSuccessResponse(
        res,
        await notificationService.remove(userId(req), id),
        "Notification deleted successfully",
      );
    } catch (error) {
      next(error);
    }
  },
};
