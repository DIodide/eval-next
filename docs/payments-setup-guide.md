# Payments System Setup Guide

## Quick Start

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install stripe @stripe/stripe-js --legacy-peer-deps
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (get from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**For Production:**
- Use live keys (starting with `sk_live_` and `pk_live_`)
- Set up production webhook endpoint
- Update webhook secret

### 3. Database Migration

Run the Prisma migration to create payment tables:

```bash
npm run db:generate
npm run db:migrate
```

Or if using `db:push`:

```bash
npm run db:push
```

### 4. Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the "Signing secret" to `STRIPE_WEBHOOK_SECRET`

### 5. Create Products and Prices in Stripe

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create products for:
   - Subscriptions (e.g., "Premium Plan", "Pro Plan")
   - One-time purchases (e.g., "Credits", "Feature Unlocks")
3. Note the Price IDs (starting with `price_`) - you'll need these in your code

### 6. Test the Integration

#### Test Subscription Checkout

```typescript
// In your component
const { mutate: createCheckout } = trpc.payments.createSubscriptionCheckout.useMutation();

const handleSubscribe = () => {
  createCheckout({
    priceId: "price_xxx", // Your Stripe price ID
    successUrl: `${window.location.origin}/dashboard?success=true`,
    cancelUrl: `${window.location.origin}/pricing?canceled=true`,
  }, {
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });
};
```

#### Test Feature Access

```typescript
// Check if user has feature access
const { data } = trpc.payments.checkFeatureAccess.useQuery({
  featureKey: "premium_search"
});

if (data?.hasAccess) {
  // Show premium features
}
```

#### Test Webhook Locally

Use Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret to use in development.

### 7. Customize Entitlement Mapping

Edit `src/app/api/webhooks/stripe/route.ts` to map your Stripe products/prices to features:

```typescript
// In the webhook handler, customize this section:
if (priceId === "price_premium_monthly") {
  await grantEntitlement(
    customer.clerk_user_id,
    FEATURE_KEYS.PREMIUM_SEARCH,
    "SUBSCRIPTION",
    { subscriptionId: subscription.id }
  );
}
```

## Next Steps

1. **Create Pricing UI**: Build pricing pages using the payment endpoints
2. **Implement Feature Gates**: Use `hasFeatureAccess()` or the `requireFeature` middleware
3. **Add Customer Portal**: Link to customer portal for subscription management
4. **Monitor Payments**: Set up monitoring and alerts in Stripe Dashboard

## Common Tasks

### Grant Manual Entitlement

```typescript
import { grantEntitlement, FEATURE_KEYS } from "@/lib/server/entitlements";

await grantEntitlement(
  clerkUserId,
  FEATURE_KEYS.PREMIUM_SEARCH,
  "MANUAL",
  {
    expiresAt: new Date("2025-12-31"), // Optional
    metadata: { reason: "promotion" },
  }
);
```

### Check Feature Access in tRPC Procedure

```typescript
import { requireFeature, FEATURE_KEYS } from "@/lib/server/feature-gate";

export const premiumProcedure = protectedProcedure
  .use(requireFeature(FEATURE_KEYS.PREMIUM_SEARCH));

export const premiumRouter = createTRPCRouter({
  advancedSearch: premiumProcedure.query(async ({ ctx }) => {
    // This procedure requires premium_search entitlement
    // ...
  }),
});
```

### Get Customer Information

```typescript
const { data: customer } = trpc.payments.getCustomer.useQuery();

if (customer?.subscriptions.length > 0) {
  // User has active subscription
}
```

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is accessible
2. Verify webhook secret matches
3. Check Stripe Dashboard → Webhooks → Events for delivery status
4. Review application logs for errors

### Entitlements Not Granted

1. Check webhook handler logs
2. Verify entitlement mapping in webhook handler
3. Check database for created entitlements:
   ```sql
   SELECT * FROM entitlements WHERE stripe_customer_id = '...';
   ```

### Type Errors

Run type checking:
```bash
npm run typecheck
```

## Resources

- [Full Documentation](./payments-system.md)
- [Stripe Documentation](https://stripe.com/docs)
- [Clerk-Stripe Integration](https://clerk.com/docs/integrations/stripe)

