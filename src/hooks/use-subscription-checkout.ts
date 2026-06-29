"use client";

import { useCallback, useState } from "react";
import { api } from "@/trpc/react";
import type { PricingPlanId } from "@/lib/pricing-config";

interface StartCheckoutOptions {
  planId: PricingPlanId;
  priceId: string;
  planName: string;
  returnPath?: string;
  onError?: (message: string) => void;
}

function buildReturnPathFromWindow(returnPath?: string): string {
  if (returnPath) return returnPath;

  const params = new URLSearchParams(window.location.search);
  params.delete("checkout");
  params.delete("plan");
  params.delete("success");
  params.delete("canceled");

  const query = params.toString();
  const pathname = window.location.pathname;
  return query ? `${pathname}?${query}` : pathname;
}

export function useSubscriptionCheckout() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const createSubscriptionCheckout =
    api.payments.createSubscriptionCheckout.useMutation();

  const startCheckout = useCallback(
    async ({
      planId,
      priceId,
      planName,
      returnPath,
      onError,
    }: StartCheckoutOptions) => {
      if (!priceId) {
        onError?.(
          "Pricing not configured. Please contact support to set up this plan.",
        );
        return;
      }

      setLoadingPlanId(planId);

      try {
        const baseUrl = window.location.origin;
        const resolvedReturnPath = buildReturnPathFromWindow(returnPath);
        const separator = resolvedReturnPath.includes("?") ? "&" : "?";
        const successUrl = `${baseUrl}${resolvedReturnPath}${separator}checkout=success&plan=${planId}`;
        const cancelUrl = `${baseUrl}${resolvedReturnPath}${separator}checkout=canceled`;

        const result = await createSubscriptionCheckout.mutateAsync({
          priceId,
          successUrl,
          cancelUrl,
          metadata: {
            plan_id: planId,
            plan_name: planName,
          },
        });

        if (result.url) {
          window.location.href = result.url;
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "There was an issue starting checkout.";
        onError?.(message);
        setLoadingPlanId(null);
      }
    },
    [createSubscriptionCheckout],
  );

  return {
    startCheckout,
    loadingPlanId,
    isLoading: loadingPlanId !== null,
  };
}
