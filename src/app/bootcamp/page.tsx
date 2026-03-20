"use client";

import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ArrowRight,
  BookOpen,
  Target,
  Trophy,
  Mail,
  Users,
  Sparkles,
} from "lucide-react";
import { BootcampProgressBar } from "@/components/bootcamp/BootcampProgressBar";

const STEP_ICONS = [Play, Target, BookOpen, Users, Trophy, Mail];

export default function BootcampLandingPage() {
  const { isSignedIn } = useUser();

  const { data: bootcamp, isLoading } = api.bootcamp.getBootcamp.useQuery({
    slug: "recruit-bootcamp",
  });

  const { data: progressSummary } =
    api.bootcamp.getProgressSummary.useQuery(
      { bootcampSlug: "recruit-bootcamp" },
      { enabled: !!isSignedIn },
    );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Bootcamp not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge
            variant="outline"
            className="mb-4 border-blue-400/50 text-blue-400"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            EVAL Recruit Bootcamp
          </Badge>

          <h1 className="font-orbitron text-4xl font-bold tracking-tight text-white md:text-5xl">
            6 Steps to Getting{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Recruited
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            {bootcamp.description}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/bootcamp/step-0">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Free — Step 0
              </Button>
            </Link>
            {isSignedIn && progressSummary?.started && (
              <Link href="/dashboard/player/bootcamp">
                <Button size="lg" variant="outline" className="border-white/20">
                  Continue in Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Progress (if signed in and started) */}
      {isSignedIn && progressSummary?.started && (
        <section className="mx-auto max-w-4xl px-4 py-8">
          <BootcampProgressBar
            percentage={progressSummary.completionPercentage}
            completedLessons={progressSummary.completedLessons}
            totalLessons={progressSummary.totalLessons}
          />
        </section>
      )}

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          {bootcamp.modules.map((mod, index) => {
            const IconComponent = STEP_ICONS[index] ?? BookOpen;
            const lessonCount = mod.lessons.length;

            return (
              <Link
                key={mod.id}
                href={
                  mod.is_free
                    ? "/bootcamp/step-0"
                    : isSignedIn
                      ? `/dashboard/player/bootcamp/${mod.slug}/${mod.lessons[0]?.slug ?? ""}`
                      : "/sign-up/players"
                }
              >
                <Card className="group border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/[0.07]">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                      <IconComponent className="h-6 w-6 text-blue-400" />
                    </div>

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
                      </div>
                      <h3 className="font-rajdhani text-lg font-semibold text-white">
                        {mod.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {mod.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {lessonCount} lesson{lessonCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      {!isSignedIn && (
        <section className="border-t border-white/10 px-4 py-16 text-center">
          <h2 className="font-orbitron text-2xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-2 text-gray-400">
            Create your free EVAL account and begin Step 0 today.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/sign-up/players">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-white/20">
                Sign In
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
