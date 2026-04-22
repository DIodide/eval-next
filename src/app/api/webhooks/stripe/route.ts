import { env } from "@/env";
import { getPlanIdForPriceId } from "@/lib/pricing-config";
import { stripe } from "@/lib/server/stripe";
import {
  syncPurchaseFromCheckoutSession,
  syncPurchaseFromPaymentIntent,
} from "@/lib/server/stripe-purchases";
import { syncSubscriptionFromStripe } from "@/lib/server/stripe-subscriptions";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";

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
        const planId = getPlanIdForPriceId(
          subscription.items.data[0]?.price.id ?? "",
        );
        await syncSubscriptionFromStripe(subscription, { planId });
        console.log(
          `[STRIPE WEBHOOK] Synced subscription ${subscription.id} → plan_id: ${planId ?? "null"}`,
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await syncSubscriptionFromStripe(subscription);
        console.log(
          `[STRIPE WEBHOOK] Subscription deleted: ${subscription.id}`,
        );
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await syncPurchaseFromPaymentIntent(paymentIntent);
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
          const planId = getPlanIdForPriceId(
            subscription.items.data[0]?.price.id ?? "",
          );
          await syncSubscriptionFromStripe(subscription, { planId });
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
