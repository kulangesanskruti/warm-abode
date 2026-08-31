import { randomUUID } from "crypto";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { automationService } from "../services/automationService";

const prisma = getPrismaClient();

/** Owners processed per run. Bounds the work a single tick can do. */
const OWNER_BATCH_SIZE = 200;
/** How long a lease is held before it is considered abandoned. */
const LOCK_TTL_MS = 10 * 60 * 1000;

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const dayKey = (date: Date) =>
  `${monthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;

/**
 * Acquire a single-flight lease. Returns a release function, or null when
 * another run currently holds the lease. Expired leases are stolen so a
 * crashed run can never block the job permanently.
 */
async function acquireLock(name: string, ttlMs = LOCK_TTL_MS) {
  const runId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);

  try {
    await prisma.schedulerLock.create({ data: { name, runId, expiresAt } });
  } catch (error) {
    if ((error as { code?: string })?.code !== "P2002") throw error;
    // Row exists — only take it over when the previous lease has expired.
    const stolen = await prisma.schedulerLock.updateMany({
      where: { name, expiresAt: { lt: now } },
      data: { runId, lockedAt: now, expiresAt },
    });
    if (!stolen.count) return null;
  }

  return async () => {
    await prisma.schedulerLock.deleteMany({ where: { name, runId } });
  };
}

async function alreadyCompleted(key: string) {
  return Boolean(await prisma.schedulerRun.findUnique({ where: { key } }));
}

async function markCompleted(key: string, detail: Record<string, unknown>) {
  await prisma.schedulerRun.upsert({
    where: { key },
    create: { key, detail: detail as never },
    update: { completedAt: new Date(), detail: detail as never },
  });
}

async function listOwnerIds() {
  const owners = await prisma.user.findMany({
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: OWNER_BATCH_SIZE,
  });
  return owners.map((owner: { id: string }) => owner.id);
}

/**
 * Runs `task` for every owner, never letting one owner's failure abort the
 * rest of the batch.
 */
async function forEachOwner<T>(job: string, task: (ownerId: string) => Promise<T>) {
  const ownerIds = await listOwnerIds();
  let failed = 0;
  const results: T[] = [];
  for (const ownerId of ownerIds) {
    try {
      results.push(await task(ownerId));
    } catch (error) {
      failed++;
      logger.error("Scheduled job failed for owner", {
        job,
        ownerId,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }
  return { owners: ownerIds.length, failed, results };
}

export const automationScheduler = {
  /**
   * Generate the current month's rent for every active tenant of every
   * owner. Safe to call any number of times per month: the run marker
   * short-circuits repeats, the lease prevents overlap, and the
   * unique(tenantId, month, year) payment constraint is the final backstop.
   * Previously paid rows belong to earlier months and are never touched.
   */
  async monthlyRent(now = new Date(), options: { force?: boolean } = {}) {
    const key = `monthly-rent:${monthKey(now)}`;
    if (!options.force && (await alreadyCompleted(key)))
      return { skipped: true, reason: "already-generated", key };

    const release = await acquireLock("monthly-rent");
    if (!release) return { skipped: true, reason: "locked", key };

    try {
      const outcome = await forEachOwner("monthly-rent", (ownerId) =>
        automationService.generateMonthlyRent(ownerId, now),
      );
      const generated = outcome.results
        .flat()
        .reduce((sum, entry: { generated?: number }) => sum + (entry.generated ?? 0), 0);

      // Only record the month as done when every owner succeeded, so a
      // partial failure is retried on the next tick.
      if (!outcome.failed) await markCompleted(key, { generated, owners: outcome.owners });

      logger.info("Monthly rent job finished", { key, ...outcome, generated });
      return { skipped: false, key, generated, owners: outcome.owners, failed: outcome.failed };
    } finally {
      await release();
    }
  },

  /**
   * Flip past-due unpaid rent to OVERDUE and emit exactly one overdue
   * notification per rent record (dedupe key = payment id).
   */
  async paymentStatuses(now = new Date()) {
    const release = await acquireLock("payment-statuses");
    if (!release) return { skipped: true, reason: "locked" };
    try {
      const outcome = await forEachOwner("payment-statuses", (ownerId) =>
        automationService.refreshPaymentStatuses(ownerId, now),
      );
      const overdue = outcome.results.reduce(
        (sum, entry: { overdue?: number }) => sum + (entry?.overdue ?? 0),
        0,
      );
      logger.info("Payment status job finished", { owners: outcome.owners, overdue });
      return { skipped: false, owners: outcome.owners, overdue, failed: outcome.failed };
    } finally {
      await release();
    }
  },

  /** Daily WhatsApp rent reminders. Once per calendar day. */
  async reminders(now = new Date()) {
    const key = `reminders:${dayKey(now)}`;
    if (await alreadyCompleted(key)) return { skipped: true, reason: "already-sent", key };
    const release = await acquireLock("reminders");
    if (!release) return { skipped: true, reason: "locked", key };
    try {
      const outcome = await forEachOwner("reminders", (ownerId) =>
        automationService.queueReminders(ownerId, now),
      );
      if (!outcome.failed) await markCompleted(key, { owners: outcome.owners });
      return { skipped: false, key, owners: outcome.owners, failed: outcome.failed };
    } finally {
      await release();
    }
  },

  /**
   * Startup recovery: if the process was down on the 1st, the current
   * month's rent still hasn't been generated. Running the same idempotent
   * monthly job at boot fills the gap, then brings overdue statuses up to
   * date. Both are no-ops when the work was already done.
   */
  async recoverOnStartup(now = new Date()) {
    const rent = await this.monthlyRent(now);
    const statuses = await this.paymentStatuses(now);
    logger.info("Startup automation recovery completed", { rent, statuses });
    return { rent, statuses };
  },
};
