"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import {
  PaymentStatusDialog,
  type PaymentStatusState,
} from "./payment-status-dialog";
import { getPlanDisplayName, type PricingPlanId } from "@/lib/pricing-config";

function CheckoutReturnHandlerInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const utils = api.useUtils();
  const handledRef = useRef<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusState>({
    open: false,
    type: null,
  });

  const userType = user?.publicMetadata?.userType as
    | "player"
    | "coach"
    | undefined;

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const plan = searchParams.get("plan");
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    const eventKey = `${checkout ?? success ?? canceled}-${plan ?? ""}-${pathname}`;
    if (handledRef.current === eventKey) return;

    const isSuccess = checkout === "success" || success === "true";
    const isCanceled = checkout === "canceled" || canceled === "true";

    if (!isSuccess && !isCanceled) return;

    handledRef.current = eventKey;

    if (isSuccess) {
      const planName = plan
        ? getPlanDisplayName(plan as PricingPlanId)
        : "Premium";
      setPaymentStatus({
        open: true,
        type: "success",
        planName,
      });

      void utils.payments.getCustomer.invalidate();
      void utils.payments.getActivePlan.invalidate();
      void utils.payments.checkFeatureAccess.invalidate();
      void utils.messages.getPlayerMessagingStatus.invalidate();
      router.refresh();
    } else {
      setPaymentStatus({
        open: true,
        type: "canceled",
      });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    params.delete("plan");
    params.delete("success");
    params.delete("canceled");

    const query = params.toString();
    const nextPath = query ? `${pathname}?${query}` : pathname;
    router.replace(nextPath, { scroll: false });
  }, [searchParams, pathname, router, utils]);

  const isPricingPage = pathname === "/pricing";

  return (
    <PaymentStatusDialog
      state={paymentStatus}
      onOpenChange={(open) => setPaymentStatus((prev) => ({ ...prev, open }))}
      onClose={() => setPaymentStatus({ open: false, type: null })}
      variant={isPricingPage ? "pricing" : "inPlace"}
      onGoToDashboard={() => {
        router.push(
          userType === "player" ? "/dashboard/player" : "/dashboard/coaches",
        );
      }}
      onViewPlans={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

export function CheckoutReturnHandler() {
  return (
    <Suspense fallback={null}>
      <CheckoutReturnHandlerInner />
    </Suspense>
  );
}
