import { db } from "@/server/db";
import type { PurchaseProductType, PurchaseStatus } from "@prisma/client";
import Stripe from "stripe";
import { stripe } from "./stripe";

/**
 * Map Stripe payment intent status to our purchase status
 */
export function mapPaymentIntentStatus(
  status: Stripe.PaymentIntent.Status,
): PurchaseStatus {
  const statusMap: Record<Stripe.PaymentIntent.Status, PurchaseStatus> = {
    succeeded: "SUCCEEDED",
    processing: "PENDING",
    requires_payment_method: "PENDING",
    requires_confirmation: "PENDING",
    requires_action: "PENDING",
    requires_capture: "PENDING",
    canceled: "CANCELED",
  };

  return statusMap[status] ?? "PENDING";
}

/**
 * Map Stripe checkout session payment status to our purchase status
 */
function mapCheckoutSessionStatus(
  paymentStatus: Stripe.Checkout.Session.PaymentStatus,
): PurchaseStatus {
  const statusMap: Record<
    Stripe.Checkout.Session.PaymentStatus,
    PurchaseStatus
  > = {
    paid: "SUCCEEDED",
    unpaid: "PENDING",
    no_payment_required: "PENDING",
  };

  return statusMap[paymentStatus] ?? "PENDING";
}

/**
 * Sync purchase from Stripe payment intent
 */
export async function syncPurchaseFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
) {
  const customer = await db.stripeCustomer.findUnique({
    where: { stripe_customer_id: paymentIntent.customer as string },
  });

  if (!customer) {
    throw new Error(
      `Stripe customer not found: ${paymentIntent.customer as string}`,
    );
  }

  const productType =
    (paymentIntent.metadata?.product_type as PurchaseProductType) ?? "CUSTOM";

  const purchaseData = {
    stripe_payment_intent_id: paymentIntent.id,
    product_type: productType,
    product_id: paymentIntent.metadata?.product_id ?? null,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: mapPaymentIntentStatus(paymentIntent.status),
    metadata: paymentIntent.metadata
      ? JSON.parse(JSON.stringify(paymentIntent.metadata))
      : null,
  };

  // Upsert purchase
  await db.purchase.upsert({
    where: { stripe_payment_intent_id: paymentIntent.id },
    create: {
      ...purchaseData,
      stripe_customer_id: customer.id,
    },
    update: purchaseData,
  });
}

/**
 * Sync purchase from Stripe checkout session
 */
export async function syncPurchaseFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  if (!session.customer || typeof session.customer !== "string") {
    throw new Error("Checkout session missing customer");
  }

  const customer = await db.stripeCustomer.findUnique({
    where: { stripe_customer_id: session.customer },
  });

  if (!customer) {
    throw new Error(`Stripe customer not found: ${session.customer}`);
  }

  const productType =
    (session.metadata?.product_type as PurchaseProductType) ?? "CUSTOM";

  const purchaseData = {
    stripe_checkout_session_id: session.id,
    product_type: productType,
    product_id: session.metadata?.product_id ?? null,
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    status: mapCheckoutSessionStatus(session.payment_status),
    metadata: session.metadata
      ? JSON.parse(JSON.stringify(session.metadata))
      : null,
  };

  // Upsert purchase
  await db.purchase.upsert({
    where: { stripe_checkout_session_id: session.id },
    create: {
      ...purchaseData,
      stripe_customer_id: customer.id,
    },
    update: purchaseData,
  });
}

/**
 * Create a checkout session for a one-time purchase
 */
export async function createPurchaseCheckout(
  stripeCustomerId: string,
  priceId: string,
  quantity: number,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
) {
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata ?? {},
  });

  return session;
}
