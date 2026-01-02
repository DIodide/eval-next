import { env } from "@/env";
import { revokeSubscriptionEntitlements } from "@/lib/server/entitlements";
import { stripe } from "@/lib/server/stripe";
import {
  syncPurchaseFromCheckoutSession,
  syncPurchaseFromPaymentIntent,
} from "@/lib/server/stripe-purchases";
import { syncSubscriptionFromStripe } from "@/lib/server/stripe-subscriptions";
import { db } from "@/server/db";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

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
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription);

        // Grant entitlements based on subscription
        // This is where you'd map subscription price IDs to feature entitlements
        // Example: if subscription has price_id "price_premium", grant premium features
        const customer = await db.stripeCustomer.findUnique({
          where: { stripe_customer_id: subscription.customer as string },
        });

        if (customer) {
          const priceId = subscription.items.data[0]?.price.id;
          // Map price IDs to features - customize based on your pricing plans
          // This is a placeholder - implement your actual feature mapping
          if (priceId) {
            // Example: Grant premium features for premium subscription
            // await grantEntitlement(
            //   customer.clerk_user_id,
            //   FEATURE_KEYS.PREMIUM_SEARCH,
            //   "SUBSCRIPTION",
            //   { subscriptionId: subscription.id }
            // );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await syncPurchaseFromPaymentIntent(paymentIntent);

        // Grant entitlements for one-time purchases
        const customer = await db.stripeCustomer.findUnique({
          where: { stripe_customer_id: paymentIntent.customer as string },
        });

        if (customer) {
          const purchase = await db.purchase.findUnique({
            where: { stripe_payment_intent_id: paymentIntent.id },
          });

          if (purchase) {
            // Map product types to features - customize based on your products
            // Example: if product_type is "FEATURE_UNLOCK", grant the feature
            if (
              purchase.product_type === "FEATURE_UNLOCK" &&
              purchase.product_id
            ) {
              // await grantEntitlement(
              //   customer.clerk_user_id,
              //   purchase.product_id as FeatureKey,
              //   "PURCHASE",
              //   { purchaseId: purchase.id }
              // );
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await syncPurchaseFromPaymentIntent(paymentIntent);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
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
        const invoice = event.data.object as Stripe.Invoice;
        // TODO: provision entitlements for the invoice such as credits, items, etc.
        console.log("Successful Invoice for customer", invoice.customer);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
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
