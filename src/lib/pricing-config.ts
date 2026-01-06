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
      price: 0, // Update with actual price
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
      price: 0, // Update with actual price
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
        "Send up to 3 coach messages",
      ],
      excludedFeatures: [
        "Advanced analytics",
        "Priority visibility to coaches",
      ],
    },
  },
} as const;

export type PricingPlanId =
  (typeof PRICING_PLANS.COACHES)[keyof typeof PRICING_PLANS.COACHES]["id"];
