import { env } from "@/env";
import {
  FEATURE_KEYS,
  grantEntitlement,
  revokeSubscriptionEntitlements,
  type FeatureKey,
} from "@/lib/server/entitlements";
import { stripe } from "@/lib/server/stripe";
import {
  syncPurchaseFromCheckoutSession,
  syncPurchaseFromPaymentIntent,
} from "@/lib/server/stripe-purchases";
import { syncSubscriptionFromStripe } from "@/lib/server/stripe-subscriptions";
import { db } from "@/server/db";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";

const EVAL_PLUS_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_PLATINUM_PRICE_ID,
].filter(Boolean) as string[];

const EVAL_PLUS_FEATURES = [
  FEATURE_KEYS.DIRECT_MESSAGING,
  FEATURE_KEYS.UNLIMITED_MESSAGES,
  FEATURE_KEYS.PREMIUM_SEARCH,
  FEATURE_KEYS.ADVANCED_ANALYTICS,
] as const;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("STRIPE_WEBHOOK_SECRET not configured", {
      status: 500,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const error = err as Error;
    console.error(
      `[STRIPE WEBHOOK] Signature verification failed:`,
      error.message,
    );
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log(`[STRIPE WEBHOOK] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await syncSubscriptionFromStripe(subscription);

        // Grant entitlements based on subscription
        // This is where you'd map subscription price IDs to feature entitlements
        // Example: if subscription has price_id "price_premium", grant premium features
        const customer = await db.stripeCustomer.findUnique({
          where: { stripe_customer_id: subscription.customer as string },
        });

        if (customer) {
          const priceId = subscription.items.data[0]?.price.id;
          const isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";

          if (priceId && isActive && EVAL_PLUS_PRICE_IDS.includes(priceId)) {
            const dbSub = await db.subscription.findUnique({
              where: { stripe_subscription_id: subscription.id },
              select: { id: true },
            });

            for (const featureKey of EVAL_PLUS_FEATURES) {
              await grantEntitlement(
                customer.clerk_user_id,
                featureKey,
                "SUBSCRIPTION",
                { subscriptionId: dbSub?.id },
              );
            }

            console.log(
              `[STRIPE WEBHOOK] Granted EVAL+ features to ${customer.clerk_user_id}`,
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await syncSubscriptionFromStripe(subscription);

        // Revoke entitlements when subscription is canceled
        const dbSubscription = await db.subscription.findUnique({
          where: { stripe_subscription_id: subscription.id },
        });

        if (dbSubscription) {
          await revokeSubscriptionEntitlements(dbSubscription.id);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await syncPurchaseFromPaymentIntent(paymentIntent);

        // Grant entitlements for one-time purchases
        const customer = await db.stripeCustomer.findUnique({
          where: { stripe_customer_id: paymentIntent.customer as string },
        });

        if (customer) {
          const purchase = await db.purchase.findUnique({
            where: { stripe_payment_intent_id: paymentIntent.id },
          });

          const validFeatureKeys = new Set<string>(Object.values(FEATURE_KEYS));
          if (
            purchase &&
            purchase.product_type === "FEATURE_UNLOCK" &&
            purchase.product_id &&
            validFeatureKeys.has(purchase.product_id)
          ) {
            await grantEntitlement(
              customer.clerk_user_id,
              purchase.product_id as FeatureKey,
              "PURCHASE",
              { purchaseId: purchase.id },
            );
            console.log(
              `[STRIPE WEBHOOK] Granted ${purchase.product_id} to ${customer.clerk_user_id} via purchase`,
            );
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await syncPurchaseFromPaymentIntent(paymentIntent);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        await syncPurchaseFromCheckoutSession(session);

        // Handle subscription checkout completion
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          await syncSubscriptionFromStripe(subscription);
        }
        break;
      }

      // mostly same as "invoice.paid" but with different event type
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // TODO: provision entitlements for the invoice such as credits, items, etc.
        console.log("Successful Invoice for customer", invoice.customer);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        // Handle failed payment - subscription may be past_due
        // invoice.customer
        console.log("Failed Invoice for customer", invoice.customer);
        // TODO: handle failed payment such as email notification to the customer, etc.

        console.log("Failed Invoice for customer", invoice.customer);
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[STRIPE WEBHOOK] Error processing event:`, error);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
