"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  X,
  XCircle,
} from "lucide-react";

export type PaymentStatusType = "success" | "failed" | "canceled";

export interface PaymentStatusState {
  open: boolean;
  type: PaymentStatusType | null;
  planName?: string;
  message?: string;
}

interface PaymentStatusDialogProps {
  state: PaymentStatusState;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  /** In-place checkout: stay on current page. Pricing page: offer dashboard navigation. */
  variant?: "inPlace" | "pricing";
  onGoToDashboard?: () => void;
  onViewPlans?: () => void;
}

export function PaymentStatusDialog({
  state,
  onOpenChange,
  onClose,
  variant = "inPlace",
  onGoToDashboard,
  onViewPlans,
}: PaymentStatusDialogProps) {
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism max-w-md border-white/20 text-white sm:max-w-md">
        {state.type === "success" && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-green-400/20">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <DialogTitle className="font-orbitron text-2xl font-bold text-white">
                SUBSCRIPTION ACTIVATED!
              </DialogTitle>
              <DialogDescription className="font-rajdhani text-base text-gray-300">
                Welcome to {state.planName ?? "Premium"}!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-green-400/30 bg-gradient-to-r from-green-600/10 to-green-400/10 p-4">
                <div className="flex items-start space-x-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                  <div className="flex-1">
                    <p className="font-rajdhani text-sm font-semibold text-white">
                      Your subscription is now active
                    </p>
                    <p className="font-rajdhani mt-1 text-xs text-gray-300">
                      {variant === "inPlace"
                        ? "You can continue where you left off. Your billing cycle will renew automatically."
                        : "You now have access to all premium features. Your billing cycle will renew automatically."}
                    </p>
                  </div>
                </div>
              </div>
              {variant === "pricing" && (
                <div className="space-y-2">
                  <p className="font-rajdhani text-sm font-semibold text-white">
                    What&apos;s next?
                  </p>
                  <ul className="font-rajdhani space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
                      <span>
                        Access your dashboard to explore premium features
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
                      <span>
                        Start recruiting with advanced search and analytics
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
                      <span>
                        Manage your subscription anytime from your account
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              {variant === "pricing" ? (
                <>
                  <Button
                    onClick={() => {
                      onClose();
                      onGoToDashboard?.();
                    }}
                    className="font-orbitron w-full bg-gradient-to-r from-green-500 to-green-600 text-white transition-all hover:from-green-600 hover:to-green-700 sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="font-rajdhani w-full border-gray-600 text-gray-300 hover:bg-gray-800 sm:w-auto"
                  >
                    Stay on Pricing
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onClose}
                  className="font-orbitron w-full bg-gradient-to-r from-green-500 to-green-600 text-white transition-all hover:from-green-600 hover:to-green-700 sm:w-auto"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </DialogFooter>
          </>
        )}

        {state.type === "failed" && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/20">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <DialogTitle className="font-orbitron text-2xl font-bold text-white">
                PAYMENT FAILED
              </DialogTitle>
              <DialogDescription className="font-rajdhani text-base text-gray-300">
                We couldn&apos;t process your payment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-red-400/30 bg-gradient-to-r from-red-600/10 to-red-400/10 p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div className="flex-1">
                    <p className="font-rajdhani text-sm font-semibold text-white">
                      {state.message ??
                        "There was an issue processing your payment"}
                    </p>
                    <p className="font-rajdhani mt-1 text-xs text-gray-300">
                      Please check your payment method and try again, or contact
                      support if the problem persists.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-rajdhani text-sm font-semibold text-white">
                  Common issues:
                </p>
                <ul className="font-rajdhani space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <X className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400" />
                    <span>Insufficient funds or card declined</span>
                  </li>
                  <li className="flex items-start">
                    <X className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400" />
                    <span>Expired or invalid payment method</span>
                  </li>
                  <li className="flex items-start">
                    <X className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400" />
                    <span>Network or processing error</span>
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                onClick={onClose}
                className="font-orbitron w-full bg-gradient-to-r from-orange-400 to-orange-500 text-black transition-all hover:from-orange-500 hover:to-orange-600 sm:w-auto"
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  window.open("mailto:support@evalgaming.com", "_blank");
                }}
                variant="outline"
                className="font-rajdhani w-full border-gray-600 text-gray-300 hover:bg-gray-800 sm:w-auto"
              >
                Contact Support
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="font-rajdhani w-full text-gray-400 hover:text-gray-300 sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}

        {state.type === "canceled" && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/20">
                <AlertCircle className="h-10 w-10 text-yellow-400" />
              </div>
              <DialogTitle className="font-orbitron text-2xl font-bold text-white">
                CHECKOUT CANCELED
              </DialogTitle>
              <DialogDescription className="font-rajdhani text-base text-gray-300">
                No charges were made to your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-yellow-400/30 bg-gradient-to-r from-yellow-600/10 to-yellow-400/10 p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-rajdhani text-sm font-semibold text-white">
                      Your checkout was canceled
                    </p>
                    <p className="font-rajdhani mt-1 text-xs text-gray-300">
                      You can return to complete your subscription anytime. No
                      payment was processed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-rajdhani text-sm font-semibold text-white">
                  Ready to upgrade?
                </p>
                <ul className="font-rajdhani space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <span>All plans include a full feature set</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <span>Cancel anytime with no long-term commitment</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <span>Secure payment processing via Stripe</span>
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              {variant === "pricing" && (
                <Button
                  onClick={() => {
                    onClose();
                    onViewPlans?.();
                  }}
                  className="font-orbitron w-full bg-gradient-to-r from-orange-400 to-orange-500 text-black transition-all hover:from-orange-500 hover:to-orange-600 sm:w-auto"
                >
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="font-rajdhani w-full border-gray-600 text-gray-300 hover:bg-gray-800 sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
