/**
 * Response Formatting Utilities
 * Standardized response formatting for consistency across the API
 */

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
  meta?: {
    version: string;
    requestId?: string;
  };
}

export const createSuccessResponse = <T = any>(
  data: T,
  message: string = "Success",
  meta?: any,
): StandardResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    meta: {
      version: "1.0.0",
      ...meta,
    },
  };
};

export const createErrorResponse = (
  message: string,
  errors?: Record<string, string[]>,
  meta?: any,
): StandardResponse => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
    meta: {
      version: "1.0.0",
      ...meta,
    },
  };
};

export const createPaginatedSuccessResponse = <T = any>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message: string = "Success",
  meta?: any,
): StandardResponse<T[]> & { pagination: typeof pagination } => {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
    meta: {
      version: "1.0.0",
      ...meta,
    },
  };
};
