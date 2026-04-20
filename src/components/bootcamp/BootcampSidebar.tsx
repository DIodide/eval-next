"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

// Descriptive step labels matching the wireframe sidebar
const STEP_LABELS: Record<number, string> = {
  0: "Your Why",
  1: "Define Your Why",
  2: "Build College List",
  3: "Esport Application",
  4: "Highlight Reel",
  5: "Message Coaches",
};

export function BootcampSidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(true);

  const { data: bootcamp } = api.bootcamp.getBootcamp.useQuery({
    slug: "recruit-bootcamp",
  });

  const { data: progressData } = api.bootcamp.getBootcampProgress.useQuery(
    { bootcampSlug: "recruit-bootcamp" },
    { enabled: !!isSignedIn },
  );

  const modules = progressData?.modules ?? bootcamp?.modules ?? [];
  const overallProgress = progressData?.overallProgress;

  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (!isSignedIn) return moduleIndex === 0;
    if (moduleIndex === 0) return true;
    if (!progressData) return false;
    for (let i = 0; i < moduleIndex; i++) {
      const mod = progressData.modules[i];
      if (!mod) return false;
      const allComplete = mod.lessons.every((l) => l.progress?.completed);
      if (!allComplete) return false;
    }
    return true;
  };

  const isModuleComplete = (moduleIndex: number): boolean => {
    if (!progressData) return false;
    const mod = progressData.modules[moduleIndex];
    if (!mod) return false;
    return mod.lessons.every((l) => l.progress?.completed);
  };

  const getFirstLessonSlug = (mod: (typeof modules)[number]): string => {
    if (progressData) {
      const progressMod = progressData.modules.find(
        (m) => m.slug === mod.slug,
      );
      if (progressMod) {
        const firstIncomplete = progressMod.lessons.find(
          (l) => !l.progress?.completed,
        );
        if (firstIncomplete) return firstIncomplete.slug;
      }
    }
    return mod.lessons[0]?.slug ?? "";
  };

  const completionPct = overallProgress?.completionPercentage ?? 0;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-5 py-5">
        <Link href="/dashboard/player/bootcamp" className="block">
          <div className="font-orbitron text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            EVAL
          </div>
          <div className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Recruit Bootcamp
          </div>
        </Link>

        {/* Green Progress Bar */}
        {isSignedIn && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] text-white/30">
                PROGRESS
              </span>
              <span className="font-mono text-[11px] font-medium text-green-400">
                {Math.round(completionPct)}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-700"
                style={{ width: `${Math.max(completionPct, 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bootcamp Button + Steps */}
      <nav className="flex-1 overflow-y-auto py-3">
        {/* Bootcamp dropdown header */}
        <button
          onClick={() => setStepsExpanded(!stepsExpanded)}
          className="flex w-full items-center justify-between px-5 py-3 font-rajdhani text-sm font-bold text-white transition-colors hover:bg-white/[0.03]"
        >
          <span>Bootcamp</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-white/40 transition-transform",
              stepsExpanded && "rotate-180",
            )}
          />
        </button>

        {/* Steps list */}
        {stepsExpanded && (
          <div className="space-y-0.5 px-3">
            {modules.map((mod, index) => {
              // Only show the first lesson of each module (step-based, not lesson-based)
              const unlocked = isModuleUnlocked(index);
              const complete = isModuleComplete(index);
              const isActive = pathname.includes(`/bootcamp/${mod.slug}`);
              const firstLessonSlug = getFirstLessonSlug(mod);
              const stepLabel =
                STEP_LABELS[mod.order_index] ?? mod.title;

              return (
                <Link
                  key={mod.id}
                  href={
                    unlocked
                      ? `/dashboard/player/bootcamp/${mod.slug}/${firstLessonSlug}`
                      : "#"
                  }
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                    unlocked
                      ? "cursor-pointer hover:bg-white/[0.04]"
                      : "pointer-events-none",
                    isActive && "bg-white/[0.06]",
                  )}
                >
                  {/* Step indicator */}
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-medium",
                      complete
                        ? "border-green-500/30 bg-green-500 text-white"
                        : isActive
                          ? "border-green-500/50 text-green-400"
                          : unlocked
                            ? "border-white/15 text-white/40"
                            : "border-white/[0.06] text-white/15",
                    )}
                  >
                    {complete ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "font-rajdhani text-[13px] font-semibold leading-tight",
                      complete
                        ? "text-white/50"
                        : isActive
                          ? "text-white"
                          : unlocked
                            ? "text-white/60"
                            : "text-white/20",
                    )}
                  >
                    {stepLabel}
                  </span>

                  {!unlocked && (
                    <Lock className="ml-auto h-3 w-3 shrink-0 text-white/10" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-5 py-4">
        <Link
          href="/dashboard/player"
          className="font-mono text-[10px] uppercase tracking-wider text-white/25 transition-colors hover:text-white/50"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-black/90 backdrop-blur-sm lg:hidden"
      >
        {mobileOpen ? (
          <X className="h-4 w-4 text-white" />
        ) : (
          <Menu className="h-4 w-4 text-white" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-white/[0.06] bg-[#08080c] transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
