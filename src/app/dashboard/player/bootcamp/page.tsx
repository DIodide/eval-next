"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ArrowRight,
  Lock,
  GraduationCap,
  Play,
  Target,
  BookOpen,
  Users,
  Trophy,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STEP_LABELS: Record<number, string> = {
  0: "Your Why",
  1: "Define Your Why",
  2: "Build Your College List",
  3: "Your Application & Profile",
  4: "Highlight Reel",
  5: "Message Coaches",
};

const STEP_ICONS = [Play, Target, BookOpen, Users, Trophy, Mail];

export default function BootcampDashboardPage() {
  const { data: bootcamp, isLoading } = api.bootcamp.getBootcamp.useQuery({
    slug: "recruit-bootcamp",
  });

  const { data: progressData } =
    api.bootcamp.getBootcampProgress.useQuery(
      { bootcampSlug: "recruit-bootcamp" },
      { retry: (_, err) => err.data?.code !== "FORBIDDEN" },
    );

  const modules = progressData?.modules ?? bootcamp?.modules ?? [];

  const isModuleUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    if (!progressData) return false;
    for (let i = 0; i < index; i++) {
      const mod = progressData.modules[i];
      if (!mod) return false;
      if (!mod.lessons.every((l) => l.progress?.completed)) return false;
    }
    return true;
  };

  const isModuleComplete = (index: number): boolean => {
    if (!progressData) return false;
    const mod = progressData.modules[index];
    if (!mod) return false;
    return mod.lessons.every((l) => l.progress?.completed);
  };

  const getModuleLink = (mod: (typeof modules)[number], index: number) => {
    if (!isModuleUnlocked(index)) return "#";
    if (progressData) {
      const pm = progressData.modules.find((m) => m.slug === mod.slug);
      const firstIncomplete = pm?.lessons.find((l) => !l.progress?.completed);
      if (firstIncomplete)
        return `/dashboard/player/bootcamp/${mod.slug}/${firstIncomplete.slug}`;
    }
    return `/dashboard/player/bootcamp/${mod.slug}/${mod.lessons[0]?.slug ?? ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-rajdhani text-sm text-gray-400">
          Bootcamp not found
        </p>
      </div>
    );
  }

  const completionPct =
    progressData?.overallProgress?.completionPercentage ?? 0;
  const isBootcampComplete = completionPct >= 100;
  const completedSteps = modules.filter((_, i) => isModuleComplete(i)).length;

  return (
    <div className="p-6">
      {/* Header row */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron text-2xl font-bold text-white">
              Recruit Bootcamp
            </h1>
            <p className="mt-1 max-w-lg font-rajdhani text-sm text-gray-400">
              {bootcamp.description}
            </p>
          </div>
        </div>

        {/* Progress widget */}
        <div className="flex shrink-0 items-center gap-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <div className="text-right">
            <div className="font-orbitron text-2xl font-bold text-blue-400">
              {Math.round(completionPct)}%
            </div>
            <div className="font-rajdhani text-xs text-gray-500">
              {completedSteps}/{modules.length} steps
            </div>
          </div>
          <div className="w-32">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificate CTA */}
      {isBootcampComplete && (
        <Link
          href="/dashboard/player/bootcamp/complete"
          className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 px-5 py-3 transition-colors hover:border-yellow-500/30"
        >
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="font-rajdhani text-sm font-bold text-yellow-300">
            View Your Certificate
          </span>
          <ArrowRight className="ml-auto h-4 w-4 text-yellow-400/50" />
        </Link>
      )}

      {/* Steps list */}
      <div className="space-y-3">
        {modules.map((mod, index) => {
          const unlocked = isModuleUnlocked(index);
          const complete = isModuleComplete(index);
          const href = getModuleLink(mod, index);
          const stepLabel = STEP_LABELS[mod.order_index] ?? mod.title;
          const StepIcon = STEP_ICONS[index] ?? BookOpen;

          return (
            <Link
              key={mod.id}
              href={href}
              className={cn(
                "group flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-200",
                complete
                  ? "border-green-500/20 bg-green-500/[0.03] hover:border-green-400/30"
                  : unlocked
                    ? "border-white/10 bg-white/[0.03] hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10"
                    : "pointer-events-none border-white/5 bg-white/[0.01] opacity-50",
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  complete
                    ? "bg-green-500/15"
                    : unlocked
                      ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                      : "bg-white/5",
                )}
              >
                {complete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : unlocked ? (
                  <StepIcon className="h-5 w-5 text-blue-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-rajdhani text-xs font-medium uppercase tracking-wide",
                      complete
                        ? "text-green-400/60"
                        : unlocked
                          ? "text-gray-500"
                          : "text-gray-600",
                    )}
                  >
                    Step {index + 1}
                  </span>
                  {complete && (
                    <Badge className="border-green-400/30 bg-green-500/10 px-1.5 py-0 text-[10px] text-green-400">
                      Done
                    </Badge>
                  )}
                  {unlocked && !complete && (
                    <Badge
                      variant="outline"
                      className="border-blue-400/30 px-1.5 py-0 text-[10px] text-blue-400"
                    >
                      Current
                    </Badge>
                  )}
                </div>
                <h2
                  className={cn(
                    "font-rajdhani text-sm font-semibold",
                    complete
                      ? "text-gray-300"
                      : unlocked
                        ? "text-white"
                        : "text-gray-500",
                  )}
                >
                  {stepLabel}
                </h2>
              </div>

              {/* Arrow */}
              {unlocked && (
                <ArrowRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200 group-hover:translate-x-1",
                    complete
                      ? "text-green-400/30 group-hover:text-green-400"
                      : "text-gray-600 group-hover:text-blue-400",
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Motivational footer */}
      <p className="mt-6 text-center font-rajdhani text-xs text-gray-600">
        Complete the bootcamp to earn a certificate and get priority for your
        preferred cohort.
      </p>
    </div>
  );
}
