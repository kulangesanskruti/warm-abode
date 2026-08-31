import { Redis } from "@upstash/redis";
import { getPrismaClient } from "./prisma";

const timeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("dependency timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const checkDatabase = async (ms = 2000) => {
  await timeout(getPrismaClient().$queryRaw`SELECT 1`, ms);
  return "ok" as const;
};

export const checkRedis = async (ms = 2000) => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return "not_configured" as const;
  await timeout(new Redis({ url, token }).ping(), ms);
  return "ok" as const;
};
