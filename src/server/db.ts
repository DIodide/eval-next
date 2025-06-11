import { PrismaClient } from "@prisma/client";
import { env } from "@/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Configure connection pooling to prevent prepared statement errors
    transactionOptions: {
      timeout: 5000, // 5 seconds
      maxWait: 2000, // 2 seconds
      isolationLevel: "ReadCommitted",
    },
    // Disable prepared statements for Supabase compatibility
    ...(env.DATABASE_URL?.includes('supabase.com') && {
      // Configure for Supabase PgBouncer
      datasources: {
        db: {
          url: env.DATABASE_URL + (env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1',
        },
      },
    }),
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Use singleton pattern to prevent multiple instances
export const db =
  globalForPrisma.prisma ??
  (() => {
    const client = createPrismaClient();
    
    // Handle disconnect on process termination
    process.on("beforeExit", () => {
      void client.$disconnect();
    });
    
    return client;
  })();

if (env.NODE_ENV !== "production") {
  // This is a hack to get the prisma client to work in development
  console.log("Setting global prisma client");
  globalForPrisma.prisma = db;
}
