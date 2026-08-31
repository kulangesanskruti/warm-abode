import { logger } from "../src/utils/logger";
import { getPrismaClient, disconnectPrisma } from "../src/utils/prisma";

const prisma = getPrismaClient();

async function main() {
  try {
    logger.info("Seeding database...");

    // Add seed data here as models are created
    // Example:
    // await prisma.user.create({
    //   data: {
    //     email: 'admin@stayhub.com',
    //     name: 'Admin User',
    //     password: hashedPassword,
    //     role: 'admin',
    //   },
    // });

    logger.info("Database seeded successfully");
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await disconnectPrisma();
  }
}

main();
