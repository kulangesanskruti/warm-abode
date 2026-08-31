import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";
import { ApiError, HttpStatusCode } from "../utils/errors";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const getClientIdentifier = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

const cleanupStore = () => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
};

/**
 * Dedicated limiter for credential endpoints (login / register / password
 * reset). Brute-force and credential-stuffing need a far tighter budget than
 * ordinary API traffic, and the counter is keyed on IP + submitted identifier
 * so one attacker cannot cycle emails from a single address, and distributed
 * attempts against one account are still throttled.
 */
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 5;

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIdentifier(req);
  const identifier =
    typeof req.body?.email === "string"
      ? req.body.email.toLowerCase()
      : typeof req.body?.phone === "string"
        ? req.body.phone
        : "";

  const now = Date.now();
  if (Math.random() < 0.05) {
    cleanupStore();
  }

  // Two independent buckets: per source address, and per targeted account.
  const keys = [`auth:ip:${ip}`];
  if (identifier) {
    keys.push(`auth:id:${identifier}`);
  }

  for (const key of keys) {
    let entry = store.get(key);
    if (!entry || entry.resetTime < now) {
      entry = { count: 1, resetTime: now + AUTH_WINDOW_MS };
    } else {
      entry.count++;
    }
    store.set(key, entry);

    if (entry.count > AUTH_MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return next(
        new ApiError(
          "Too many authentication attempts. Please try again later.",
          HttpStatusCode.TOO_MANY_REQUESTS,
        ),
      );
    }
  }

  return next();
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting for health checks
  if (req.path === "/health") {
    return next();
  }

  const clientId = getClientIdentifier(req);
  const now = Date.now();

  // Cleanup old entries every 100 requests
  if (Math.random() < 0.01) {
    cleanupStore();
  }

  let entry = store.get(clientId);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.RATE_LIMIT_WINDOW_MS,
    };
  } else {
    entry.count++;

    if (entry.count > config.RATE_LIMIT_MAX_REQUESTS) {
      return next(
        new ApiError(
          "Too many requests. Please try again later.",
          HttpStatusCode.TOO_MANY_REQUESTS,
        ),
      );
    }
  }

  store.set(clientId, entry);

  // Add rate limit headers
  res.setHeader("X-RateLimit-Limit", config.RATE_LIMIT_MAX_REQUESTS);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, config.RATE_LIMIT_MAX_REQUESTS - entry.count));
  res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

  next();
};
