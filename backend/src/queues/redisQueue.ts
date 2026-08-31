import { Redis } from "@upstash/redis";
import { logger } from "../utils/logger";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

export type QueueJob = {
  id: string;
  queue: string;
  type: string;
  payload: Record<string, unknown>;
};
const key = (queue: string) => `stayhub:jobs:${queue}`;

export const redisQueue = {
  enabled: Boolean(redis),
  async push(job: QueueJob) {
    if (!redis) return false;
    try {
      await redis.rpush(key(job.queue), job);
      return true;
    } catch (error) {
      logger.error("Queue push failed", {
        queue: job.queue,
        jobId: job.id,
        error: error instanceof Error ? error.message : "unknown",
      });
      return false;
    }
  },
  async pop(queue: string): Promise<QueueJob | null> {
    if (!redis) return null;
    try {
      return (await redis.lpop<QueueJob>(key(queue))) || null;
    } catch (error) {
      logger.error("Queue pop failed", {
        queue,
        error: error instanceof Error ? error.message : "unknown",
      });
      return null;
    }
  },
  async size(queue: string) {
    return redis ? redis.llen(key(queue)) : 0;
  },
};
