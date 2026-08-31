import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError, HttpStatusCode } from "../utils/errors";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Attach validated data to request
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;

      next();
    } catch (error: any) {
      const errors: Record<string, string[]> = {};

      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
      }

      const errorsArray = Object.keys(errors).map((key) => `${key}: ${errors[key].join(", ")}`);
      next(
        new ApiError("Request validation failed", HttpStatusCode.BAD_REQUEST, errorsArray as any),
      );
    }
  };
};

// Global request validation (basic)
export const requestValidation = (req: Request, _res: Response, next: NextFunction) => {
  // Validate Content-Type for POST/PUT/PATCH requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (req.is("multipart/form-data")) return next();
    if (!req.is("json")) {
      return next(
        new ApiError("Content-Type must be application/json", HttpStatusCode.BAD_REQUEST),
      );
    }
  }

  next();
};
