# Pricing Page Integration Guide

## Overview

The pricing page is now fully integrated with the Stripe payments system. Users can subscribe to plans directly from the pricing page, and existing subscribers can manage their subscriptions.

## Setup Instructions

### 1. Create Products in Stripe

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create two products:
   - **EVAL Gold** (annual subscription)
   - **EVAL Platinum** (annual subscription)
3. For each product, create a price:
   - Set billing period to "Yearly"
   - Set your desired price
   - Copy the Price ID (starts with `price_`)

### 2. Set Environment Variables

Add these to your `.env` file:

```env
# Stripe Price IDs for coach plans
NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PLATINUM_PRICE_ID=price_xxxxx
```

**Note:** These are client-side variables (prefixed with `NEXT_PUBLIC_`) because they're used in the pricing configuration file.

### 3. Update Pricing Configuration

The pricing configuration is in `src/lib/pricing-config.ts`. You can:
- Update prices (display only - actual prices are set in Stripe)
- Add/remove features
- Modify plan details

### 4. Test the Integration

1. **Test Checkout Flow:**
   - Go to `/pricing`
   - Click "UPGRADE NOW" or "GO PREMIUM" on a coach plan
   - Complete checkout with Stripe test card: `4242 4242 4242 4242`
   - Verify redirect to success page

2. **Test Subscription Management:**
   - After subscribing, return to pricing page
   - Click "MANAGE SUBSCRIPTION"
   - Verify customer portal opens

3. **Test Success/Cancel Handling:**
   - Complete a checkout → Should show success toast
   - Cancel a checkout → Should show cancel toast

## Features

### Subscription Status Display

- Shows active subscription banner if user has active subscription
- Displays renewal date
- Provides quick access to customer portal

### Checkout Flow

- Authenticated users: Direct to Stripe checkout
- Unauthenticated users: Prompt to sign up first
- Loading states during checkout creation
- Error handling with toast notifications

### Customer Portal

- Users can manage subscriptions, update payment methods, view invoices
- Accessible via "MANAGE SUBSCRIPTION" button when user has active subscription

## Customization

### Adding New Plans

1. Add plan to `PRICING_PLANS` in `src/lib/pricing-config.ts`
2. Create product/price in Stripe
3. Add environment variable for price ID
4. Add plan card to pricing page
5. Update webhook handler to map price ID to entitlements

### Modifying Features

Update the `features` and `excludedFeatures` arrays in `src/lib/pricing-config.ts` for each plan.

### Changing Prices

1. Update price in Stripe Dashboard
2. Update display price in `src/lib/pricing-config.ts` (optional - for display only)

## Troubleshooting

### "Pricing not configured" Error

- Check that `NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID` and `NEXT_PUBLIC_STRIPE_PLATINUM_PRICE_ID` are set in `.env`
- Verify price IDs are correct in Stripe Dashboard
- Restart development server after adding environment variables

### Checkout Not Redirecting

- Check browser console for errors
- Verify Stripe keys are set correctly
- Check network tab for API errors
- Ensure webhook endpoint is accessible

### Subscription Status Not Showing

- Verify user is authenticated
- Check that `api.payments.getCustomer.useQuery()` is enabled
- Review browser console for API errors
- Verify subscription was created in Stripe

## Next Steps

1. **Set Up Webhook Entitlement Mapping:**
   - Edit `src/app/api/webhooks/stripe/route.ts`
   - Map your price IDs to feature entitlements
   - Example:
     ```typescript
     if (priceId === process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID) {
       await grantEntitlement(
         customer.clerk_user_id,
         FEATURE_KEYS.ADVANCED_ANALYTICS,
         "SUBSCRIPTION",
         { subscriptionId: subscription.id }
       );
     }
     ```

2. **Implement Feature Gating:**
   - Use `hasFeatureAccess()` in your components
   - Or use `requireFeature()` middleware in tRPC procedures
   - See `docs/payments-system.md` for details

3. **Add Analytics:**
   - Track subscription conversions
   - Monitor checkout completion rates
   - Set up alerts for failed payments
