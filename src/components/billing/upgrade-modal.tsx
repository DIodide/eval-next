"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Check, Crown, GraduationCap, Loader2, Lock, User, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getUpgradePlanForFeature,
  type PricingPlanId,
  type UpgradeUserType,
} from "@/lib/pricing-config";
import { useSubscriptionCheckout } from "@/hooks/use-subscription-checkout";
import {
  PaymentStatusDialog,
  type PaymentStatusState,
} from "./payment-status-dialog";
import type { UpgradeModalContext } from "./upgrade-modal-provider";

interface UpgradeModalProps {
  open: boolean;
  context: UpgradeModalContext | null;
  onOpenChange: (open: boolean) => void;
}

function resolveUserType(
  userType: string | undefined,
): UpgradeUserType {
  return userType === "coach" ? "coach" : "player";
}

export function UpgradeModal({ open, context, onOpenChange }: UpgradeModalProps) {
  const { user } = useUser();
  const { startCheckout, loadingPlanId } = useSubscriptionCheckout();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    "player" | "coach" | null
  >(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusState>({
    open: false,
    type: null,
  });

  const userType = resolveUserType(
    user?.publicMetadata?.userType as string | undefined,
  );

  const plan = useMemo(() => {
    if (!context?.featureKey) return null;
    return getUpgradePlanForFeature(context.featureKey, userType);
  }, [context?.featureKey, userType]);

  const isPlayerPlan = plan && "id" in plan && plan.id === "eval_plus";
  const variant = isPlayerPlan ? "player" : "coach";

  const title = context?.title ?? "Upgrade Required";
  const description =
    context?.description ?? "This feature requires an active plan.";

  const handleUpgrade = async () => {
    if (!user) {
      setShowSignUpModal(true);
      return;
    }

    if (!plan || !plan.priceId) {
      setPaymentStatus({
        open: true,
        type: "failed",
        message:
          "Pricing not configured. Please contact support to set up this plan.",
      });
      return;
    }

    await startCheckout({
      planId: plan.id as PricingPlanId,
      priceId: plan.priceId,
      planName: plan.name,
      onError: (message) => {
        setPaymentStatus({
          open: true,
          type: "failed",
          message,
        });
      },
    });
  };

  const accentClasses =
    variant === "player"
      ? {
          icon: "text-yellow-400",
          ring: "ring-yellow-500/30",
          gradient: "from-yellow-500/20 to-amber-600/20",
          badge: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
          button:
            "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-600 hover:to-amber-700",
          price: "text-yellow-300",
        }
      : {
          icon: "text-cyan-400",
          ring: "ring-cyan-500/30",
          gradient: "from-cyan-500/20 to-purple-600/20",
          badge: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
          button:
            "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500",
          price: "text-cyan-300",
        };

  const isLoading = loadingPlanId === plan?.id;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-morphism max-h-[85vh] max-w-md overflow-y-auto border-white/20 text-white sm:max-w-lg">
          <DialogHeader>
            <div className="mb-2 flex justify-center">
              <div
                className={`flex size-14 items-center justify-center rounded-full bg-gradient-to-br ${accentClasses.gradient} ring-1 ${accentClasses.ring}`}
              >
                <Lock className={`size-6 ${accentClasses.icon}`} />
              </div>
            </div>
            <DialogTitle className="font-orbitron text-center text-xl font-bold text-white sm:text-2xl">
              {title}
            </DialogTitle>
            <DialogDescription className="font-rajdhani text-center text-sm text-gray-400">
              {description}
            </DialogDescription>
          </DialogHeader>

          {plan && (
            <Card className="border-gray-700/50 bg-black/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-orbitron text-lg text-white">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="font-rajdhani text-gray-400">
                      Recommended for your account
                    </CardDescription>
                  </div>
                  {"badge" in plan && plan.badge && (
                    <Badge
                      variant="outline"
                      className={`font-orbitron shrink-0 text-[10px] ${accentClasses.badge}`}
                    >
                      {plan.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className={`size-5 ${accentClasses.price}`} />
                  <span className={`font-orbitron text-2xl font-bold ${accentClasses.price}`}>
                    {plan.price > 0 ? `$${plan.price}` : "Contact us"}
                    {plan.interval && (
                      <span className="font-rajdhani text-sm font-normal text-gray-400">
                        /{plan.interval}
                      </span>
                    )}
                  </span>
                  {"oldPrice" in plan && plan.oldPrice && (
                    <span className="font-rajdhani text-sm text-gray-500 line-through">
                      ${plan.oldPrice}
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li
                      key={feature}
                      className="font-rajdhani flex items-start gap-2 text-sm text-gray-300"
                    >
                      <Check className={`mt-0.5 size-4 shrink-0 ${accentClasses.icon}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => void handleUpgrade()}
              disabled={isLoading || !plan}
              className={`font-orbitron w-full font-bold ${accentClasses.button}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Starting checkout...
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" />
                  Upgrade now
                </>
              )}
            </Button>
            <Link
              href="/pricing"
              className="font-rajdhani text-center text-sm text-gray-400 transition-colors hover:text-gray-200"
              onClick={() => onOpenChange(false)}
            >
              Compare all plans
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
        <DialogContent className="glass-morphism max-w-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-center text-xl font-bold">
              Sign up to upgrade
            </DialogTitle>
            <DialogDescription className="font-rajdhani text-center text-gray-400">
              Create an account to subscribe and unlock this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedUserType("player")}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  selectedUserType === "player"
                    ? "border-cyan-400 bg-cyan-900/50"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <User className="mx-auto mb-2 size-6 text-cyan-400" />
                <p className="font-orbitron text-sm font-bold">Player</p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserType("coach")}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  selectedUserType === "coach"
                    ? "border-purple-400 bg-purple-900/50"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <GraduationCap className="mx-auto mb-2 size-6 text-purple-400" />
                <p className="font-orbitron text-sm font-bold">School</p>
              </button>
            </div>
            {selectedUserType ? (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: selectedUserType }}
              >
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowSignUpModal(false)}
                >
                  Sign up as{" "}
                  {selectedUserType === "coach" ? "School" : "Player"}
                </Button>
              </SignUpButton>
            ) : (
              <Button disabled className="w-full">
                Select account type
              </Button>
            )}
            <div className="text-center">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300"
                  onClick={() => setShowSignUpModal(false)}
                >
                  Already have an account? Sign in
                </button>
              </SignInButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentStatusDialog
        state={paymentStatus}
        onOpenChange={(isOpen) =>
          setPaymentStatus((prev) => ({ ...prev, open: isOpen }))
        }
        onClose={() => setPaymentStatus({ open: false, type: null })}
        variant="inPlace"
      />
    </>
  );
}
