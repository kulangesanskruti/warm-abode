import { tenantRepository } from "../repositories/tenantRepository";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { getPrismaClient } from "../utils/prisma";
import { assertPropertyOwnership, assertTenantOwnership } from "../utils/ownership";
import { logger } from "../utils/logger";
import { syncRoomOccupancy } from "../utils/roomOccupancy";
import { Prisma } from "@prisma/client";
import {
  CreateTenantRequest,
  UpdateTenantRequest,
  TransferBedRequest,
  VacateRequest,
  UploadDocumentRequest,
} from "../validators/tenant";

export class TenantService {
  /**
   * Create a new tenant and assign bed
   */
  async createTenant(ownerId: string, data: CreateTenantRequest) {
    try {
      // SECURITY: the property must belong to the caller before anything is
      // written; room/bed are re-derived from the DB, never trusted.
      await assertPropertyOwnership(data.propertyId, ownerId);

      const prisma = getPrismaClient();

      // Defensive check: a tenant can only be assigned to a property whose
      // required details are fully filled in (schema enforces this at
      // creation time, but we re-verify here in case of partial/legacy data).
      const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
      const isPropertyComplete =
        property &&
        property.propertyName &&
        property.propertyType &&
        property.address &&
        property.city &&
        property.state &&
        property.pincode &&
        property.country &&
        property.totalFloors > 0;
      if (!isPropertyComplete) {
        throw new ApiError(
          "Selected property is missing required details. Please complete the property profile before adding a tenant.",
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // Whole registration is one unit of work: a tenant row, the bed
      // occupancy flip and the audit log either all land or none do.
      const tenant = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const emailExists = await tx.tenant.findFirst({
          where: { email: data.email, deletedAt: null },
          select: { id: true },
        });
        if (emailExists) {
          throw new ApiError("Email already registered", HttpStatusCode.CONFLICT);
        }

        const phoneExists = await tx.tenant.findFirst({
          where: { phone: data.phone, deletedAt: null },
          select: { id: true },
        });
        if (phoneExists) {
          throw new ApiError("Phone number already registered", HttpStatusCode.CONFLICT);
        }

        const room = await tx.room.findFirst({
          where: { id: data.roomId, propertyId: data.propertyId, deletedAt: null },
          select: { id: true },
        });
        if (!room) {
          throw new ApiError("Invalid room selection", HttpStatusCode.BAD_REQUEST);
        }

        const bed = await tx.bed.findFirst({
          where: { id: data.bedId, roomId: data.roomId },
          select: { id: true, bedNumber: true, status: true },
        });
        if (!bed) {
          throw new ApiError("Invalid bed selection", HttpStatusCode.BAD_REQUEST);
        }

        // Conditional update doubles as a lock: if a concurrent request took
        // the bed first, count is 0 and the whole transaction rolls back.
        const claimed = await tx.bed.updateMany({
          where: { id: data.bedId, status: "VACANT" },
          data: { status: "OCCUPIED" },
        });
        if (claimed.count === 0) {
          throw new ApiError("Selected bed is not available", HttpStatusCode.CONFLICT);
        }

        const created = await tx.tenant.create({
          data: {
            propertyId: data.propertyId,
            roomId: data.roomId,
            bedId: data.bedId,
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            gender: data.gender,
            occupation: data.occupation,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            emergencyContact: data.emergencyContact,
            emergencyPhone: data.emergencyPhone,
            permanentAddress: data.permanentAddress,
            photoUrl: data.photoUrl,
            monthlyRent: data.monthlyRent,
            securityDeposit: data.securityDeposit,
            moveInDate: new Date(data.moveInDate),
            expectedVacateDate: data.expectedVacateDate
              ? new Date(data.expectedVacateDate)
              : undefined,
            notes: data.notes,
          },
        });

        // The bed claim above only had a status to flip; the tenant row
        // (and its id) doesn't exist until here, so the bed's
        // currentTenantId pointer is completed in this follow-up update.
        // Without this, `currentTenantId` stays null forever even though
        // the bed is OCCUPIED, which is what the Room/Bed UI reads to show
        // who's assigned to a bed.
        await tx.bed.update({
          where: { id: data.bedId },
          data: { currentTenantId: created.id },
        });

        await tx.activityLog.create({
          data: {
            userId: ownerId,
            action: "TENANT_CREATED",
            entity: "TENANT",
            entityId: created.id,
            description: `Tenant ${created.fullName} registered and assigned to bed ${bed.bedNumber}`,
          },
        });

        // Keep the room's denormalised occupancy/status in step with its beds
        // so availability is correct the moment this transaction commits.
        await syncRoomOccupancy(tx, data.roomId);

        return created;
      });

      logger.info("Tenant created successfully", { tenantId: tenant.id, ownerId });
      return tenant;
    } catch (error) {
      logger.error("Error creating tenant:", error);
      throw error;
    }
  }

  /**
   * Get tenant with details
   */
  async getTenant(tenantId: string, ownerId: string) {
    try {
      await assertTenantOwnership(tenantId, ownerId);

      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
      }

      const documents = await tenantRepository.getDocuments(tenantId);
      const activityLogs = await tenantRepository.getActivityLogs(tenantId);

      return {
        ...tenant,
        documents,
        activityLogs,
      };
    } catch (error) {
      logger.error("Error fetching tenant:", error);
      throw error;
    }
  }

  async getAllTenants(options: {
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
  }) {
    try {
      // SECURITY: if a propertyId filter is supplied, confirm the caller owns
      // it so a foreign id returns 403 instead of silently empty results.
      if (options.propertyId) {
        await assertPropertyOwnership(options.propertyId, options.ownerId);
      }

      const { tenants, total } = await tenantRepository.findAll(options);
      return {
        tenants,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching tenants:", error);
      throw error;
    }
  }

  /**
   * Update tenant information
   */
  async updateTenant(tenantId: string, ownerId: string, data: UpdateTenantRequest) {
    try {
      await assertTenantOwnership(tenantId, ownerId);
      const prisma = getPrismaClient();

      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const tenant = await tx.tenant.findFirst({
          where: { id: tenantId, deletedAt: null },
        });
        if (!tenant) {
          throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
        }

        if (data.email && data.email !== tenant.email) {
          const exists = await tx.tenant.findFirst({
            where: { email: data.email, id: { not: tenantId }, deletedAt: null },
            select: { id: true },
          });
          if (exists) {
            throw new ApiError("Email already in use", HttpStatusCode.CONFLICT);
          }
        }

        if (data.phone && data.phone !== tenant.phone) {
          const exists = await tx.tenant.findFirst({
            where: { phone: data.phone, id: { not: tenantId }, deletedAt: null },
            select: { id: true },
          });
          if (exists) {
            throw new ApiError("Phone already in use", HttpStatusCode.CONFLICT);
          }
        }

        const updateData: any = {};
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.phone) updateData.phone = data.phone;
        if (data.email) updateData.email = data.email;
        if (data.gender) updateData.gender = data.gender;
        if (data.occupation) updateData.occupation = data.occupation;
        if (data.emergencyContact) updateData.emergencyContact = data.emergencyContact;
        if (data.emergencyPhone) updateData.emergencyPhone = data.emergencyPhone;
        if (data.permanentAddress) updateData.permanentAddress = data.permanentAddress;
        if (data.photoUrl) updateData.photoUrl = data.photoUrl;
        if (data.monthlyRent) updateData.monthlyRent = data.monthlyRent;
        if (data.securityDeposit) updateData.securityDeposit = data.securityDeposit;
        if (data.expectedVacateDate) {
          updateData.expectedVacateDate = new Date(data.expectedVacateDate);
        }
        if (data.notes !== undefined) updateData.notes = data.notes;

        const updated = await tx.tenant.update({
          where: { id: tenantId },
          data: updateData,
        });

        await tx.activityLog.create({
          data: {
            userId: ownerId,
            action: "PROFILE_UPDATED",
            entity: "TENANT",
            entityId: tenantId,
            description: "Tenant profile updated",
          },
        });

        return updated;
      });
    } catch (error) {
      logger.error("Error updating tenant:", error);
      throw error;
    }
  }

  /**
   * Transfer tenant to a different bed
   */
  async transferBed(tenantId: string, ownerId: string, data: TransferBedRequest) {
    try {
      await assertTenantOwnership(tenantId, ownerId);
      // The destination property must also belong to the caller.
      await assertPropertyOwnership(data.newPropertyId, ownerId);

      const prisma = getPrismaClient();

      // Freeing the old bed, claiming the new one and moving the tenant must
      // succeed together, otherwise a crash could leave two beds occupied.
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const tenant = await tx.tenant.findFirst({
          where: { id: tenantId, deletedAt: null },
        });
        if (!tenant) {
          throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
        }

        const newRoom = await tx.room.findFirst({
          where: { id: data.newRoomId, propertyId: data.newPropertyId, deletedAt: null },
          select: { id: true },
        });
        if (!newRoom) {
          throw new ApiError("Invalid room selection", HttpStatusCode.BAD_REQUEST);
        }

        const newBed = await tx.bed.findFirst({
          where: { id: data.newBedId, roomId: data.newRoomId },
          select: { id: true, bedNumber: true },
        });
        if (!newBed) {
          throw new ApiError("Invalid bed selection", HttpStatusCode.BAD_REQUEST);
        }

        const claimed = await tx.bed.updateMany({
          where: { id: data.newBedId, status: "VACANT" },
          data: { status: "OCCUPIED", currentTenantId: tenantId },
        });
        if (claimed.count === 0) {
          throw new ApiError("Target bed is not available", HttpStatusCode.CONFLICT);
        }

        await tx.bed.update({
          where: { id: tenant.bedId },
          data: { status: "VACANT", currentTenantId: null },
        });

        const updated = await tx.tenant.update({
          where: { id: tenantId },
          data: {
            propertyId: data.newPropertyId,
            roomId: data.newRoomId,
            bedId: data.newBedId,
          },
        });

        // Both the vacated and the newly occupied room change availability.
        await syncRoomOccupancy(tx, tenant.roomId);
        await syncRoomOccupancy(tx, data.newRoomId);

        await tx.activityLog.create({
          data: {
            userId: ownerId,
            action: "ROOM_CHANGED",
            entity: "TENANT",
            entityId: tenantId,
            description: `Tenant transferred to bed ${newBed.bedNumber}${
              data.reason ? ` - Reason: ${data.reason}` : ""
            }`,
          },
        });

        return updated;
      });
    } catch (error) {
      logger.error("Error transferring tenant:", error);
      throw error;
    }
  }

  /**
   * Vacate tenant from bed
   */
  async vacateTenant(tenantId: string, ownerId: string, data: VacateRequest) {
    try {
      await assertTenantOwnership(tenantId, ownerId);
      const prisma = getPrismaClient();

      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const tenant = await tx.tenant.findFirst({
          where: { id: tenantId, deletedAt: null },
        });
        if (!tenant) {
          throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
        }

        const updated = await tx.tenant.update({
          where: { id: tenantId },
          data: {
            status: "LEFT",
            actualVacateDate: new Date(data.vacatingDate),
          },
        });

        await tx.bed.update({
          where: { id: tenant.bedId },
          data: { status: "VACANT", currentTenantId: null },
        });

        await tx.activityLog.create({
          data: {
            userId: ownerId,
            action: "TENANT_VACATED",
            entity: "TENANT",
            entityId: tenantId,
            description: `Tenant vacated - Reason: ${data.reason}`,
          },
        });

        await syncRoomOccupancy(tx, tenant.roomId);

        return updated;
      });
    } catch (error) {
      logger.error("Error vacating tenant:", error);
      throw error;
    }
  }

  /**
   * Upload document for tenant
   */
  async uploadDocument(tenantId: string, ownerId: string, data: UploadDocumentRequest) {
    try {
      await assertTenantOwnership(tenantId, ownerId);
      const prisma = getPrismaClient();

      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const doc = await tx.document.create({
          data: {
            tenantId,
            documentType: data.documentType as any,
            fileUrl: data.documentUrl,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: ownerId,
            action: "DOCUMENT_UPLOADED",
            entity: "TENANT",
            entityId: tenantId,
            description: `Document uploaded: ${data.documentType}`,
          },
        });

        return doc;
      });
    } catch (error) {
      logger.error("Error uploading document:", error);
      throw error;
    }
  }

  /**
   * Soft delete tenant
   */
  async deleteTenant(tenantId: string, ownerId: string) {
    try {
      await assertTenantOwnership(tenantId, ownerId);
      const prisma = getPrismaClient();

      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const tenant = await tx.tenant.findFirst({
          where: { id: tenantId, deletedAt: null },
        });
        if (!tenant) {
          throw new ApiError("Tenant not found", HttpStatusCode.NOT_FOUND);
        }

        // Deleting an active tenant is allowed from the tenant list/profile:
        // the assigned bed is released in the same unit of work so occupancy
        // stays correct. (Only an already-LEFT tenant has no bed to free.)
        if (tenant.status !== "LEFT") {
          await tx.bed.update({
            where: { id: tenant.bedId },
            data: { status: "VACANT", currentTenantId: null },
          });
        }

        const deleted = await tx.tenant.update({
          where: { id: tenantId },
          data: { deletedAt: new Date() },
        });

        await tx.activityLog.create({
          data: {
            userId: ownerId,
            action: "TENANT_DELETED",
            entity: "TENANT",
            entityId: tenantId,
            description: "Tenant record deleted",
          },
        });

        await syncRoomOccupancy(tx, tenant.roomId);

        return deleted;
      });
    } catch (error) {
      logger.error("Error deleting tenant:", error);
      throw error;
    }
  }
}

export const tenantService = new TenantService();
