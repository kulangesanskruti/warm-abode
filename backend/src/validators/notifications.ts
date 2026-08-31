import { z } from "zod";

export const notificationListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

export const notificationIdSchema = z.object({ id: z.string().min(1) });

export type NotificationListQuery = z.infer<typeof notificationListSchema>;
