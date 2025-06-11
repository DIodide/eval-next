// src/lib/db-utils.ts
// This file contains the database utility functions for the API.
// It is used to handle connection issues and prepared statement errors.
// It is also used to handle database transactions with retry logic.
// User made file




import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

/**
 * Database utility functions to handle connection issues and prepared statement errors
 */

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Retry function for database operations that might fail due to connection issues
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if it's a prepared statement error or connection issue
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientInitializationError
      ) {
        console.warn(
          `Database operation failed (attempt ${attempt}/${maxRetries}):`,
          error.message,
        );

        if (attempt < maxRetries) {
          // Wait before retrying with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)),
          );
          continue;
        }
      }

      // If it's not a retriable error or we've exhausted retries, throw immediately
      throw error;
    }
  }

  throw new DatabaseError(
    `Database operation failed after ${maxRetries} attempts`,
    "MAX_RETRIES_EXCEEDED",
    lastError,
  );
}

/**
 * Safe database disconnect that handles errors gracefully
 */
export async function safeDisconnect(): Promise<void> {
  try {
    await db.$disconnect();
  } catch (error) {
    console.warn("Error during database disconnect:", error);
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Wrapper for database transactions with retry logic
 */
export async function safeTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  return withRetry(
    () =>
      db.$transaction(fn, {
        maxWait: options?.maxWait ?? 2000,
        timeout: options?.timeout ?? 5000,
        isolationLevel: options?.isolationLevel ?? "ReadCommitted",
      }),
    3,
    500,
  );
} 