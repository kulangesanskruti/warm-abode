import { logger } from "../utils/logger";
import { automationScheduler } from "./automationScheduler";

/**
 * In-process automation scheduler.
 *
 * A single interval drives every scheduled job. Each job is individually
 * idempotent (run markers + DB lease + unique constraints), so ticking
 * often is cheap and safe — the tick is a trigger, not the source of
 * correctness.
 */
const TICK_INTERVAL_MS = Number(process.env.SCHEDULER_INTERVAL_MS || 15 * 60 * 1000);

let timer: NodeJS.Timeout | undefined;
let ticking = false;

export async function runSchedulerTick(now = new Date()) {
  // In-process single-flight on top of the DB lease: a slow tick must never
  // overlap with the next one.
  if (ticking) return { skipped: true, reason: "tick-in-progress" };
  ticking = true;
  try {
    // Monthly rent for the current month (no-op once done this month).
    const rent = await automationScheduler.monthlyRent(now);
    // Overdue transitions + overdue notifications.
    const statuses = await automationScheduler.paymentStatuses(now);
    // Daily reminders (no-op once done today).
    const reminders = await automationScheduler.reminders(now);
    return { skipped: false, rent, statuses, reminders };
  } catch (error) {
    logger.error("Scheduler tick failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return { skipped: false, error: true };
  } finally {
    ticking = false;
  }
}

export function startScheduler() {
  if (timer) return;
  if (process.env.DISABLE_SCHEDULER === "true") {
    logger.warn("Automation scheduler disabled via DISABLE_SCHEDULER");
    return;
  }

  logger.info("Automation scheduler starting", { intervalMs: TICK_INTERVAL_MS });

  // Startup recovery: covers the case where the server was down on the 1st
  // (or for any stretch of the month) and the current month's rent was
  // never generated.
  void automationScheduler.recoverOnStartup().catch((error) =>
    logger.error("Startup automation recovery failed", {
      error: error instanceof Error ? error.message : "unknown",
    }),
  );

  timer = setInterval(() => void runSchedulerTick(), TICK_INTERVAL_MS);
  // Don't hold the event loop open on shutdown.
  timer.unref?.();
}

export function stopScheduler() {
  if (!timer) return;
  clearInterval(timer);
  timer = undefined;
  logger.info("Automation scheduler stopped");
}

export { automationScheduler };
