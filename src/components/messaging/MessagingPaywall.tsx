"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LockIcon, CrownIcon } from "lucide-react";
import Link from "next/link";

interface MessagingPaywallProps {
  title?: string;
  description?: string;
  priceLabel?: string;
  ctaLabel?: string;
  compact?: boolean;
}

export function MessagingPaywall({
  title = "Upgrade to EVAL+",
  description = "You have used your free monthly coach intro quota. Upgrade to keep starting new conversations while preserving unlimited replies in existing threads.",
  priceLabel = "$5/month",
  ctaLabel = "Unlock EVAL+",
  compact = false,
}: MessagingPaywallProps) {
  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-8">
      <Card
        className={`w-full max-w-md border-yellow-500/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-center shadow-2xl ${
          compact ? "p-6" : "p-8"
        }`}
      >
        <div className={`flex justify-center ${compact ? "mb-4" : "mb-6"}`}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl" />
            <div
              className={`relative flex items-center justify-center rounded-full border-2 border-yellow-500/50 bg-gray-800 ${
                compact ? "h-16 w-16" : "h-20 w-20"
              }`}
            >
              <LockIcon
                className={`${compact ? "h-7 w-7" : "h-8 w-8"} text-yellow-400`}
              />
            </div>
          </div>
        </div>
        <h2
          className={`font-orbitron mb-3 font-bold text-white ${compact ? "text-xl" : "text-2xl"}`}
        >
          {title}
        </h2>
        <p
          className={`font-rajdhani text-gray-400 ${compact ? "mb-4 text-sm" : "mb-6"}`}
        >
          {description}
        </p>
        <div
          className={`flex items-center justify-center gap-2 text-yellow-300 ${compact ? "mb-3" : "mb-4"}`}
        >
          <CrownIcon className="h-5 w-5" />
          <span className="font-orbitron text-lg font-bold">{priceLabel}</span>
        </div>
        <Button
          asChild
          className="font-orbitron w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg hover:from-yellow-600 hover:to-amber-700"
        >
          <Link href="/pricing">{ctaLabel}</Link>
        </Button>
      </Card>
    </div>
  );
}
