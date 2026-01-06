# Payments System Documentation

## Overview

This document describes the comprehensive payments layer implemented for the EVAL platform. The system supports subscriptions, one-time purchases, and feature-based entitlements, all integrated with Stripe and Clerk authentication.

## Architecture

### Core Components

1. **Stripe Integration** (`src/lib/server/stripe.ts`)
   - Stripe client configuration
   - Customer management (create/get Stripe customers)
   - Links Clerk users to Stripe customers

2. **Subscription Management** (`src/lib/server/stripe-subscriptions.ts`)
   - Subscription checkout session creation
   - Customer portal session management
   - Subscription status synchronization

3. **Purchase Management** (`src/lib/server/stripe-purchases.ts`)
   - One-time purchase checkout sessions
   - Payment intent synchronization
   - Purchase status tracking

4. **Entitlements System** (`src/lib/server/entitlements.ts`)
   - Feature access control
   - Entitlement granting/revoking
   - Feature gating utilities

5. **Clerk Integration** (`src/lib/server/clerk-stripe-sync.ts`)
   - Syncs Stripe customer IDs to Clerk user metadata
   - Enables Clerk's built-in Stripe integration features

6. **tRPC Payment Router** (`src/server/api/routers/payments.ts`)
   - API endpoints for payment operations
   - Feature access checking
   - Customer information retrieval

7. **Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`)
   - Processes Stripe webhook events
   - Synchronizes payment data
   - Manages entitlements based on payments

## Database Schema

### StripeCustomer
Maps Clerk users to Stripe customers.

- `clerk_user_id`: Unique Clerk user identifier
- `stripe_customer_id`: Stripe customer ID
- `email`: Customer email address

### Subscription
Tracks subscription status and billing periods.

- `stripe_subscription_id`: Stripe subscription ID
- `stripe_price_id`: Stripe price ID for the subscription
- `status`: Subscription status (ACTIVE, CANCELED, TRIALING, etc.)
- `current_period_start/end`: Billing period dates
- `cancel_at_period_end`: Whether subscription will cancel at period end
- `trial_start/end`: Trial period dates (if applicable)

### Purchase
Tracks one-time purchases.

- `stripe_payment_intent_id`: Stripe payment intent ID
- `stripe_checkout_session_id`: Stripe checkout session ID (optional)
- `product_type`: Type of product (CREDITS, ITEM, FEATURE_UNLOCK, CUSTOM)
- `product_id`: Optional reference to product/item
- `amount`: Purchase amount in cents
- `currency`: Currency code (default: "usd")
- `status`: Purchase status (PENDING, SUCCEEDED, FAILED, etc.)
- `metadata`: Additional product-specific data (JSON)

### Entitlement
Manages feature access and permissions.

- `feature_key`: Feature identifier (e.g., "premium_search")
- `granted_by_type`: Source of entitlement (SUBSCRIPTION, PURCHASE, MANUAL)
- `subscription_id`: Reference to subscription (if granted by subscription)
- `purchase_id`: Reference to purchase (if granted by purchase)
- `expires_at`: Expiration date (null = permanent)
- `is_active`: Whether entitlement is currently active
- `metadata`: Additional feature-specific data (JSON)

## Environment Variables

### Required

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Stripe Webhook Secret (for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Setting Up Webhooks

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Payment Flows

### Subscription Flow

1. **User initiates subscription**
   ```typescript
   const { url } = await trpc.payments.createSubscriptionCheckout.mutate({
     priceId: "price_xxx",
     successUrl: "https://app.com/success",
     cancelUrl: "https://app.com/cancel",
   });
   ```

2. **User completes checkout** → Stripe redirects to success URL

3. **Webhook processes subscription**
   - `checkout.session.completed` → Creates subscription record
   - `customer.subscription.created` → Syncs subscription, grants entitlements

4. **User accesses features** → Entitlements checked via `hasFeatureAccess()`

### One-Time Purchase Flow

1. **User initiates purchase**
   ```typescript
   const { url } = await trpc.payments.createPurchaseCheckout.mutate({
     priceId: "price_xxx",
     quantity: 1,
     successUrl: "https://app.com/success",
     cancelUrl: "https://app.com/cancel",
     metadata: {
       product_type: "FEATURE_UNLOCK",
       product_id: "premium_search",
     },
   });
   ```

2. **User completes checkout** → Stripe processes payment

3. **Webhook processes purchase**
   - `payment_intent.succeeded` → Creates purchase record, grants entitlements

4. **User accesses feature** → Entitlement checked and granted

## Feature Gating

### Checking Feature Access

**Server-side (in tRPC procedures):**
```typescript
import { hasFeatureAccess, FEATURE_KEYS } from "@/lib/server/entitlements";

const hasAccess = await hasFeatureAccess(
  ctx.auth.userId,
  FEATURE_KEYS.PREMIUM_SEARCH
);

if (!hasAccess) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Premium search requires a subscription",
  });
}
```

**Client-side (via tRPC):**
```typescript
const { hasAccess } = await trpc.payments.checkFeatureAccess.query({
  featureKey: "premium_search",
});
```

### Available Features

Predefined feature keys in `FEATURE_KEYS`:
- `PREMIUM_SEARCH`: Advanced search capabilities
- `ADVANCED_ANALYTICS`: Analytics dashboard access
- `UNLIMITED_MESSAGES`: Unlimited messaging
- `PRIORITY_SUPPORT`: Priority customer support
- `CUSTOM_BRANDING`: Custom branding options
- `API_ACCESS`: API access
- `BULK_OPERATIONS`: Bulk operation capabilities
- `EXPORT_DATA`: Data export functionality

### Adding New Features

1. Add feature key to `FEATURE_KEYS` in `src/lib/server/entitlements.ts`
2. Update the tRPC input schema in `payments.ts` to include the new feature
3. Implement feature gating in relevant procedures/components

## API Reference

### tRPC Endpoints

#### `payments.getCustomer`
Get current customer information including subscriptions, purchases, and entitlements.

**Response:**
```typescript
{
  id: string;
  email: string;
  subscriptions: Array<{
    id: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
  }>;
  purchases: Array<{
    id: string;
    productType: PurchaseProductType;
    productId: string | null;
    amount: number;
    currency: string;
    status: PurchaseStatus;
    createdAt: Date;
  }>;
  entitlements: Array<{
    featureKey: string;
    expiresAt: Date | null;
    metadata: Record<string, unknown> | null;
  }>;
}
```

#### `payments.createSubscriptionCheckout`
Create a Stripe checkout session for a subscription.

**Input:**
```typescript
{
  priceId: string; // Stripe price ID
  successUrl: string; // URL to redirect after success
  cancelUrl: string; // URL to redirect after cancel
  metadata?: Record<string, string>; // Optional metadata
}
```

**Response:**
```typescript
{
  url: string; // Checkout session URL
  sessionId: string;
}
```

#### `payments.createPurchaseCheckout`
Create a Stripe checkout session for a one-time purchase.

**Input:**
```typescript
{
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}
```

**Response:**
```typescript
{
  url: string;
  sessionId: string;
}
```

#### `payments.createPortalSession`
Create a Stripe customer portal session for managing subscriptions.

**Input:**
```typescript
{
  returnUrl: string;
}
```

**Response:**
```typescript
{
  url: string; // Portal session URL
}
```

#### `payments.checkFeatureAccess`
Check if user has access to a specific feature.

**Input:**
```typescript
{
  featureKey: FeatureKey;
}
```

**Response:**
```typescript
{
  hasAccess: boolean;
  featureKey: string;
}
```

#### `payments.getEntitlements`
Get all active entitlements for the current user.

**Response:**
```typescript
Array<{
  id: string;
  featureKey: string;
  grantedByType: EntitlementSource;
  expiresAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}>
```

## Clerk Integration

The system integrates with Clerk in two ways:

1. **Customer Identity**: Uses Clerk user IDs to link Stripe customers
2. **Metadata Sync**: Stores Stripe customer ID in Clerk user metadata for built-in integration features

When a Stripe customer is created, the customer ID is automatically synced to the Clerk user's `publicMetadata.stripeCustomerId`.

## Webhook Events

### Handled Events

- `customer.subscription.created` / `updated`: Syncs subscription, grants entitlements
- `customer.subscription.deleted`: Syncs cancellation, revokes entitlements
- `payment_intent.succeeded`: Creates purchase record, grants purchase-based entitlements
- `payment_intent.payment_failed`: Updates purchase status
- `checkout.session.completed`: Handles both subscription and purchase checkouts
- `invoice.payment_succeeded` / `payment_failed`: Updates subscription status

### Customizing Entitlement Mapping

In `src/app/api/webhooks/stripe/route.ts`, customize the entitlement mapping:

```typescript
// Map subscription price IDs to features
if (priceId === "price_premium_monthly") {
  await grantEntitlement(
    customer.clerk_user_id,
    FEATURE_KEYS.PREMIUM_SEARCH,
    "SUBSCRIPTION",
    { subscriptionId: subscription.id }
  );
}

// Map purchase product types to features
if (purchase.product_type === "FEATURE_UNLOCK") {
  await grantEntitlement(
    customer.clerk_user_id,
    purchase.product_id as FeatureKey,
    "PURCHASE",
    { purchaseId: purchase.id }
  );
}
```

## Extending the System

### Adding New Pricing Plans

1. Create products and prices in Stripe Dashboard
2. Update entitlement mapping in webhook handler
3. Add UI for new plans (if needed)

### Adding New Product Types

1. Add to `PurchaseProductType` enum in Prisma schema
2. Update webhook handler to handle new product type
3. Implement product-specific logic

### Adding New Features

1. Add feature key to `FEATURE_KEYS` enum
2. Update tRPC input schema
3. Implement feature gating in relevant code
4. Update documentation

### Manual Entitlement Management

For admin/manual entitlement granting:

```typescript
import { grantEntitlement, revokeEntitlement } from "@/lib/server/entitlements";

// Grant entitlement
await grantEntitlement(
  clerkUserId,
  FEATURE_KEYS.PREMIUM_SEARCH,
  "MANUAL",
  {
    expiresAt: new Date("2025-12-31"), // Optional expiration
    metadata: { grantedBy: "admin", reason: "promotion" },
  }
);

// Revoke entitlement
await revokeEntitlement(clerkUserId, FEATURE_KEYS.PREMIUM_SEARCH);
```

## Maintenance

### Cleaning Up Expired Entitlements

Run periodically (e.g., via cron job):

```typescript
import { cleanupExpiredEntitlements } from "@/lib/server/entitlements";

const count = await cleanupExpiredEntitlements();
console.log(`Cleaned up ${count} expired entitlements`);
```

### Monitoring

Key metrics to monitor:
- Subscription conversion rates
- Failed payment rates
- Entitlement usage
- Webhook processing errors

Check Stripe Dashboard and application logs for issues.

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using Stripe's signature
2. **Authentication**: All payment endpoints require authentication via Clerk
3. **Authorization**: Feature access is checked server-side
4. **Data Privacy**: Customer data is stored securely and only accessible to authenticated users

## Testing

### Test Mode

Use Stripe test mode keys for development:
- Test publishable key: `pk_test_...`
- Test secret key: `sk_test_...`
- Test webhook secret: `whsec_test_...`

### Test Cards

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Testing Webhooks Locally

Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check webhook secret matches
   - Ensure endpoint is publicly accessible

2. **Entitlements not granted**
   - Check webhook handler logs
   - Verify entitlement mapping logic
   - Check database for created records

3. **Customer not found errors**
   - Ensure customer is created before checkout
   - Check Clerk user ID matches

4. **Feature access denied**
   - Verify entitlement exists and is active
   - Check expiration dates
   - Review entitlement source (subscription/purchase)

## Future Enhancements

Potential improvements:
- Usage-based billing
- Team/organization subscriptions
- Promotional codes and discounts
- Subscription upgrades/downgrades
- Proration handling
- Dunning management for failed payments
- Analytics dashboard for payment metrics

