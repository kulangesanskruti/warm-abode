import { Prisma, TenantStatus, DocumentType } from "@prisma/client";
import type {
  Tenant as PrismaTenant,
  Document as PrismaDocument,
  ActivityLog as PrismaActivityLog,
} from "@prisma/client";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";

// Type definitions
// Mirrors the Prisma `Tenant` model, but exposes the Decimal money columns as
// plain numbers so the rest of the app can do arithmetic on them.
export type Tenant = Omit<PrismaTenant, "monthlyRent" | "securityDeposit"> & {
  monthlyRent: number;
  securityDeposit: number;
  property?: string;
  room?: string;
  bed?: string;
};

export type TenantDocument = PrismaDocument;
export type ActivityLog = PrismaActivityLog;

export { TenantStatus, DocumentType };

const toNumber = (value: Prisma.Decimal): number => value.toNumber();

const toTenant = (tenant: any): Tenant => ({
  ...tenant,
  monthlyRent: toNumber(tenant.monthlyRent),
  securityDeposit: toNumber(tenant.securityDeposit),
  property: tenant.property?.propertyName,
  room: tenant.room?.roomNumber,
  bed: tenant.bed?.bedNumber,
});

const isTenantStatus = (value: string): value is TenantStatus =>
  (Object.values(TenantStatus) as string[]).includes(value);

const parseTenantStatus = (value: string): TenantStatus => {
  if (!isTenantStatus(value)) {
    throw new Error(`Invalid tenant status: ${value}`);
  }
  return value;
};

const isDocumentType = (value: string): value is DocumentType =>
  (Object.values(DocumentType) as string[]).includes(value);

const parseDocumentType = (value: string): DocumentType => {
  if (!isDocumentType(value)) {
    throw new Error(`Invalid document type: ${value}`);
  }
  return value;
};

export class TenantRepository {
  /**
   * Create a new tenant
   */
  async create(data: {
    propertyId: string;
    roomId: string;
    bedId: string;
    fullName: string;
    phone: string;
    email: string;
    gender: string;
    occupation?: string | null;
    dateOfBirth?: Date | null;
    emergencyContact: string;
    emergencyPhone?: string | null;
    permanentAddress?: string | null;
    photoUrl?: string | null;
    monthlyRent: number;
    securityDeposit: number;
    moveInDate: Date;
    expectedVacateDate?: Date | null;
    notes?: string | null;
  }): Promise<Tenant> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.create({
        data: {
          ...data,
          status: TenantStatus.ACTIVE,
        },
      });
      logger.info("Tenant created", { tenantId: tenant.id, email: tenant.email });
      return toTenant(tenant);
    } catch (error) {
      logger.error("Error creating tenant:", error);
      throw error;
    }
  }

  /**
   * Find tenant by ID
   */
  async findById(id: string): Promise<Tenant | null> {
    try {
      const prismaClient = getPrismaClient();
      // Relations are included so the tenant profile page can render real
      // property/room/bed names and the actual payment history — no
      // placeholder values anywhere in the UI.
      const tenant = await prismaClient.tenant.findFirst({
        where: { id, deletedAt: null },
        include: {
          property: { select: { id: true, propertyName: true } },
          room: { select: { id: true, roomNumber: true } },
          bed: { select: { id: true, bedNumber: true } },
          payments: { orderBy: [{ year: "desc" }, { month: "desc" }] },
        },
      });
      return tenant ? toTenant(tenant) : null;
    } catch (error) {
      logger.error("Error finding tenant:", error);
      throw error;
    }
  }

  /**
   * Find tenant by email
   */
  async findByEmail(email: string): Promise<Tenant | null> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.findFirst({
        where: { email, deletedAt: null },
      });
      return tenant ? toTenant(tenant) : null;
    } catch (error) {
      logger.error("Error finding tenant by email:", error);
      throw error;
    }
  }

  /**
   * Find tenant by phone
   */
  async findByPhone(phone: string): Promise<Tenant | null> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.findFirst({
        where: { phone, deletedAt: null },
      });
      return tenant ? toTenant(tenant) : null;
    } catch (error) {
      logger.error("Error finding tenant by phone:", error);
      throw error;
    }
  }

  /**
   * Find all tenants with filters, pagination, and sorting
   */
  async findAll(options: {
    ownerId: string;
    propertyId?: string;
    roomId?: string;
    status?: string;
    paymentStatus?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ tenants: Tenant[]; total: number }> {
    try {
      const prismaClient = getPrismaClient();
      const skip = (options.page - 1) * options.limit;

      // Build where clause
      // SECURITY: always scope to properties owned by the caller, so an
      // unfiltered or spoofed propertyId can never widen the result set.
      const where: Prisma.TenantWhereInput = {
        deletedAt: null,
        property: { is: { ownerId: options.ownerId } },
      };
      if (options.propertyId) where.propertyId = options.propertyId;
      if (options.roomId) where.roomId = options.roomId;
      if (options.status) where.status = parseTenantStatus(options.status);
      if (options.paymentStatus) {
        where.payments = {
          some: {
            status: options.paymentStatus as any,
          },
        };
      }
      if (options.search) {
        where.OR = [
          { fullName: { contains: options.search, mode: "insensitive" } },
          { email: { contains: options.search, mode: "insensitive" } },
          { phone: { contains: options.search, mode: "insensitive" } },
        ];
      }

      // Execute queries
      const tenants = await prismaClient.tenant.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { [options.sortBy]: options.sortOrder },
        include: {
          property: { select: { propertyName: true } },
          room: { select: { roomNumber: true } },
          bed: { select: { bedNumber: true } },
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      const total = await prismaClient.tenant.count({ where });

      return { tenants: tenants.map(toTenant), total };
    } catch (error) {
      logger.error("Error finding tenants:", error);
      throw error;
    }
  }

  /**
   * Update tenant
   */
  async update(id: string, data: Prisma.TenantUncheckedUpdateInput): Promise<Tenant> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.update({
        where: { id },
        data,
      });
      logger.info("Tenant updated", { tenantId: id });
      return toTenant(tenant);
    } catch (error) {
      logger.error("Error updating tenant:", error);
      throw error;
    }
  }

  /**
   * Soft delete tenant
   */
  async softDelete(id: string): Promise<Tenant> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      logger.info("Tenant soft deleted", { tenantId: id });
      return toTenant(tenant);
    } catch (error) {
      logger.error("Error deleting tenant:", error);
      throw error;
    }
  }

  /**
   * Update tenant status
   */
  async updateStatus(id: string, status: TenantStatus | string): Promise<Tenant> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.update({
        where: { id },
        data: { status: parseTenantStatus(status) },
      });
      return toTenant(tenant);
    } catch (error) {
      logger.error("Error updating tenant status:", error);
      throw error;
    }
  }

  /**
   * Find tenant by bed ID
   */
  async findByBedId(bedId: string): Promise<Tenant | null> {
    try {
      const prismaClient = getPrismaClient();
      const tenant = await prismaClient.tenant.findFirst({
        where: { bedId, status: TenantStatus.ACTIVE, deletedAt: null },
      });
      return tenant ? toTenant(tenant) : null;
    } catch (error) {
      logger.error("Error finding tenant by bed:", error);
      throw error;
    }
  }

  /**
   * Count active tenants by property
   */
  async countActiveByProperty(propertyId: string): Promise<number> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.tenant.count({
        where: { propertyId, status: TenantStatus.ACTIVE, deletedAt: null },
      });
    } catch (error) {
      logger.error("Error counting tenants:", error);
      throw error;
    }
  }

  /**
   * Create activity log
   */
  async createActivityLog(data: {
    userId: string;
    tenantId: string;
    action: string;
    description: string;
  }): Promise<ActivityLog> {
    try {
      const prismaClient = getPrismaClient();
      const log = await prismaClient.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: "TENANT",
          entityId: data.tenantId,
          description: data.description,
        },
      });
      return log;
    } catch (error) {
      logger.error("Error creating activity log:", error);
      throw error;
    }
  }

  /**
   * Get activity logs for tenant
   */
  async getActivityLogs(tenantId: string, limit = 20): Promise<ActivityLog[]> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.activityLog.findMany({
        where: { entity: "TENANT", entityId: tenantId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.error("Error getting activity logs:", error);
      throw error;
    }
  }

  /**
   * Create tenant document
   */
  async createDocument(data: {
    tenantId: string;
    documentType: DocumentType | string;
    documentUrl: string;
  }): Promise<TenantDocument> {
    try {
      const prismaClient = getPrismaClient();
      const doc = await prismaClient.document.create({
        data: {
          tenantId: data.tenantId,
          documentType: parseDocumentType(data.documentType),
          fileUrl: data.documentUrl,
        },
      });
      logger.info("Document uploaded", {
        tenantId: data.tenantId,
        documentType: data.documentType,
      });
      return doc;
    } catch (error) {
      logger.error("Error creating document:", error);
      throw error;
    }
  }

  /**
   * Get tenant documents
   */
  async getDocuments(tenantId: string): Promise<TenantDocument[]> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.document.findMany({
        where: { tenantId },
        orderBy: { uploadedAt: "desc" },
      });
    } catch (error) {
      logger.error("Error getting documents:", error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const prismaClient = getPrismaClient();
      const where: Prisma.TenantWhereInput = { email, deletedAt: null };
      if (excludeId) where.id = { not: excludeId };
      const tenant = await prismaClient.tenant.findFirst({ where });
      return !!tenant;
    } catch (error) {
      logger.error("Error checking email:", error);
      throw error;
    }
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string, excludeId?: string): Promise<boolean> {
    try {
      const prismaClient = getPrismaClient();
      const where: Prisma.TenantWhereInput = { phone, deletedAt: null };
      if (excludeId) where.id = { not: excludeId };
      const tenant = await prismaClient.tenant.findFirst({ where });
      return !!tenant;
    } catch (error) {
      logger.error("Error checking phone:", error);
      throw error;
    }
  }
}

export const tenantRepository = new TenantRepository();
