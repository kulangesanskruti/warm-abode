import { getPrismaClient } from "../utils/prisma";

export type ReportFilters = {
  from?: Date;
  to?: Date;
  propertyId?: string;
  roomId?: string;
  tenantId?: string;
  status?: string;
  paymentMethod?: string;
};

const paymentWhere = (ownerId: string, filters: ReportFilters = {}) =>
  ({
    property: { ownerId },
    ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    ...(filters.roomId ? { roomId: filters.roomId } : {}),
    ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
    ...(filters.from || filters.to
      ? {
          paymentDate: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  }) as any;

const tenantWhere = (ownerId: string, filters: ReportFilters = {}) =>
  ({
    property: { ownerId },
    ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    ...(filters.roomId ? { roomId: filters.roomId } : {}),
    ...(filters.tenantId ? { id: filters.tenantId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  }) as any;

export const reportRepository = {
  payments(ownerId: string, filters?: ReportFilters) {
    return getPrismaClient().payment.findMany({
      where: paymentWhere(ownerId, filters),
      include: { tenant: true, property: true, room: true, bed: true },
      orderBy: { paymentDate: "desc" },
    });
  },
  tenants(ownerId: string, filters?: ReportFilters) {
    return getPrismaClient().tenant.findMany({
      where: tenantWhere(ownerId, filters),
      include: { property: true, room: true, bed: true, payments: true },
      orderBy: { fullName: "asc" },
    });
  },
  properties(ownerId: string, propertyId?: string) {
    return getPrismaClient().property.findMany({
      where: { ownerId, ...(propertyId ? { id: propertyId } : {}) },
      include: {
        rooms: { include: { beds: true } },
        tenants: true,
        payments: true,
        maintenanceReqs: true,
      },
      orderBy: { propertyName: "asc" },
    });
  },
  rooms(ownerId: string, filters: ReportFilters = {}) {
    return getPrismaClient().room.findMany({
      where: {
        property: { ownerId },
        ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
        ...(filters.roomId ? { id: filters.roomId } : {}),
      },
      include: { property: true, beds: true, payments: true },
      orderBy: { roomNumber: "asc" },
    });
  },
  maintenance(ownerId: string, propertyId?: string) {
    return getPrismaClient().maintenance.findMany({
      where: { property: { ownerId }, ...(propertyId ? { propertyId } : {}) },
    });
  },
  receipts(ownerId: string, receiptId: string) {
    return getPrismaClient().receipt.findFirst({
      where: { id: receiptId, property: { ownerId } },
      include: { payment: true, tenant: true, property: true, room: true, bed: true },
    });
  },
  async listReports(ownerId: string, query: any) {
    const where = {
      ownerId,
      ...(query.reportType ? { reportType: query.reportType } : {}),
      ...(query.fileFormat ? { fileFormat: query.fileFormat } : {}),
      ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      ...(query.startDate || query.endDate
        ? {
            generatedAt: {
              ...(query.startDate ? { gte: query.startDate } : {}),
              ...(query.endDate ? { lte: query.endDate } : {}),
            },
          }
        : {}),
      ...(query.search ? { title: { contains: query.search, mode: "insensitive" as const } } : {}),
    } as any;
    const [reports, total] = await Promise.all([
      getPrismaClient().report.findMany({
        where,
        orderBy: { [query.sortBy || "generatedAt"]: query.order || "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      getPrismaClient().report.count({ where }),
    ]);
    return {
      reports,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },
  getReport(ownerId: string, id: string) {
    return getPrismaClient().report.findFirst({
      where: { id, ownerId },
      include: { property: true, owner: { select: { fullName: true, email: true } } },
    });
  },
  createReport(data: any) {
    return getPrismaClient().report.create({ data });
  },
  deleteReport(ownerId: string, id: string) {
    return getPrismaClient().report.deleteMany({ where: { id, ownerId } });
  },
  logActivity(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    description?: string,
  ) {
    return getPrismaClient().activityLog.create({
      data: { userId, action, entity, entityId, description },
    });
  },
};

export { paymentWhere };
