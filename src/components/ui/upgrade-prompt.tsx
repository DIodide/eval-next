"use client";

import Link from "next/link";
import { Lock, Zap } from "lucide-react";
import { isBillingEnabled } from "@/lib/billing-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FeatureKey } from "@/lib/pricing-config";
import { useUpgradeModal } from "@/components/billing/upgrade-modal-provider";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  featureKey?: FeatureKey;
  className?: string;
  variant?: "inline" | "banner" | "full";
}

export function UpgradePrompt({
  title = "Upgrade Required",
  description = "This feature requires an active plan.",
  ctaText = "View Plans",
  ctaHref = "/pricing",
  featureKey,
  className,
  variant = "inline",
}: UpgradePromptProps) {
  const { openUpgradeModal } = useUpgradeModal();

  if (!isBillingEnabled()) {
    return null;
  }

  const handleUpgrade = () => {
    if (featureKey) {
      openUpgradeModal({ featureKey, title, description });
      return;
    }
    window.location.href = ctaHref;
  };

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex flex-col items-stretch justify-between gap-4 rounded-lg border border-cyan-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <Lock className="size-4 shrink-0 text-cyan-400" />
          <p className="font-rajdhani text-sm text-gray-300">
            <span className="font-semibold text-white">{title}:</span>{" "}
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron text-xs font-bold text-white hover:from-cyan-400 hover:to-purple-500"
          >
            <Zap className="mr-1 size-3" />
            {ctaText}
          </Button>
          {featureKey && (
            <Link
              href={ctaHref}
              className="font-rajdhani text-center text-xs text-gray-500 hover:text-gray-300 sm:text-right"
            >
              Compare plans
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-6 rounded-xl border border-cyan-500/20 bg-black/70 px-8 py-12 text-center backdrop-blur-sm",
          className,
        )}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 ring-1 ring-cyan-500/30">
          <Lock className="size-7 text-cyan-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-orbitron text-xl font-bold text-white">{title}</h3>
          <p className="font-rajdhani max-w-sm text-gray-400">{description}</p>
        </div>
        <Button
          size="lg"
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-white hover:from-cyan-400 hover:to-purple-500"
        >
          <Zap className="mr-2 size-4" />
          {ctaText}
        </Button>
        {featureKey && (
          <Link
            href={ctaHref}
            className="font-rajdhani text-sm text-gray-500 hover:text-gray-300"
          >
            Compare all plans
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-3 rounded-lg border border-cyan-500/20 bg-black/40 px-4 py-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      <Lock className="size-4 shrink-0 text-cyan-400" />
      <div className="min-w-0 flex-1">
        <p className="font-rajdhani text-sm text-gray-300">
          <span className="font-semibold text-white">{title} — </span>
          {description}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleUpgrade}
        className="shrink-0 border-cyan-500/40 font-orbitron text-xs text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
      >
        <Zap className="mr-1 size-3" />
        {ctaText}
      </Button>
    </div>
  );
}
