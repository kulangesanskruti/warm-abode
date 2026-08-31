import { getPrismaClient } from "../utils/prisma";
import type { FileListQuery } from "../validators/file";

const prisma = getPrismaClient();

export const fileRepository = {
  create: (data: any) => prisma.fileAsset.create({ data }),
  findById: (ownerId: string, id: string) => prisma.fileAsset.findFirst({ where: { id, ownerId } }),
  findDuplicate: (ownerId: string, checksum: string) =>
    prisma.fileAsset.findFirst({ where: { ownerId, checksum } }),
  async list(ownerId: string, query: FileListQuery) {
    const where: any = {
      ownerId,
      ...(query.category ? { category: query.category } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      ...(query.tenantId ? { tenantId: query.tenantId } : {}),
      ...(query.mimeGroup === "IMAGE" ? { mimeType: { startsWith: "image/" } } : {}),
      ...(query.mimeGroup === "PDF" ? { mimeType: "application/pdf" } : {}),
      ...(query.search
        ? {
            OR: [
              { originalName: { contains: query.search, mode: "insensitive" } },
              { safeName: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.fileAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.fileAsset.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  },
  delete: (ownerId: string, id: string) => prisma.fileAsset.deleteMany({ where: { ownerId, id } }),
  markCover: async (ownerId: string, propertyId: string, id: string) => {
    await prisma.$transaction([
      prisma.fileAsset.updateMany({
        where: { ownerId, propertyId, category: "PROPERTY_IMAGE" },
        data: { isCover: false },
      }),
      prisma.fileAsset.updateMany({ where: { ownerId, propertyId, id }, data: { isCover: true } }),
    ]);
  },
  recordDownload: (data: any) => prisma.fileDownload.create({ data }),
};
