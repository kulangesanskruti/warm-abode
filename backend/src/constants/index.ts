/**
 * Application-wide Constants
 */

export enum UserRole {
  ADMIN = "admin",
  LANDLORD = "landlord",
  TENANT = "tenant",
  PROPERTY_MANAGER = "property_manager",
}

export enum PropertyType {
  APARTMENT = "apartment",
  HOUSE = "house",
  VILLA = "villa",
  COMMERCIAL = "commercial",
  SHARED = "shared",
}

export enum RentPaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
  PARTIAL = "partial",
  CANCELLED = "cancelled",
}

export enum NotificationType {
  RENT_DUE = "rent_due",
  RENT_OVERDUE = "rent_overdue",
  MAINTENANCE_REQUEST = "maintenance_request",
  TENANT_MESSAGE = "tenant_message",
  PROPERTY_UPDATE = "property_update",
  SYSTEM = "system",
}

export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
};

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
  EMAIL_VERIFICATION: "24h",
  PASSWORD_RESET: "1h",
};

export const API_VERSIONS = {
  V1: "/api/v1",
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Invalid request",
  CONFLICT: "Resource already exists",
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation failed",
  NOT_IMPLEMENTED: "Feature not implemented yet",
};

export const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  RETRIEVED: "Resource retrieved successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
};
