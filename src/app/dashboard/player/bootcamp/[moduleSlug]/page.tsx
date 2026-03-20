"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";
import { useEffect } from "react";

export default function ModuleIndexPage() {
  const params = useParams<{ moduleSlug: string }>();
  const router = useRouter();

  const { data, isLoading } = api.bootcamp.getBootcampProgress.useQuery({
    bootcampSlug: "recruit-bootcamp",
  });

  const currentModule = data?.modules.find((m) => m.slug === params.moduleSlug);

  // Redirect single-lesson modules directly to the lesson
  useEffect(() => {
    if (currentModule && currentModule.lessons.length === 1) {
      const lesson = currentModule.lessons[0]!;
      router.replace(
        `/dashboard/player/bootcamp/${params.moduleSlug}/${lesson.slug}`,
      );
    }
  }, [currentModule, params.moduleSlug, router]);

  if (isLoading || (currentModule && currentModule.lessons.length === 1)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Module not found.</p>
      </div>
    );
  }

  const isLessonUnlocked = (lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    const prevLesson = currentModule.lessons[lessonIndex - 1];
    return prevLesson?.progress?.completed ?? false;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link
          href="/dashboard/player/bootcamp"
          className="hover:text-white"
        >
          Bootcamp
        </Link>
        <span>/</span>
        <span className="text-white">Step {currentModule.order_index}</span>
      </div>

      {/* Header */}
      <div>
        <span className="text-xs font-medium uppercase text-gray-500">
          Step {currentModule.order_index}
        </span>
        <h1 className="mt-1 font-orbitron text-2xl font-bold text-white">
          {currentModule.title}
        </h1>
        <p className="mt-2 text-gray-400">{currentModule.description}</p>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {currentModule.lessons.map((lesson, index) => {
          const unlocked = isLessonUnlocked(index);
          const complete = lesson.progress?.completed ?? false;

          return (
            <Link
              key={lesson.id}
              href={
                unlocked
                  ? `/dashboard/player/bootcamp/${params.moduleSlug}/${lesson.slug}`
                  : "#"
              }
              className={!unlocked ? "pointer-events-none" : ""}
            >
              <Card
                className={`group border transition-all ${
                  complete
                    ? "border-green-500/30 bg-green-500/5"
                    : unlocked
                      ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                      : "border-white/5 bg-white/[0.02] opacity-50"
                }`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {complete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : unlocked ? (
                      <Circle className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-rajdhani text-base font-semibold text-white">
                      {lesson.title}
                    </h3>
                    {complete && (
                      <span className="text-xs text-green-400">Complete</span>
                    )}
                  </div>

                  {unlocked && (
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Back */}
      <Link
        href="/dashboard/player/bootcamp"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bootcamp Overview
      </Link>
    </div>
  );
}
