import {
  FEATURE_KEYS,
  getUserEntitlements,
  hasFeatureAccess,
  type FeatureKey,
} from "@/lib/server/entitlements";
import {
  getCustomerRecord,
  getOrCreateStripeCustomer,
} from "@/lib/server/stripe";
import { createPurchaseCheckout } from "@/lib/server/stripe-purchases";
import {
  createCustomerPortalSession,
  createSubscriptionCheckout,
  syncSubscriptionFromStripe,
  updateSubscription,
} from "@/lib/server/stripe-subscriptions";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const paymentsRouter = createTRPCRouter({
  /**
   * Get current customer information including subscriptions and purchases
   */
  getCustomer: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const customer = await getCustomerRecord(ctx.auth.userId);

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      email: customer.email,
      subscriptions: customer.subscriptions.map((sub) => ({
        id: sub.id,
        status: sub.status,
        stripePriceId: sub.stripe_price_id,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end,
      })),
      purchases: customer.purchases.map((purchase) => ({
        id: purchase.id,
        productType: purchase.product_type,
        productId: purchase.product_id,
        amount: purchase.amount,
        currency: purchase.currency,
        status: purchase.status,
        createdAt: purchase.created_at,
      })),
      entitlements: customer.entitlements.map((ent) => ({
        featureKey: ent.feature_key,
        expiresAt: ent.expires_at,
        metadata: ent.metadata,
      })),
    };
  }),

  /**
   * Create a checkout session for a subscription
   */
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        metadata: z.record(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const client = await clerkClient();

      const clerkUser = await client.users.getUser(ctx.auth.userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User email not found",
        });
      }

      const stripeCustomerId = await getOrCreateStripeCustomer(
        ctx.auth.userId,
        email,
      );

      // Check if user has an existing active subscription
      const customer = await getCustomerRecord(ctx.auth.userId);
      const activeSubscription = customer?.subscriptions.find(
        (sub) => sub.status === "ACTIVE" || sub.status === "TRIALING",
      );

      // If user has active subscription and it's a different price, update it
      if (
        activeSubscription &&
        activeSubscription.stripe_price_id !== input.priceId
      ) {
        // Update existing subscription with proration
        const updatedSubscription = await updateSubscription(
          activeSubscription.stripe_subscription_id,
          input.priceId,
        );

        // Sync the updated subscription to database
        await syncSubscriptionFromStripe(updatedSubscription);

        // Return success URL since update is immediate
        return {
          url: input.successUrl,
          sessionId: null,
          updated: true,
        };
      }

      // Otherwise, create new checkout session
      const session = await createSubscriptionCheckout(
        stripeCustomerId,
        input.priceId,
        input.successUrl,
        input.cancelUrl,
        {
          ...input.metadata,
          clerk_user_id: ctx.auth.userId,
        },
      );

      return {
        url: session.url,
        sessionId: session.id,
        updated: false,
      };
    }),

  /**
   * Create a checkout session for a one-time purchase
   */
  createPurchaseCheckout: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        quantity: z.number().int().positive().default(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        metadata: z.record(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const client = await clerkClient();

      const clerkUser = await client.users.getUser(ctx.auth.userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User email not found",
        });
      }

      const stripeCustomerId = await getOrCreateStripeCustomer(
        ctx.auth.userId,
        email,
      );

      const session = await createPurchaseCheckout(
        stripeCustomerId,
        input.priceId,
        input.quantity,
        input.successUrl,
        input.cancelUrl,
        {
          ...input.metadata,
          clerk_user_id: ctx.auth.userId,
        },
      );

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Create a customer portal session for managing subscriptions
   */
  createPortalSession: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const customer = await getCustomerRecord(ctx.auth.userId);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      const session = await createCustomerPortalSession(
        customer.stripe_customer_id,
        input.returnUrl,
      );

      return {
        url: session.url,
      };
    }),

  /**
   * Check if user has access to a specific feature
   */
  checkFeatureAccess: protectedProcedure
    .input(
      z.object({
        featureKey: z.enum([
          FEATURE_KEYS.PREMIUM_SEARCH,
          FEATURE_KEYS.ADVANCED_ANALYTICS,
          FEATURE_KEYS.UNLIMITED_MESSAGES,
          FEATURE_KEYS.PRIORITY_SUPPORT,
          FEATURE_KEYS.CUSTOM_BRANDING,
          FEATURE_KEYS.API_ACCESS,
          FEATURE_KEYS.BULK_OPERATIONS,
          FEATURE_KEYS.EXPORT_DATA,
        ]),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const hasAccess = await hasFeatureAccess(
        ctx.auth.userId,
        input.featureKey as FeatureKey,
      );

      return {
        hasAccess,
        featureKey: input.featureKey,
      };
    }),

  /**
   * Get all active entitlements for the current user
   */
  getEntitlements: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const entitlements = await getUserEntitlements(ctx.auth.userId);

    return entitlements.map((ent) => ({
      id: ent.id,
      featureKey: ent.feature_key,
      grantedByType: ent.granted_by_type,
      expiresAt: ent.expires_at,
      metadata: ent.metadata,
      createdAt: ent.created_at,
    }));
  }),
});
