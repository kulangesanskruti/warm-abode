import app from "./app";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { disconnectPrisma, getPrismaClient } from "./utils/prisma";
import { startScheduler, stopScheduler } from "./schedulers";

let server: ReturnType<typeof app.listen> | undefined;
let shuttingDown = false;

const startServer = async () => {
  try {
    const prisma = getPrismaClient();
    await prisma.$connect();
    logger.info("Database connected successfully");

    server = app.listen(config.PORT, config.HOST, () => {
      logger.info("Server started", {
        host: config.HOST,
        port: config.PORT,
        environment: config.NODE_ENV,
      });

      // Automation scheduler (monthly rent generation, overdue sync,
      // reminders) — previously defined but never actually started, so no
      // scheduled job ever ran. Startup recovery runs immediately inside.
      startScheduler();
    });
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : "unknown",
    });
    process.exitCode = 1;
  }
};

const gracefulShutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("Graceful shutdown started", { signal });

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, config.SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    stopScheduler();
    if (server)
      await new Promise<void>((resolve, reject) =>
        server!.close((error) => (error ? reject(error) : resolve())),
      );
    await disconnectPrisma();
    clearTimeout(forceExit);
    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExit);
    logger.error("Graceful shutdown failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    process.exit(1);
  }
};

process.once("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.once("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (reason) =>
  logger.error("Unhandled rejection", { reason: String(reason) }),
);
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error: error.message });
  void gracefulShutdown("uncaughtException");
});

void startServer();
