import { clerkClient } from "@clerk/nextjs/server";
import { getOrCreateStripeCustomer } from "./stripe";

/**
 * Sync Stripe customer ID to Clerk user metadata
 * This enables Clerk's built-in Stripe integration features
 */
export async function syncStripeCustomerToClerk(
  clerkUserId: string,
  stripeCustomerId: string,
) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        stripeCustomerId,
      },
    });
  } catch (error) {
    console.error(
      `[CLERK-STRIPE SYNC] Failed to sync customer to Clerk:`,
      error,
    );
    throw error;
  }
}

/**
 * Initialize Stripe customer for a Clerk user and sync to Clerk
 * This should be called when a user first interacts with payments
 */
export async function initializeStripeCustomerForClerkUser(
  clerkUserId: string,
  email: string,
): Promise<string> {
  // Create or get Stripe customer
  const stripeCustomerId = await getOrCreateStripeCustomer(clerkUserId, email);

  // Sync to Clerk metadata
  await syncStripeCustomerToClerk(clerkUserId, stripeCustomerId);

  return stripeCustomerId;
}

/**
 * Get Stripe customer ID from Clerk user metadata
 */
export async function getStripeCustomerIdFromClerk(
  clerkUserId: string,
): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    const publicMetadata = user.publicMetadata as
      | { stripeCustomerId?: string }
      | undefined;

    return publicMetadata?.stripeCustomerId ?? null;
  } catch (error) {
    console.error(
      `[CLERK-STRIPE SYNC] Failed to get customer ID from Clerk:`,
      error,
    );
    return null;
  }
}

