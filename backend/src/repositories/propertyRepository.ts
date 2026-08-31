import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { PropertyStatus } from "../validators/property";

// Type definitions
export interface Property {
  id: string;
  ownerId: string;
  propertyName: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  totalFloors: number;
  description: string | null;
  imageUrl: string | null;
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lazy load Prisma client

export class PropertyRepository {
  /**
   * Create a new property
   */
  async create(data: {
    ownerId: string;
    propertyName: string;
    propertyType: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    totalFloors: number;
    description?: string | null;
    imageUrl?: string | null;
  }): Promise<Property> {
    try {
      const prismaClient = getPrismaClient();
      const property = await prismaClient.property.create({
        data: {
          ownerId: data.ownerId,
          propertyName: data.propertyName,
          propertyType: data.propertyType,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country,
          totalFloors: data.totalFloors,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          status: "ACTIVE",
        },
      });
      logger.info("Property created successfully", {
        propertyId: property.id,
        ownerId: data.ownerId,
      });
      return property;
    } catch (error) {
      logger.error("Error creating property:", error);
      throw error;
    }
  }

  /**
   * Find property by ID
   */
  async findById(id: string, ownerId?: string): Promise<Property | null> {
    try {
      const prismaClient = getPrismaClient();
      const where: any = {
        id,
        deletedAt: null,
      };
      if (ownerId) {
        where.ownerId = ownerId;
      }
      return await prismaClient.property.findFirst({
        where,
      });
    } catch (error) {
      logger.error("Error finding property by ID:", error);
      throw error;
    }
  }

  /**
   * Find all properties with pagination, search, filter, and sort
   */
  async findAll(
    ownerId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: PropertyStatus;
      city?: string;
      propertyType?: string;
      sort?: "name" | "createdAt" | "city" | "updatedAt";
      order?: "asc" | "desc";
    },
  ): Promise<PaginationResult<Property>> {
    try {
      const prismaClient = getPrismaClient();
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, Math.min(options.limit || 10, 100));
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        ownerId,
        deletedAt: null,
      };

      if (options.status) {
        where.status = options.status;
      }

      if (options.city) {
        where.city = { contains: options.city, mode: "insensitive" };
      }

      if (options.propertyType) {
        where.propertyType = { contains: options.propertyType, mode: "insensitive" };
      }

      if (options.search) {
        where.OR = [
          { propertyName: { contains: options.search, mode: "insensitive" } },
          { address: { contains: options.search, mode: "insensitive" } },
          { city: { contains: options.search, mode: "insensitive" } },
        ];
      }

      // Build order by
      const orderBy: any = {};
      const sortField = options.sort || "createdAt";
      const sortOrder = options.order || "desc";

      if (sortField === "name") {
        orderBy.propertyName = sortOrder;
      } else if (sortField === "city") {
        orderBy.city = sortOrder;
      } else {
        orderBy[sortField] = sortOrder;
      }

      // Fetch properties and total count
      const [properties, total] = await Promise.all([
        prismaClient.property.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prismaClient.property.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info("Properties fetched successfully", { ownerId, total, page, limit });

      return {
        data: properties,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error("Error fetching properties:", error);
      throw error;
    }
  }

  /**
   * Update property
   */
  async update(
    id: string,
    ownerId: string,
    data: Partial<{
      propertyName: string;
      propertyType: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
      totalFloors: number;
      description: string | null;
      imageUrl: string | null;
      status: PropertyStatus;
    }>,
  ): Promise<Property> {
    try {
      const prismaClient = getPrismaClient();
      const property = await prismaClient.property.updateMany({
        where: {
          id,
          ownerId,
          deletedAt: null,
        },
        data,
      });

      if (property.count === 0) {
        throw new Error("Property not found or access denied");
      }

      logger.info("Property updated successfully", { propertyId: id, ownerId });

      // Fetch the updated property
      return (await this.findById(id, ownerId)) as Property;
    } catch (error) {
      logger.error("Error updating property:", error);
      throw error;
    }
  }

  /**
   * Soft delete property
   */
  async softDelete(id: string, ownerId: string): Promise<Property> {
    try {
      const prismaClient = getPrismaClient();
      const property = await prismaClient.property.updateMany({
        where: {
          id,
          ownerId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (property.count === 0) {
        throw new Error("Property not found or access denied");
      }

      logger.info("Property deleted successfully", { propertyId: id, ownerId });

      // Fetch the deleted property
      const deletedProperty = await prismaClient.property.findFirst({
        where: { id },
      });

      if (!deletedProperty) {
        throw new Error("Property not found after deletion");
      }

      return deletedProperty;
    } catch (error) {
      logger.error("Error deleting property:", error);
      throw error;
    }
  }

  /**
   * Permanently delete a property and every record that belongs to it
   * (rooms/floors, beds, tenants, payments, receipts, maintenance...).
   *
   * Child rows are removed through the schema's ON DELETE CASCADE rules.
   * Bed -> currentTenant links are detached first so tenant deletion can never
   * fail on a lingering reference, and orphan notifications (which have no FK)
   * are cleaned up explicitly.
   */
  async hardDelete(id: string, ownerId: string): Promise<void> {
    try {
      const prismaClient = getPrismaClient();

      const owned = await prismaClient.property.findFirst({
        where: { id, ownerId },
        select: { id: true },
      });

      if (!owned) {
        throw new Error("Property not found or access denied");
      }

      await prismaClient.$transaction(async (tx: any) => {
        // Detach current tenant references on beds of this property.
        await tx.bed.updateMany({
          where: { room: { propertyId: id } },
          data: { currentTenantId: null },
        });

        // Notifications reference propertyId without a foreign key.
        await tx.notification.deleteMany({ where: { propertyId: id } });

        // Cascades remove rooms, beds, tenants, payments, receipts, etc.
        await tx.property.delete({ where: { id } });
      });

      logger.info("Property permanently deleted", { propertyId: id, ownerId });
    } catch (error) {
      logger.error("Error permanently deleting property:", error);
      throw error;
    }
  }


  /**
   * Check if property name exists for owner
   */
  async propertyNameExists(
    ownerId: string,
    propertyName: string,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      const prismaClient = getPrismaClient();
      const where: any = {
        ownerId,
        propertyName: { equals: propertyName, mode: "insensitive" },
        deletedAt: null,
      };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await prismaClient.property.count({ where });
      return count > 0;
    } catch (error) {
      logger.error("Error checking property name existence:", error);
      throw error;
    }
  }

  /**
   * Update property image
   */
  async updateImage(id: string, ownerId: string, imageUrl: string): Promise<Property> {
    try {
      const prismaClient = getPrismaClient();
      const property = await prismaClient.property.updateMany({
        where: {
          id,
          ownerId,
          deletedAt: null,
        },
        data: {
          imageUrl,
        },
      });

      if (property.count === 0) {
        throw new Error("Property not found or access denied");
      }

      logger.info("Property image updated", { propertyId: id, ownerId });

      return (await this.findById(id, ownerId)) as Property;
    } catch (error) {
      logger.error("Error updating property image:", error);
      throw error;
    }
  }
}

export const propertyRepository = new PropertyRepository();
