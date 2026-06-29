/**
 * Billing launch toggle. When disabled, feature gating and payment UI are off.
 * Set NEXT_PUBLIC_BILLING_ENABLED=true when ready to charge / gate features.
 */
export function isBillingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BILLING_ENABLED === "true";
}

/** External shop link for the public nav. Override via NEXT_PUBLIC_SHOP_URL. */
export function getShopUrl(): string {
  return process.env.NEXT_PUBLIC_SHOP_URL ?? "https://shop.evalgaming.com";
}
