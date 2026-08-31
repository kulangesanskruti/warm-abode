import { getPrismaClient } from "../utils/prisma";
import { propertyRepository, Property } from "../repositories/propertyRepository";
import {
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyQuery,
  PropertyStatus,
} from "../validators/property";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { logger } from "../utils/logger";

// Lazy load Prisma client for activity logging

interface PropertyDetailsResponse extends Property {
  totalRooms?: number;
  totalBeds?: number;
  occupiedBeds?: number;
  vacantBeds?: number;
  occupancyPercentage?: number;
  monthlyRevenue?: number;
  pendingRent?: number;
  pendingTenantCount?: number;
  maintenanceCount?: number;
}

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PropertyService {
  /**
   * Create a new property
   */
  async createProperty(ownerId: string, data: CreatePropertyRequest): Promise<Property> {
    try {
      // Check for duplicate property name
      const exists = await propertyRepository.propertyNameExists(ownerId, data.propertyName);
      if (exists) {
        throw new ApiError("Property with this name already exists", HttpStatusCode.CONFLICT);
      }

      // Create property
      const property = await propertyRepository.create({
        ownerId,
        propertyName: data.propertyName,
        propertyType: data.propertyType,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        totalFloors: data.totalFloors,
        description: data.description,
        imageUrl: data.imageUrl,
      });

      // Log activity
      await this.logActivity(
        ownerId,
        "PROPERTY_CREATED",
        property.id,
        `Created property: ${data.propertyName}`,
      );

      logger.info("Property created via service", { propertyId: property.id, ownerId });
      return property;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Error creating property:", error);
      throw new ApiError("Failed to create property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get all properties with filters and pagination
   */
  async getAllProperties(
    ownerId: string,
    query: Partial<PropertyQuery>,
  ): Promise<PaginationResult<PropertyDetailsResponse>> {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError("Invalid pagination parameters", HttpStatusCode.BAD_REQUEST);
      }

      const properties = await propertyRepository.findAll(ownerId, {
        page,
        limit,
        search: query.search,
        status: query.status as PropertyStatus | undefined,
        city: query.city,
        propertyType: query.propertyType,
        sort: query.sort as "name" | "createdAt" | "city" | "updatedAt" | undefined,
        order: query.order as "asc" | "desc" | undefined,
      });

      // The list view (Properties page) shows bed/vacancy counts per card —
      // same rule as the single-property endpoint: derive them from the
      // live bed rows for every property on this page in one query rather
      // than leaving them undefined (which the UI would render as "0 beds").
      const propertyIds = properties.data.map((p) => p.id);
      const bedsByProperty = new Map<string, { total: number; occupied: number }>();
      if (propertyIds.length > 0) {
        const prismaClient = getPrismaClient();
        const rooms = await prismaClient.room.findMany({
          where: { propertyId: { in: propertyIds }, deletedAt: null },
          select: { propertyId: true, beds: { select: { status: true } } },
        });
        for (const room of rooms) {
          const entry = bedsByProperty.get(room.propertyId) ?? { total: 0, occupied: 0 };
          entry.total += room.beds.length;
          entry.occupied += room.beds.filter((b) => b.status === "OCCUPIED").length;
          bedsByProperty.set(room.propertyId, entry);
        }
      }

      const data: PropertyDetailsResponse[] = properties.data.map((property) => {
        const beds = bedsByProperty.get(property.id) ?? { total: 0, occupied: 0 };
        const vacantBeds = Math.max(beds.total - beds.occupied, 0);
        return {
          ...property,
          totalBeds: beds.total,
          occupiedBeds: beds.occupied,
          vacantBeds,
          occupancyPercentage:
            beds.total > 0 ? Number(((beds.occupied / beds.total) * 100).toFixed(2)) : 0,
        };
      });

      logger.info("Properties retrieved via service", { ownerId, count: properties.data.length });
      return { ...properties, data };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Error fetching properties:", error);
      throw new ApiError("Failed to fetch properties", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get property by ID with details
   */
  async getPropertyById(id: string, ownerId: string): Promise<PropertyDetailsResponse> {
    try {
      const property = await propertyRepository.findById(id, ownerId);

      if (!property) {
        throw new ApiError("Property not found", HttpStatusCode.NOT_FOUND);
      }

      // Fetch aggregated data
      const prismaClient = getPrismaClient();

      // Room/bed counts are the single source of truth for "does this
      // property have anything vacant" — the Overview cards, the Tenant
      // assignment flow and this endpoint must all agree, so this pulls the
      // live bed rows rather than trusting any cached/derived number.
      const [rooms, maintenanceCount, pendingPayments] = await Promise.all([
        prismaClient.room.findMany({
          where: { propertyId: id, deletedAt: null },
          select: {
            rentPerBed: true,
            beds: { select: { status: true } },
          },
        }),
        prismaClient.maintenance.count({
          where: { propertyId: id, status: "OPEN" },
        }),
        // Outstanding rent for this property: same definition the Rent
        // module uses — any non-settled, non-cancelled rent row still
        // carrying an outstanding balance.
        prismaClient.payment.findMany({
          where: {
            propertyId: id,
            status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
          },
          select: { tenantId: true, outstandingAmount: true },
        }),
      ]);

      const pendingRent = pendingPayments.reduce(
        (sum: number, p: { outstandingAmount: unknown }) => sum + Number(p.outstandingAmount),
        0,
      );
      const pendingTenantCount = new Set(
        pendingPayments
          .filter((p: { outstandingAmount: unknown }) => Number(p.outstandingAmount) > 0)
          .map((p: { tenantId: string }) => p.tenantId),
      ).size;

      const totalRooms = rooms.length;
      let totalBeds = 0;
      let occupiedBeds = 0;
      let monthlyRevenue = 0;
      for (const room of rooms) {
        const roomOccupied = room.beds.filter((b) => b.status === "OCCUPIED").length;
        totalBeds += room.beds.length;
        occupiedBeds += roomOccupied;
        monthlyRevenue += Number(room.rentPerBed) * roomOccupied;
      }
      const vacantBeds = Math.max(totalBeds - occupiedBeds, 0);
      const occupancyPercentage =
        totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(2)) : 0;

      // Calculate aggregates
      const details: PropertyDetailsResponse = {
        ...property,
        totalRooms,
        totalBeds,
        occupiedBeds,
        vacantBeds,
        occupancyPercentage,
        monthlyRevenue,
        pendingRent,
        pendingTenantCount,
        maintenanceCount,
      };

      logger.info("Property details retrieved via service", { propertyId: id, ownerId });
      return details;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Error fetching property details:", error);
      throw new ApiError("Failed to fetch property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update property
   */
  async updateProperty(
    id: string,
    ownerId: string,
    data: UpdatePropertyRequest,
  ): Promise<Property> {
    try {
      // Check if property exists
      const property = await propertyRepository.findById(id, ownerId);
      if (!property) {
        throw new ApiError("Property not found", HttpStatusCode.NOT_FOUND);
      }

      // Check for duplicate property name if updating the name
      if (data.propertyName && data.propertyName !== property.propertyName) {
        const exists = await propertyRepository.propertyNameExists(ownerId, data.propertyName, id);
        if (exists) {
          throw new ApiError("Property with this name already exists", HttpStatusCode.CONFLICT);
        }
      }

      // Update property
      const updatedProperty = await propertyRepository.update(id, ownerId, data);

      // Log activity
      await this.logActivity(
        ownerId,
        "PROPERTY_UPDATED",
        id,
        `Updated property: ${property.propertyName}`,
      );

      logger.info("Property updated via service", { propertyId: id, ownerId });
      return updatedProperty;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Error updating property:", error);
      throw new ApiError("Failed to update property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete property (soft delete)
   */
  async deleteProperty(id: string, ownerId: string, permanent = false): Promise<void> {
    try {
      // Check if property exists
      const property = await propertyRepository.findById(id, ownerId);
      if (!property) {
        throw new ApiError("Property not found", HttpStatusCode.NOT_FOUND);
      }

      // Log activity before deletion so the property name is still available
      await this.logActivity(
        ownerId,
        "PROPERTY_DELETED",
        id,
        `${permanent ? "Permanently deleted" : "Deleted"} property: ${property.propertyName}`,
      );

      if (permanent) {
        await propertyRepository.hardDelete(id, ownerId);
      } else {
        await propertyRepository.softDelete(id, ownerId);
      }

      logger.info("Property deleted via service", { propertyId: id, ownerId });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Error deleting property:", error);
      throw new ApiError("Failed to delete property", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Upload property image
   */
  async uploadPropertyImage(id: string, ownerId: string, imageUrl: string): Promise<Property> {
    try {
      // Check if property exists
      const property = await propertyRepository.findById(id, ownerId);
      if (!property) {
        throw new ApiError("Property not found", HttpStatusCode.NOT_FOUND);
      }

      // Update image
      const updatedProperty = await propertyRepository.updateImage(id, ownerId, imageUrl);

      // Log activity
      await this.logActivity(
        ownerId,
        "PROPERTY_IMAGE_UPDATED",
        id,
        `Updated property image: ${property.propertyName}`,
      );

      logger.info("Property image uploaded via service", { propertyId: id, ownerId });
      return updatedProperty;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Error uploading property image:", error);
      throw new ApiError("Failed to upload property image", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Log activity to audit trail
   */
  private async logActivity(
    userId: string,
    action: string,
    entityId: string,
    description: string,
  ): Promise<void> {
    try {
      const prismaClient = getPrismaClient();
      await prismaClient.activityLog.create({
        data: {
          userId,
          action,
          entity: "PROPERTY",
          entityId,
          description,
        },
      });
    } catch (error) {
      logger.warn("Failed to log activity:", error);
      // Don't throw - activity logging is non-critical
    }
  }
}

export const propertyService = new PropertyService();
