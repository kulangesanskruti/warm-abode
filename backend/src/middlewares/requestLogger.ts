import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Honor a trusted upstream correlation ID, otherwise create one.
  req.id = req.get("x-request-id")?.slice(0, 128) || randomUUID();
  res.setHeader("X-Request-Id", req.id);
  req.startTime = Date.now();

  // Log request
  logger.debug(`[${req.id}] ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body && Object.keys(req.body).length > 0 ? "***redacted***" : undefined,
  });

  const logResponse = () => {
    if (res.locals.requestLogged) return;
    res.locals.requestLogged = true;
    const duration = Date.now() - (req.startTime || Date.now());
    logger.debug(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  };

  res.once("finish", logResponse);
  res.once("close", logResponse);

  next();
};
