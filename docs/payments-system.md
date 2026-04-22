# Payments System Documentation

## Overview

The payments layer integrates Stripe subscriptions and one-time purchases with the EVAL platform. Feature access is derived at runtime from the active subscription plan — there is no separate entitlements table.

## Architecture

### Core Components

1. **Stripe Integration** (`src/lib/server/stripe.ts`)
   - Stripe client configuration
   - Customer management (create/get Stripe customers)
   - Links Clerk users to Stripe customers

2. **Subscription Management** (`src/lib/server/stripe-subscriptions.ts`)
   - Subscription checkout session creation
   - Customer portal session management
   - `syncSubscriptionFromStripe(sub, { planId? })` — upserts subscription row, sets `plan_id`

3. **Purchase Management** (`src/lib/server/stripe-purchases.ts`)
   - One-time purchase checkout sessions
   - `syncPurchaseFromPaymentIntent` — records completed purchases

4. **Plan-Based Access** (`src/lib/server/plan-access.ts`)
   - `getActivePlan(clerkUserId)` — reads `plan_id` from the active subscription row
   - `hasFeatureAccess(clerkUserId, featureKey)` — checks plan → feature mapping
   - `requireFeature(featureKey)` — tRPC middleware for procedure-level gating

5. **Pricing Config** (`src/lib/pricing-config.ts`)
   - `FEATURE_KEYS` — all feature keys (complete, even if not yet mapped to a plan)
   - `PLAN_FEATURES` — maps each plan ID to its granted features
   - `getPlanIdForPriceId(priceId)` — used by the webhook to set `plan_id` on sync
   - Quota constants: `PLAYER_FREE_CONV_STARTS_PER_MONTH = 3`, `PLAYER_FREE_MESSAGES_PER_CONV = 3`

6. **Clerk Integration** (`src/lib/server/clerk-stripe-sync.ts`)
   - Syncs Stripe customer IDs to Clerk user metadata

7. **tRPC Payment Router** (`src/server/api/routers/payments.ts`)
   - `getCustomer` — subscription and purchase records
   - `getActivePlan` — current plan ID for the authenticated user
   - `checkFeatureAccess` — boolean access check for a given feature key
   - `createSubscriptionCheckout`, `createPurchaseCheckout`, `createPortalSession`

8. **Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`)
   - `customer.subscription.created/updated` → `syncSubscriptionFromStripe(sub, { planId })`
   - `customer.subscription.deleted` → `syncSubscriptionFromStripe(sub)` (status → CANCELED)
   - `payment_intent.succeeded` → `syncPurchaseFromPaymentIntent`

## Database Schema

### StripeCustomer

Maps Clerk users to Stripe customers.

```prisma
model StripeCustomer {
  id                  String         @id @default(uuid())
  clerk_user_id       String         @unique
  stripe_customer_id  String         @unique
  email               String
  subscriptions       Subscription[]
  purchases           Purchase[]
}
```

### Subscription

Active subscription row. `plan_id` is the source of truth for feature access.

```prisma
model Subscription {
  id                        String             @id @default(uuid())
  stripe_customer_id        String
  stripe_subscription_id    String             @unique
  stripe_price_id           String
  plan_id                   String?            // e.g. "player_eval_plus", "coach_gold"
  status                    SubscriptionStatus
  current_period_start      DateTime
  current_period_end        DateTime
  cancel_at_period_end      Boolean            @default(false)
  trial_end                 DateTime?
  created_at                DateTime           @default(now())
  updated_at                DateTime           @updatedAt
  stripe_customer           StripeCustomer     @relation(fields: [stripe_customer_id], references: [id])
}
```

### Purchase

Records completed one-time purchases. Used for accounting and (in future) feature overrides.

```prisma
model Purchase {
  id                   String         @id @default(uuid())
  stripe_customer_id   String
  stripe_payment_intent_id String     @unique
  stripe_price_id      String?
  product_type         String
  product_id           String?
  amount               Int
  currency             String
  status               PurchaseStatus
  metadata             Json?
  created_at           DateTime       @default(now())
  updated_at           DateTime       @updatedAt
  stripe_customer      StripeCustomer @relation(fields: [stripe_customer_id], references: [id])
}
```

## Plan IDs

Plan IDs are namespaced by user type so player and coach plans are always unambiguous.

| Plan ID | User type | Features |
|---------|-----------|----------|
| `player_free` | Player | (none — free tier) |
| `player_eval_plus` | Player | `messaging_unlimited`, `bootcamp_access` |
| `coach_free` | Coach | (none — free tier) |
| `coach_gold` | Coach | `bootcamp_access` |
| `coach_platinum` | Coach | `bootcamp_access` |

The mapping lives in `PLAN_FEATURES` in `src/lib/pricing-config.ts`. No other file needs to change when a plan gains or loses a feature.

## Feature Keys

All feature keys are defined in `FEATURE_KEYS` in `src/lib/pricing-config.ts`. Keys that are not yet mapped to any plan are still defined here for future use.

| Key | Status | Notes |
|-----|--------|-------|
| `messaging_unlimited` | Active | Removes conv-start and per-message limits for players |
| `bootcamp_access` | Active | Gates all bootcamp progress/submission procedures |
| `premium_search` | Defined | Future use |
| `advanced_analytics` | Defined | Future use |
| `priority_support` | Defined | Future use |
| `custom_branding` | Defined | Future use |
| `api_access` | Defined | Future use |
| `bulk_operations` | Defined | Future use |
| `export_data` | Defined | Future use |

## How Feature Access Works

1. User takes an action (sends a message, loads bootcamp progress, etc.)
2. The tRPC procedure checks access via `requireFeature(featureKey)` middleware, or the service layer calls `hasFeatureAccess(clerkUserId, featureKey)` directly.
3. `hasFeatureAccess` calls `getActivePlan` → looks up `StripeCustomer → Subscription` where `status IN (ACTIVE, TRIALING)` → reads `plan_id`.
4. The plan ID is matched against `PLAN_FEATURES[planId]` to see if the feature is included.
5. No active subscription (or canceled) → no gated features.

## Messaging Quotas

Free-tier players (no active `player_eval_plus` subscription) are subject to:

- **3 new conversation starts per calendar month** (enforced in `sendPlayerMessage` service)
- **3 player messages per conversation** (enforced inside the database transaction when sending)

Both limits are defined as constants in `pricing-config.ts` so they can be updated in one place.

EVAL+ subscribers bypass both limits entirely.

## Webhook Flow

When Stripe fires a subscription event:

```
customer.subscription.created / updated
  → getPlanIdForPriceId(priceId)   // maps price → plan_id
  → syncSubscriptionFromStripe(sub, { planId })  // upserts row with plan_id + status

customer.subscription.deleted
  → syncSubscriptionFromStripe(sub)  // sets status = CANCELED
```

Because the plan is stored on the `Subscription` row, no separate entitlement grant/revoke logic is needed. `getActivePlan` reads the plan directly.

## Future: One-Time Purchase Feature Overrides

When one-time purchases need to unlock features (e.g. a lifetime access purchase), add a `UserFeatureOverride` table:

```prisma
model UserFeatureOverride {
  id                String    @id @default(uuid())
  clerk_user_id     String
  feature_key       String
  source_purchase_id String?  // FK to Purchase
  expires_at        DateTime?
  created_at        DateTime  @default(now())
}
```

Then extend `hasFeatureAccess` in `plan-access.ts` to check this table after the plan lookup:

```ts
export async function hasFeatureAccess(clerkUserId, featureKey, client = db) {
  // 1. Check plan
  const plan = await getActivePlan(clerkUserId, client);
  if (plan && PLAN_FEATURES[plan]?.includes(featureKey)) return true;

  // 2. Check one-time purchase overrides
  const override = await client.userFeatureOverride.findFirst({
    where: {
      clerk_user_id: clerkUserId,
      feature_key: featureKey,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
  });
  return override !== null;
}
```

Purchase records (`Purchase` model) are already created by the webhook — the override table just needs to be populated from them when a qualifying purchase is processed.
