"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BootcampProgressBar } from "@/components/bootcamp/BootcampProgressBar";
import {
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  BookOpen,
  Target,
  Trophy,
  Mail,
  Users,
  GraduationCap,
} from "lucide-react";

const STEP_ICONS = [Play, Target, BookOpen, Users, Trophy, Mail];

export default function BootcampDashboardPage() {
  const { data, isLoading } = api.bootcamp.getBootcampProgress.useQuery({
    bootcampSlug: "recruit-bootcamp",
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Bootcamp not available.</p>
      </div>
    );
  }

  const { bootcamp, overallProgress, modules } = data;

  // Determine which modules/lessons are unlocked
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    // Check all prior modules are complete
    for (let i = 0; i < moduleIndex; i++) {
      const mod = modules[i];
      if (!mod) return false;
      const allComplete = mod.lessons.every((l) => l.progress?.completed);
      if (!allComplete) return false;
    }
    return true;
  };

  const isModuleComplete = (mod: (typeof modules)[number]): boolean => {
    return mod.lessons.every((l) => l.progress?.completed);
  };

  // Find the first incomplete lesson to link "Continue"
  const getModuleLink = (
    mod: (typeof modules)[number],
  ): string => {
    const firstIncomplete = mod.lessons.find((l) => !l.progress?.completed);
    const targetLesson = firstIncomplete ?? mod.lessons[0];
    if (!targetLesson) return "#";
    return `/dashboard/player/bootcamp/${mod.slug}/${targetLesson.slug}`;
  };

  const completionPct = overallProgress?.completionPercentage ?? 0;
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.progress?.completed).length,
    0,
  );

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3">
            <GraduationCap className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="font-orbitron text-2xl font-bold text-white">
              {bootcamp.title}
            </h1>
            <p className="text-sm text-gray-400">{bootcamp.description}</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6">
          <BootcampProgressBar
            percentage={completionPct}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
          />
        </div>

        {completionPct === 100 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold text-yellow-400">
              Bootcamp Complete — EVAL Verified Badge Earned!
            </span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {modules.map((mod, index) => {
          const IconComponent = STEP_ICONS[index] ?? BookOpen;
          const unlocked = isModuleUnlocked(index);
          const complete = isModuleComplete(mod);
          const lessonCount = mod.lessons.length;
          const completedInModule = mod.lessons.filter(
            (l) => l.progress?.completed,
          ).length;

          return (
            <Link
              key={mod.id}
              href={unlocked ? getModuleLink(mod) : "#"}
              className={!unlocked ? "pointer-events-none" : ""}
            >
              <Card
                className={`group border transition-all ${
                  complete
                    ? "border-green-500/30 bg-green-500/5"
                    : unlocked
                      ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                      : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      complete
                        ? "bg-green-500/20"
                        : unlocked
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                          : "bg-white/5"
                    }`}
                  >
                    {complete ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : unlocked ? (
                      <IconComponent className="h-6 w-6 text-blue-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Step {mod.order_index}
                      </span>
                      {mod.is_free && (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 text-xs text-green-400"
                        >
                          Free
                        </Badge>
                      )}
                      {complete && (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 text-xs text-green-400"
                        >
                          Complete
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-rajdhani text-lg font-semibold text-white">
                      {mod.title}
                    </h3>

                    {/* Per-module progress */}
                    {unlocked && !complete && lessonCount > 1 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${(completedInModule / lessonCount) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {completedInModule}/{lessonCount}
                        </span>
                      </div>
                    )}

                    {unlocked && lessonCount === 1 && !complete && (
                      <p className="mt-1 text-xs text-gray-500">1 lesson</p>
                    )}
                  </div>

                  {/* Arrow */}
                  {unlocked && (
                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
