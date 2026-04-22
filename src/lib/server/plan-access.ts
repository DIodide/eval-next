import { db } from "@/server/db";
import {
  FEATURE_KEYS,
  PLAN_FEATURES,
  type FeatureKey,
  type PlanId,
} from "@/lib/pricing-config";

type PlanAccessDbClient = {
  stripeCustomer: {
    findUnique: (args: {
      where: { clerk_user_id: string };
      include: {
        subscriptions: {
          where: { status: { in: string[] } };
          select: { plan_id: true };
        };
      };
    }) => Promise<{
      subscriptions: Array<{ plan_id: string | null }>;
    } | null>;
  };
};

/**
 * Returns the active plan ID for a user, read directly from the Subscription
 * row. Returns null when there is no active subscription (free tier).
 */
export async function getActivePlan(
  clerkUserId: string,
  client: PlanAccessDbClient = db as unknown as PlanAccessDbClient,
): Promise<PlanId | null> {
  const customer = await client.stripeCustomer.findUnique({
    where: { clerk_user_id: clerkUserId },
    include: {
      subscriptions: {
        where: { status: { in: ["ACTIVE", "TRIALING"] } },
        select: { plan_id: true },
      },
    },
  });
  const planId = customer?.subscriptions[0]?.plan_id;
  return (planId as PlanId) ?? null;
}

/**
 * Returns true if the user's active plan includes the given feature.
 * Users with no active subscription (free tier) have no gated features.
 */
export async function hasFeatureAccess(
  clerkUserId: string,
  featureKey: FeatureKey,
  client?: PlanAccessDbClient,
): Promise<boolean> {
  const plan = await getActivePlan(clerkUserId, client);
  if (!plan) return false;
  return (PLAN_FEATURES[plan] ?? ([] as readonly FeatureKey[])).includes(featureKey);
}

export { FEATURE_KEYS, type FeatureKey, type PlanId };
