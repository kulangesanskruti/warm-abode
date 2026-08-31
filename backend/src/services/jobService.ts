import { jobRepository } from "../repositories/jobRepository";
import { redisQueue } from "../queues/redisQueue";
import { automationService } from "./automationService";

const backoff = (attempt: number) =>
  new Date(Date.now() + Math.min(60 * 60 * 1000, 1000 * 2 ** attempt));

export const jobService = {
  async enqueue(
    ownerId: string,
    input: {
      queue?: string;
      type: string;
      payload?: Record<string, unknown>;
      idempotencyKey: string;
      scheduledAt?: Date;
    },
  ) {
    const job = await jobRepository.enqueue({
      ownerId,
      queue: input.queue || "automation",
      type: input.type,
      payload: input.payload || {},
      idempotencyKey: input.idempotencyKey,
      scheduledAt: input.scheduledAt,
      maxAttempts: 3,
    });
    await redisQueue.push({
      id: job.id,
      queue: job.queue,
      type: job.type,
      payload: job.payload as Record<string, unknown>,
    });
    return job;
  },
  async process(ownerId: string, id: string) {
    const job = await jobRepository.get(ownerId, id);
    if (!job) throw new Error("Job not found");
    const claimed = await jobRepository.claim(id);
    if (!claimed.count) return job;
    try {
      if (job.type === "MONTHLY_RENT") await automationService.generateMonthlyRent(ownerId);
      else if (job.type === "PAYMENT_STATUS_REFRESH")
        await automationService.refreshPaymentStatuses(ownerId);
      else if (job.type === "RENT_REMINDERS") await automationService.queueReminders(ownerId);
      else throw new Error(`Unsupported job type: ${job.type}`);
      return jobRepository.complete(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job failed";
      const next = job.attempts + 1 < job.maxAttempts ? backoff(job.attempts) : undefined;
      return jobRepository.fail(id, message, next);
    }
  },
  list: jobRepository.list,
  retry: jobRepository.retry,
};
