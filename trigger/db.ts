import { PrismaClient } from "@prisma/client";

const globalForTriggerPrisma = globalThis as unknown as {
  triggerPrisma: PrismaClient | undefined;
};

export const triggerDb =
  globalForTriggerPrisma.triggerPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForTriggerPrisma.triggerPrisma = triggerDb;
}
