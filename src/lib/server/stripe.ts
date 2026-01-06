import { env } from "@/env";
import { db } from "@/server/db";
import Stripe from "stripe";
import { syncStripeCustomerToClerk } from "./clerk-stripe-sync";

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 30000,
});

/**
 * Get or create a Stripe customer for a Clerk user
 * This ensures we have a Stripe customer ID linked to each Clerk user
 */
export async function getOrCreateStripeCustomer(
  clerkUserId: string,
  email: string,
): Promise<string> {
  // Check if customer already exists in our database
  const existingCustomer = await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
  });

  if (existingCustomer) {
    return existingCustomer.stripe_customer_id;
  }

  // Create customer in Stripe
  const stripeCustomer = await stripe.customers.create({
    email,
    metadata: {
      clerk_user_id: clerkUserId,
    },
  });

  // Store in database
  await db.stripeCustomer.create({
    data: {
      clerk_user_id: clerkUserId,
      stripe_customer_id: stripeCustomer.id,
      email,
    },
  });

  // Sync to Clerk metadata for built-in integration
  try {
    await syncStripeCustomerToClerk(clerkUserId, stripeCustomer.id);
  } catch (error) {
    // Log but don't fail - customer is created in Stripe and DB
    console.error(`[STRIPE] Failed to sync customer to Clerk metadata:`, error);
  }

  return stripeCustomer.id;
}

/**
 * Get Stripe customer ID from Clerk user ID
 */
export async function getStripeCustomerId(
  clerkUserId: string,
): Promise<string | null> {
  const customer = await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
  });

  return customer?.stripe_customer_id ?? null;
}

/**
 * Get database customer record from Clerk user ID
 */
export async function getCustomerRecord(clerkUserId: string) {
  return await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
    include: {
      subscriptions: {
        where: {
          status: {
            in: ["ACTIVE", "TRIALING", "PAST_DUE"],
          },
        },
        orderBy: {
          created_at: "desc",
        },
      },
      purchases: {
        where: {
          status: "SUCCEEDED",
        },
        orderBy: {
          created_at: "desc",
        },
      },
      entitlements: {
        where: {
          is_active: true,
        },
      },
    },
  });
}
