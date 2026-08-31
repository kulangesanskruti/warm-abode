import { getPrismaClient } from "../utils/prisma";

const prisma = getPrismaClient();

export const notificationRepository = {
  async list(userId: string, query: { page: number; limit: number; unreadOnly?: boolean }) {
    const where = { userId, ...(query.unreadOnly ? { isRead: false } : {}) };
    const [items, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  },
  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },
  async markRead(userId: string, id: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  },
  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },
  async remove(userId: string, id: string) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  },
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: any;
    dedupeKey?: string;
    entity?: string;
    entityId?: string;
    propertyId?: string;
    tenantId?: string;
    priority?: number;
    metadata?: Record<string, unknown>;
  }) {
    if (data.dedupeKey) {
      const existing = await prisma.notification.findFirst({
        where: { userId: data.userId, dedupeKey: data.dedupeKey },
      });
      if (existing) return existing;
    }
    try {
      return await prisma.notification.create({ data: data as any });
    } catch (error: any) {
      if (error?.code === "P2002" && data.dedupeKey)
        return prisma.notification.findFirstOrThrow({
          where: { userId: data.userId, dedupeKey: data.dedupeKey },
        });
      throw error;
    }
  },
};
