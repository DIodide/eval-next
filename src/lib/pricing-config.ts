/**
 * Pricing Configuration
 *
 * This file contains the pricing plan configuration.
 * TO be updated with the Stripe Price IDs when in Stripe Dashboard.
 *
 * To get your Price IDs:
 * 1. Go to Stripe Dashboard → Products
 * 2. Click on a product
 * 3. Copy the Price ID (starts with price_)
 */

export const PRICING_PLANS = {
  COACHES: {
    FREE: {
      id: "free",
      name: "Free",
      price: 0,
      priceId: null, // No Stripe price for free tier
      interval: null,
      features: ["Basic coach profile", "Browse player profiles"],
      excludedFeatures: [
        "Contact players in curated e-sports recruiting database",
        "Advanced player search",
        "Create tryouts",
      ],
    },
    GOLD: {
      id: "gold",
      name: "EVAL Gold",
      price: 0,
      oldPrice: undefined as number | undefined,
      priceId: process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID ?? "", // Set in .env
      interval: "year",
      badge: "POPULAR",
      features: [
        "Enhanced school profile",
        "Advanced player search filters",
        "Contact up to 100 players per month",
        "Scout at EVAL Combines",
        "Basic analytics dashboard",
      ],
      excludedFeatures: ["Talent pipeline management"],
    },
    PLATINUM: {
      id: "platinum",
      name: "EVAL Platinum",
      price: 0,
      oldPrice: undefined as number | undefined,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PLATINUM_PRICE_ID ?? "", // Set in .env
      interval: "year",
      badge: "PREMIUM",
      features: [
        "Premium verified coach profile",
        "Recruitment consulting",
        "Unlimited player contacts",
        "Unlimited tryout creation",
        "Advanced analytics and reporting",
        "Talent pipeline management",
        "Priority support",
      ],
      excludedFeatures: [],
    },
  },
  PLAYERS: {
    FREE: {
      id: "free",
      name: "Free",
      price: 0,
      priceId: null,
      interval: null,
      features: [
        "Basic player profile",
        "View public tryouts",
        "Upload 1 gameplay clip",
        "Start up to 3 coach conversations per month",
      ],
      excludedFeatures: [
        "Unlimited coach messaging",
        "Profile view tracking",
        "Priority visibility to coaches",
        "Unlimited highlight uploads",
        "Advanced analytics",
      ],
    },
    EVAL_PLUS: {
      id: "eval_plus",
      name: "EVAL+",
      price: 5,
      oldPrice: 10 as number | undefined,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PLAYER_PLUS_PRICE_ID ?? "", // Set in .env
      interval: "year",
      badge: "RECOMMENDED",
      features: [
        "Everything in Free",
        "Unlimited coach messaging",
        "Profile view tracking",
        "Priority visibility to coaches",
        "Unlimited highlight uploads",
        "Advanced analytics",
      ],
      excludedFeatures: [],
    },
  },
} as const;

export type CoachPlanId =
  (typeof PRICING_PLANS.COACHES)[keyof typeof PRICING_PLANS.COACHES]["id"];

export type PlayerPlanId =
  (typeof PRICING_PLANS.PLAYERS)[keyof typeof PRICING_PLANS.PLAYERS]["id"];

export type PricingPlanId = CoachPlanId | PlayerPlanId;

// ---------------------------------------------------------------------------
// Feature keys — all defined here even if not yet mapped to a plan.
// Currently active: MESSAGING_UNLIMITED, BOOTCAMP_ACCESS.
// ---------------------------------------------------------------------------
export const FEATURE_KEYS = {
  MESSAGING_UNLIMITED: "messaging_unlimited",
  BOOTCAMP_ACCESS: "bootcamp_access",
  PREMIUM_SEARCH: "premium_search",
  ADVANCED_ANALYTICS: "advanced_analytics",
  PRIORITY_SUPPORT: "priority_support",
  CUSTOM_BRANDING: "custom_branding",
  API_ACCESS: "api_access",
  BULK_OPERATIONS: "bulk_operations",
  EXPORT_DATA: "export_data",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

// Plan IDs namespaced by user type — these are stored in Subscription.plan_id.
export type PlanId =
  | "player_free"
  | "player_eval_plus"
  | "coach_free"
  | "coach_gold"
  | "coach_platinum";

// Map each plan to the features it grants.
// Add a feature key to a plan here — no other file needs to change.
export const PLAN_FEATURES: Record<PlanId, readonly FeatureKey[]> = {
  player_free: [],
  player_eval_plus: [FEATURE_KEYS.MESSAGING_UNLIMITED, FEATURE_KEYS.BOOTCAMP_ACCESS],
  coach_free: [],
  coach_gold: [FEATURE_KEYS.BOOTCAMP_ACCESS],
  coach_platinum: [FEATURE_KEYS.BOOTCAMP_ACCESS],
};

// Used by the webhook sync layer to set Subscription.plan_id from a Stripe price ID.
export function getPlanIdForPriceId(priceId: string): PlanId | null {
  const map: Record<string, PlanId> = {};
  if (process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID)
    map[process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID] = "coach_gold";
  if (process.env.NEXT_PUBLIC_STRIPE_PLATINUM_PRICE_ID)
    map[process.env.NEXT_PUBLIC_STRIPE_PLATINUM_PRICE_ID] = "coach_platinum";
  if (process.env.NEXT_PUBLIC_STRIPE_PLAYER_PLUS_PRICE_ID)
    map[process.env.NEXT_PUBLIC_STRIPE_PLAYER_PLUS_PRICE_ID] = "player_eval_plus";
  return map[priceId] ?? null;
}

export const PLAYER_FREE_CONV_STARTS_PER_MONTH = 3;
export const PLAYER_FREE_MESSAGES_PER_CONV = 3;
