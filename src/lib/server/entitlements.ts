import { db } from "@/server/db";
import type { EntitlementSource } from "@prisma/client";

/**
 * Feature keys enum - centralize feature names to avoid typos
 * Add new features here as needed
 */
export const FEATURE_KEYS = {
  PREMIUM_SEARCH: "premium_search",
  ADVANCED_ANALYTICS: "advanced_analytics",
  UNLIMITED_MESSAGES: "unlimited_messages",
  PRIORITY_SUPPORT: "priority_support",
  CUSTOM_BRANDING: "custom_branding",
  API_ACCESS: "api_access",
  BULK_OPERATIONS: "bulk_operations",
  EXPORT_DATA: "export_data",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

/**
 * Check if a user has access to a specific feature
 */
export async function hasFeatureAccess(
  clerkUserId: string,
  featureKey: FeatureKey,
): Promise<boolean> {
  const customer = await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
    include: {
      entitlements: {
        where: {
          feature_key: featureKey,
          is_active: true,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } },
          ],
        },
      },
    },
  });

  if (!customer) {
    return false;
  }

  return customer.entitlements.length > 0;
}

/**
 * Get all active entitlements for a user
 */
export async function getUserEntitlements(clerkUserId: string) {
  const customer = await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
    include: {
      entitlements: {
        where: {
          is_active: true,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } },
          ],
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  return customer?.entitlements ?? [];
}

/**
 * Grant an entitlement to a user
 */
export async function grantEntitlement(
  clerkUserId: string,
  featureKey: FeatureKey,
  source: EntitlementSource,
  options?: {
    subscriptionId?: string;
    purchaseId?: string;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
  },
) {
  const customer = await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
  });

  if (!customer) {
    throw new Error(`Customer not found for user: ${clerkUserId}`);
  }

  // Upsert entitlement
  await db.entitlement.upsert({
    where: {
      stripe_customer_id_feature_key: {
        stripe_customer_id: customer.id,
        feature_key: featureKey,
      },
    },
    create: {
      stripe_customer_id: customer.id,
      feature_key: featureKey,
      granted_by_type: source,
      subscription_id: options?.subscriptionId ?? null,
      purchase_id: options?.purchaseId ?? null,
      expires_at: options?.expiresAt ?? null,
      metadata: options?.metadata ? JSON.parse(JSON.stringify(options.metadata)) : null,
      is_active: true,
    },
    update: {
      granted_by_type: source,
      subscription_id: options?.subscriptionId ?? null,
      purchase_id: options?.purchaseId ?? null,
      expires_at: options?.expiresAt ?? null,
      metadata: options?.metadata ? JSON.parse(JSON.stringify(options.metadata)) : null,
      is_active: true,
      updated_at: new Date(),
    },
  });
}

/**
 * Revoke an entitlement from a user
 */
export async function revokeEntitlement(
  clerkUserId: string,
  featureKey: FeatureKey,
) {
  const customer = await db.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
  });

  if (!customer) {
    return;
  }

  await db.entitlement.updateMany({
    where: {
      stripe_customer_id: customer.id,
      feature_key: featureKey,
    },
    data: {
      is_active: false,
      updated_at: new Date(),
    },
  });
}

/**
 * Revoke all entitlements from a subscription
 */
export async function revokeSubscriptionEntitlements(
  subscriptionId: string,
) {
  await db.entitlement.updateMany({
    where: {
      subscription_id: subscriptionId,
    },
    data: {
      is_active: false,
      updated_at: new Date(),
    },
  });
}

/**
 * Clean up expired entitlements (should be run periodically)
 */
export async function cleanupExpiredEntitlements() {
  const result = await db.entitlement.updateMany({
    where: {
      is_active: true,
      expires_at: {
        lte: new Date(),
      },
    },
    data: {
      is_active: false,
      updated_at: new Date(),
    },
  });

  return result.count;
}

