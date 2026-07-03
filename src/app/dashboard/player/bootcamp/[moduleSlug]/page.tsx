"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ModuleIndexPage() {
  const params = useParams<{ moduleSlug: string }>();
  const router = useRouter();

  const { data: progressData } = api.bootcamp.getBootcampProgress.useQuery({
    bootcampSlug: "recruit-bootcamp",
  });

  const { data: bootcamp } = api.bootcamp.getBootcamp.useQuery({
    slug: "recruit-bootcamp",
  });

  const currentModule =
    progressData?.modules.find((m) => m.slug === params.moduleSlug) ??
    bootcamp?.modules.find((m) => m.slug === params.moduleSlug);

  useEffect(() => {
    if (currentModule && currentModule.lessons.length > 0) {
      // Find the first incomplete lesson, or default to the first lesson
      let targetSlug = currentModule.lessons[0]!.slug;

      if (progressData) {
        const progressMod = progressData.modules.find(
          (m) => m.slug === params.moduleSlug,
        );
        const firstIncomplete = progressMod?.lessons.find(
          (l) => !l.progress?.completed,
        );
        if (firstIncomplete) {
          targetSlug = firstIncomplete.slug;
        }
      }

      router.replace(
        `/dashboard/player/bootcamp/${params.moduleSlug}/${targetSlug}`,
      );
    }
  }, [currentModule, params.moduleSlug, progressData, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-px w-12 animate-pulse bg-white/20" />
    </div>
  );
}
