import { PrismaClient } from "@prisma/client";
import { env } from "@/env";


const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();


if (env.NODE_ENV !== "production") {
  // This is a hack to get the prisma client to work in development
  console.log("Setting global prisma client");
  globalForPrisma.prisma = db;
}
