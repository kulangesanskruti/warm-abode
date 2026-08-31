import { getPrismaClient } from "../utils/prisma";

const prisma = getPrismaClient();

export const jobRepository = {
  async enqueue(data: {
    ownerId: string;
    queue: string;
    type: string;
    payload: Record<string, unknown>;
    idempotencyKey: string;
    scheduledAt?: Date;
    maxAttempts?: number;
  }) {
    try {
      return await prisma.backgroundJob.create({ data: data as any });
    } catch (error: any) {
      if (error?.code === "P2002")
        return prisma.backgroundJob.findUniqueOrThrow({
          where: {
            ownerId_idempotencyKey: { ownerId: data.ownerId, idempotencyKey: data.idempotencyKey },
          },
        });
      throw error;
    }
  },
  async list(
    ownerId: string,
    query: { page: number; limit: number; state?: string; queue?: string },
  ) {
    const where = {
      ownerId,
      ...(query.state ? { state: query.state } : {}),
      ...(query.queue ? { queue: query.queue } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.backgroundJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.backgroundJob.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  },
  async claim(id: string) {
    return prisma.backgroundJob.updateMany({
      where: { id, state: { in: ["QUEUED", "RETRY"] }, scheduledAt: { lte: new Date() } },
      data: { state: "RUNNING", startedAt: new Date(), attempts: { increment: 1 } },
    });
  },
  async complete(id: string) {
    return prisma.backgroundJob.update({
      where: { id },
      data: { state: "COMPLETED", completedAt: new Date(), lastError: null },
    });
  },
  async fail(id: string, error: string, retryAt?: Date) {
    return prisma.backgroundJob.update({
      where: { id },
      data: retryAt
        ? { state: "RETRY", scheduledAt: retryAt, lastError: error }
        : { state: "DEAD_LETTER", deadLetteredAt: new Date(), lastError: error },
    });
  },
  async retry(ownerId: string, id: string) {
    return prisma.backgroundJob.updateMany({
      where: { id, ownerId, state: "DEAD_LETTER" },
      data: { state: "RETRY", scheduledAt: new Date(), lastError: null, deadLetteredAt: null },
    });
  },
  async get(ownerId: string, id: string) {
    return prisma.backgroundJob.findFirst({ where: { id, ownerId } });
  },
};
