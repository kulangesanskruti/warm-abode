import { Response } from "express";
import { logger } from "./logger";

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  TOO_MANY_REQUESTS = 429,
}

export class ApiError extends Error {
  public statusCode: HttpStatusCode;
  public errors?: any[];
  public isOperational: boolean = true;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    errors?: any[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  timestamp: string;
  path?: string;
}

export const sendApiResponse = <T = any>(
  res: Response,
  statusCode: HttpStatusCode,
  message: string,
  data?: T,
  errors?: any[],
): Response => {
  const response: ApiResponseData<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    errors,
    timestamp: new Date().toISOString(),
    path: res.req?.originalUrl,
  };

  return res.status(statusCode).json(response);
};

export const sendSuccessResponse = <T = any>(
  res: Response,
  data?: T,
  message: string = "Success",
  statusCode: HttpStatusCode = HttpStatusCode.OK,
): Response => {
  return sendApiResponse(res, statusCode, message, data);
};

export const sendErrorResponse = (
  res: Response,
  error: ApiError | Error,
  statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
): Response => {
  const message = error instanceof ApiError ? error.message : "An unexpected error occurred";
  const errorsList = error instanceof ApiError ? error.errors : undefined;

  logger.error(`API Error: ${message}`, {
    statusCode,
    errors: errorsList,
    stack: error.stack,
  });

  return sendApiResponse(res, statusCode, message, undefined, errorsList);
};

/**
 * Turns a Zod field-error map into a 422 with one entry per offending field,
 * so clients can highlight the exact input instead of showing a generic
 * "Validation failed" banner.
 */
export const validationError = (
  errors: Record<string, string[]> | undefined,
  fallbackMessage = "Validation failed",
): ApiError => {
  const entries = Object.entries(errors ?? {});
  const details = entries.map(([field, messages]) => ({
    field,
    messages,
  }));

  const message = entries.length
    ? entries.map(([field, messages]) => `${field}: ${messages.join(", ")}`).join("; ")
    : fallbackMessage;

  return new ApiError(message, HttpStatusCode.UNPROCESSABLE_ENTITY, details);
};

export const asyncHandler = (fn: (req: any, res: Response, next: any) => Promise<any>) => {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
