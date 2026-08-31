import { Request, Response, NextFunction } from "express";
import { ApiError, HttpStatusCode, sendErrorResponse, sendApiResponse } from "../utils/errors";
import { logger } from "../utils/logger";

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  _res: Response,
  _next: NextFunction,
) => {
  logger.error("Error caught by global handler:", {
    message: error.message,
    statusCode: error instanceof ApiError ? error.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR,
    path: req.path,
    method: req.method,
  });

  if (error instanceof ApiError) {
    return sendErrorResponse(_res, error, error.statusCode);
  }

  // Never expose framework, database, or provider error details to clients.
  return sendApiResponse(
    _res,
    HttpStatusCode.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
  );
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new ApiError(`Cannot find ${req.method} ${req.path}`, HttpStatusCode.NOT_FOUND);
  next(error);
};
