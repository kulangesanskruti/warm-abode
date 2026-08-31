import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "../config/env";
import { logger } from "./logger";

let prismaInstance: PrismaClient | null = null;
let poolInstance: Pool | null = null;

export const getPrismaClient = () => {
  if (!prismaInstance) {
    if (!config.DATABASE_URL) {
      logger.error("DATABASE_URL is not configured. Cannot initialize Prisma client.");
      throw new Error("Database connection not configured. Set DATABASE_URL in your environment.");
    }

    poolInstance = new Pool({
      connectionString: config.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
    prismaInstance = new PrismaClient({ adapter: new PrismaPg(poolInstance) });
  }
  return prismaInstance;
};

export const disconnectPrisma = async () => {
  if (prismaInstance) await prismaInstance.$disconnect();
  if (poolInstance) await poolInstance.end();
  prismaInstance = null;
  poolInstance = null;
};
