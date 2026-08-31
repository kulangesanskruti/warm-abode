import { Router, Request, Response } from "express";
import { sendSuccessResponse } from "../utils/errors";
import { logger } from "../utils/logger";
import { checkDatabase, checkRedis } from "../utils/dependencyHealth";

const router = Router();
const startedAt = Date.now();

router.get("/", async (_req: Request, res: Response) => {
  const checks = await Promise.allSettled([checkDatabase(), checkRedis()]);
  const database = checks[0].status === "fulfilled" ? checks[0].value : "error";
  const redis = checks[1].status === "fulfilled" ? checks[1].value : "error";
  const healthy = database === "ok" && redis !== "error";
  const data = {
    status: healthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    environment: process.env.NODE_ENV || "development",
    checks: { api: "ok", database, redis },
  };
  if (!healthy) logger.warn("Health check failed", data);
  return res
    .status(healthy ? 200 : 503)
    .json({
      success: healthy,
      message: healthy ? "Health check passed" : "Health check failed",
      data,
    });
});

router.get("/ready", async (_req: Request, res: Response) => {
  const [database, redis] = await Promise.allSettled([checkDatabase(), checkRedis()]);
  const ready = database.status === "fulfilled" && redis.status === "fulfilled";
  return res
    .status(ready ? 200 : 503)
    .json({
      success: ready,
      message: ready ? "Ready" : "Not ready",
      data: {
        ready,
        checks: {
          database: database.status === "fulfilled" ? database.value : "error",
          redis: redis.status === "fulfilled" ? redis.value : "error",
        },
      },
    });
});

router.get("/live", (_req: Request, res: Response) =>
  sendSuccessResponse(res, { alive: true }, "Alive"),
);

export default router;
