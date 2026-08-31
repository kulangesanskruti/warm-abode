import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/jobService";
import { jobListSchema, retryJobSchema } from "../validators/jobs";
import { validateAsync } from "../utils/validation";
import { ApiError, HttpStatusCode, sendSuccessResponse, validationError } from "../utils/errors";

const ownerId = (req: Request) => {
  if (!req.user?.userId) throw new ApiError("Authentication required", HttpStatusCode.UNAUTHORIZED);
  return req.user.userId;
};
const parse = async (schema: any, value: unknown): Promise<any> => {
  const result = await validateAsync(schema, value);
  if (!result.isValid) throw validationError(result.errors);
  return result.data;
};

export const jobController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccessResponse(
        res,
        await jobService.list(ownerId(req), await parse(jobListSchema, req.query)),
        "Jobs retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  },
  async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = await parse(retryJobSchema, req.params);
      sendSuccessResponse(res, await jobService.retry(ownerId(req), id), "Job queued for retry");
    } catch (error) {
      next(error);
    }
  },
  async process(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = await parse(retryJobSchema, req.params);
      sendSuccessResponse(
        res,
        await jobService.process(ownerId(req), id),
        "Job processed successfully",
      );
    } catch (error) {
      next(error);
    }
  },
};
