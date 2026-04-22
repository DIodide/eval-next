"use client";

import Link from "next/link";
import { Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
  variant?: "inline" | "banner" | "full";
}

export function UpgradePrompt({
  title = "Upgrade Required",
  description = "This feature requires an active plan.",
  ctaText = "View Plans",
  ctaHref = "/pricing",
  className,
  variant = "inline",
}: UpgradePromptProps) {
  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg border border-cyan-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm",
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
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron text-xs font-bold text-white hover:from-cyan-400 hover:to-purple-500"
        >
          <Link href={ctaHref}>
            <Zap className="mr-1 size-3" />
            {ctaText}
          </Link>
        </Button>
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
          asChild
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-white hover:from-cyan-400 hover:to-purple-500"
        >
          <Link href={ctaHref}>
            <Zap className="mr-2 size-4" />
            {ctaText}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-cyan-500/20 bg-black/40 px-4 py-3",
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
        asChild
        size="sm"
        variant="outline"
        className="shrink-0 border-cyan-500/40 font-orbitron text-xs text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
      >
        <Link href={ctaHref}>
          <Zap className="mr-1 size-3" />
          {ctaText}
        </Link>
      </Button>
    </div>
  );
}
