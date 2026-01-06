import { db } from "@/server/db";
import type { SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";
import { stripe } from "./stripe";

/**
 * Map Stripe subscription status to our database enum
 */
export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    unpaid: "UNPAID",
    paused: "PAUSED",
  };

  return statusMap[status] ?? "INCOMPLETE";
}

/**
 * Sync subscription from Stripe webhook event
 * Ensures only one active subscription per customer
 */
export async function syncSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription,
) {
  const customer = await db.stripeCustomer.findUnique({
    where: { stripe_customer_id: stripeSubscription.customer as string },
    include: {
      subscriptions: true,
    },
  });

  if (!customer) {
    throw new Error(
      `Stripe customer not found: ${stripeSubscription.customer as string}`,
    );
  }

  const currentPeriodStart =
    stripeSubscription.items.data[0]?.current_period_start;
  const currentPeriodEnd = stripeSubscription.items.data[0]?.current_period_end;

  const subscriptionData = {
    stripe_subscription_id: stripeSubscription.id,
    stripe_price_id: stripeSubscription.items.data[0]?.price.id ?? "",
    status: mapStripeSubscriptionStatus(stripeSubscription.status),
    current_period_start: currentPeriodStart
      ? new Date(currentPeriodStart * 1000)
      : new Date(),
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000)
      : new Date(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end ?? false,
    canceled_at: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000)
      : null,
    ended_at: stripeSubscription.ended_at
      ? new Date(stripeSubscription.ended_at * 1000)
      : null,
    trial_start: stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000)
      : null,
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : null,
  };

  // If this subscription is becoming active, cancel any other active subscriptions
  const isBecomingActive =
    stripeSubscription.status === "active" ||
    stripeSubscription.status === "trialing";

  if (isBecomingActive) {
    // Cancel other active subscriptions for this customer
    const otherActiveSubscriptions = customer.subscriptions.filter(
      (sub) =>
        sub.stripe_subscription_id !== stripeSubscription.id &&
        (sub.status === "ACTIVE" || sub.status === "TRIALING"),
    );

    for (const otherSub of otherActiveSubscriptions) {
      await db.subscription.update({
        where: { id: otherSub.id },
        data: {
          status: "CANCELED",
          ended_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  // Upsert subscription
  await db.subscription.upsert({
    where: { stripe_subscription_id: stripeSubscription.id },
    create: {
      ...subscriptionData,
      stripe_customer_id: customer.id,
    },
    update: subscriptionData,
  });
}

/**
 * Create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(
  stripeCustomerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
) {
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata ?? {},
  });

  return session;
}

/**
 * Update existing subscription to a new price (upgrade/downgrade with proration)
 */
export async function updateSubscription(
  stripeSubscriptionId: string,
  newPriceId: string,
) {
  // Get current subscription
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Get the subscription item ID
  const subscriptionItemId = subscription.items.data[0]?.id;

  if (!subscriptionItemId) {
    throw new Error("Subscription item not found");
  }

  // Update subscription with proration
  const updatedSubscription = await stripe.subscriptions.update(
    stripeSubscriptionId,
    {
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId,
        },
      ],
      proration_behavior: "always_invoice", // Create prorated invoice immediately
      metadata: {
        ...subscription.metadata,
        updated_at: new Date().toISOString(),
      },
    },
  );

  return updatedSubscription;
}

/**
 * Create a portal session for managing subscriptions
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}
