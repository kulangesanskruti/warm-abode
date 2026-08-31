import { getPrismaClient } from "../utils/prisma";
const db = () => getPrismaClient();

export const whatsappRepository = {
  async findTenant(ownerId: string, tenantId: string) {
    return db().tenant.findFirst({
      where: { id: tenantId, property: { ownerId } },
      include: { property: true, room: { include: { beds: true } }, bed: true },
    });
  },
  async findPayment(ownerId: string, paymentId: string) {
    return db().payment.findFirst({
      where: { id: paymentId, property: { ownerId } },
      include: { tenant: true, property: true, room: true, bed: true, receipts: true },
    });
  },
  async findReceipt(ownerId: string, receiptId: string) {
    return db().receipt.findFirst({
      where: { id: receiptId, property: { ownerId } },
      include: { payment: true, tenant: true, property: true, room: true, bed: true },
    });
  },
  async findRoom(ownerId: string, roomId: string) {
    return db().room.findFirst({
      where: { id: roomId, property: { ownerId } },
      include: { property: true, beds: { include: { tenant: true } } },
    });
  },
  async findProperties(ownerId: string, ids?: string[]) {
    return db().property.findMany({
      where: { ownerId, ...(ids?.length ? { id: { in: ids } } : {}) },
      include: { tenants: { where: { status: "ACTIVE" } } },
    });
  },
  async getTemplate(ownerId: string, name: string) {
    return db().whatsAppTemplate.findFirst({ where: { ownerId, name, isActive: true } });
  },
  async listTemplates(ownerId: string) {
    return db().whatsAppTemplate.findMany({ where: { ownerId }, orderBy: { name: "asc" } });
  },
  async createTemplate(ownerId: string, data: any) {
    return db().whatsAppTemplate.create({ data: { ...data, ownerId } });
  },
  async updateTemplate(ownerId: string, id: string, data: any) {
    return db().whatsAppTemplate.updateMany({ where: { id, ownerId }, data });
  },
  async createLog(data: any) {
    return db().whatsAppLog.create({ data });
  },
  async updateLog(id: string, data: any) {
    return db().whatsAppLog.update({ where: { id }, data });
  },
  async findByIdempotency(ownerId: string, key: string) {
    return db().whatsAppLog.findFirst({ where: { ownerId, idempotencyKey: key } });
  },
  async history(ownerId: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { ownerId };
    if (query.phone) where.phone = { contains: query.phone };
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    if (query.templateName) where.templateName = query.templateName;
    if (query.startDate || query.endDate)
      where.createdAt = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    if (query.search) where.message = { contains: query.search, mode: "insensitive" };
    const [messages, total] = await Promise.all([
      db().whatsAppLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db().whatsAppLog.count({ where }),
    ]);
    return { messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },
  async analytics(ownerId: string, messageId: string, eventType: string, metadata: any = {}) {
    return db().whatsAppAnalyticsEvent.create({
      data: { ownerId, messageId, eventType, metadata },
    });
  },
  async activity(ownerId: string, entityId: string, description: string) {
    return db().activityLog.create({
      data: {
        userId: ownerId,
        action: "WHATSAPP_MESSAGE",
        entity: "WhatsAppLog",
        entityId,
        description,
      },
    });
  },
};
