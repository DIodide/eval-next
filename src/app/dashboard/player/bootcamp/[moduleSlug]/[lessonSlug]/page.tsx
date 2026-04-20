"use client";

import { useRef, useState } from "react";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  VideoPlayer,
  type BootcampVideoPlayerHandle,
} from "@/components/bootcamp/VideoPlayer";
import { TranscriptPanel } from "@/components/bootcamp/TranscriptPanel";
import { QuizComponent } from "@/components/bootcamp/QuizComponent";
import { ReflectionForm } from "@/components/bootcamp/ReflectionForm";
import { StepZeroWhyEsports } from "@/components/bootcamp/steps/StepZeroWhyEsports";
import { StepOneCollegeList } from "@/components/bootcamp/steps/StepOneCollegeList";
import { StepTwoProfile } from "@/components/bootcamp/steps/StepTwoProfile";
import { StepThreeHighlightReel } from "@/components/bootcamp/steps/StepThreeHighlightReel";
import { StepFourEmailWriting } from "@/components/bootcamp/steps/StepFourEmailWriting";
import { ArrowRight, Check, Trophy, Award, Play } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Step titles for sidebar-style descriptive names
const STEP_LABELS: Record<number, string> = {
  0: "Welcome & Your Why",
  1: "Define Your Why",
  2: "Build Your College List",
  3: "Your Application & Profile",
  4: "Highlight Reel",
  5: "Message Coaches",
};

// Step descriptions/takeaways
const STEP_DESCRIPTIONS: Record<number, { description: string; takeaways: string[] }> = {
  0: {
    description:
      "Before we start building your recruiting toolkit, you need clarity on why you're doing this. Recruiting takes time and consistent effort. If you don't understand your 'why,' you won't stay disciplined long enough for this process to work.",
    takeaways: [
      "Clarity on your personal motivation",
      "Understanding of the 5 bootcamp outcomes",
      "Your 'why' statement saved to your profile",
    ],
  },
  1: {
    description:
      "Reflect deeply on what drives you in esports recruiting. This is the foundation that will keep you motivated throughout the entire process.",
    takeaways: [
      "A written reflection on your motivation",
      "Understanding of what recruiting takes",
      "Foundation for your recruiting journey",
    ],
  },
  2: {
    description:
      "Build a clear, realistic college list by searching EVAL's college database. Rank at least 5 schools and identify what factors matter most to you in recruiting.",
    takeaways: [
      "A ranked list of your top 5+ colleges",
      "Understanding of recruiting factors",
      "Knowledge of available esports scholarships",
    ],
  },
  3: {
    description:
      "Frame your gaming experience in terms coaches understand. Complete the Coach Perspective Workshop and build your EVAL profile to stand out to recruiters.",
    takeaways: [
      "Your EVAL profile filled out",
      "Coach-ready descriptions of your skills",
      "Application-appropriate language for esports",
    ],
  },
  4: {
    description:
      "Watch highlight reel examples from your cohort or create your own. A strong highlight reel is one of the most powerful tools in esports recruiting.",
    takeaways: [
      "Understanding of what makes a good reel",
      "Your own highlight reel (or inspiration)",
      "Clips uploaded to your profile",
    ],
  },
  5: {
    description:
      "Learn to write compelling outreach emails to college coaches. Practice crafting your personal email with the 5 key sections every coach email needs.",
    takeaways: [
      "A complete outreach email template",
      "Knowledge of the 5 email components",
      "Practice email ready to send",
    ],
  },
};

export default function LessonPage() {
  const params = useParams<{ moduleSlug: string; lessonSlug: string }>();
  const router = useRouter();

  const { data: lesson, isLoading } = api.bootcamp.getLesson.useQuery({
    bootcampSlug: "recruit-bootcamp",
    moduleSlug: params.moduleSlug,
    lessonSlug: params.lessonSlug,
  });

  const { data: progress, refetch: refetchProgress } =
    api.bootcamp.getLessonProgress.useQuery(
      { lessonId: lesson?.id ?? "" },
      { enabled: !!lesson?.id },
    );

  const { data: bootcampProgress, refetch: refetchBootcamp } =
    api.bootcamp.getBootcampProgress.useQuery({
      bootcampSlug: "recruit-bootcamp",
    });

  const markWatched = api.bootcamp.markVideoWatched.useMutation({
    onSuccess: () => {
      void refetchProgress();
      toast.success("Video marked as watched");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const saveLastPosition = api.bootcamp.saveLastPosition.useMutation();

  const playerRef = useRef<BootcampVideoPlayerHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const submitQuiz = api.bootcamp.submitQuiz.useMutation();

  const submitReflection = api.bootcamp.submitReflection.useMutation({
    onSuccess: () => {
      void refetchProgress();
      void refetchBootcamp();
      toast.success("Reflection submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const saveStepData = api.bootcamp.saveStepData.useMutation({
    onSuccess: (result) => {
      void refetchProgress();
      void refetchBootcamp();
      if (result.stepComplete) {
        toast.success("Step saved! Progress updated.");
      }
      if (result.bootcampComplete) {
        toast.success("Bootcamp complete! You earned the EVAL Verified badge!", {
          duration: 5000,
        });
        router.push("/dashboard/player/bootcamp/complete");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const findNextLesson = () => {
    if (!bootcampProgress) return null;
    const modules = bootcampProgress.modules;
    const modIdx = modules.findIndex((m) => m.slug === params.moduleSlug);
    if (modIdx === -1) return null;
    const mod = modules[modIdx]!;
    const lessonIdx = mod.lessons.findIndex(
      (l) => l.slug === params.lessonSlug,
    );

    if (lessonIdx < mod.lessons.length - 1) {
      const next = mod.lessons[lessonIdx + 1]!;
      return { moduleSlug: mod.slug, lessonSlug: next.slug, title: next.title };
    }
    if (modIdx < modules.length - 1) {
      const nextMod = modules[modIdx + 1]!;
      if (nextMod.lessons.length > 0) {
        return {
          moduleSlug: nextMod.slug,
          lessonSlug: nextMod.lessons[0]!.slug,
          title: STEP_LABELS[nextMod.order_index] ?? nextMod.title,
        };
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-rajdhani text-sm text-white/30">Lesson not found</p>
      </div>
    );
  }

  const moduleIndex = lesson.module.orderIndex;
  const nextLesson = findNextLesson();
  const isComplete = progress?.completed ?? false;
  const videoWatched = progress?.videoWatched ?? false;
  const stepData = (progress?.stepData ?? {}) as unknown as Record<string, unknown>;
  const stepInfo = STEP_DESCRIPTIONS[moduleIndex];
  const completionPct =
    bootcampProgress?.overallProgress?.completionPercentage ?? 0;

  // Determine if this step uses new interactive format (step_data based)
  // Module 1 uses legacy quiz/reflection flow; modules 0, 2-5 use interactive steps
  const isInteractiveStep = moduleIndex !== 1;

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0f0f1a]/95 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <span className="font-orbitron text-xs font-bold text-blue-400">
            {Math.round(completionPct)}%
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct >= 100 && (
            <Award className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 font-rajdhani text-xs uppercase tracking-wider text-gray-400">
          <Link
            href="/dashboard/player/bootcamp"
            className="transition-colors hover:text-white"
          >
            Bootcamp
          </Link>
          <span>/</span>
          <span>
            Step {moduleIndex}:{" "}
            {STEP_LABELS[moduleIndex] ?? lesson.module.title}
          </span>
          {isComplete && (
            <>
              <span className="mx-1">&middot;</span>
              <Badge className="border-green-400/30 bg-green-500/10 text-green-400">
                <Check className="h-2.5 w-2.5" />
                Complete
              </Badge>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-orbitron text-xl font-bold tracking-tight text-white lg:text-2xl">
          {STEP_LABELS[moduleIndex] ?? lesson.title}
        </h1>

        {/* Main Content Grid: Video + Interactive Panel */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Left: Video + Description */}
          <div className="lg:col-span-3">
            {/* Video */}
            {lesson.videoUrl && (
              <VideoPlayer
                ref={playerRef}
                videoUrl={lesson.videoUrl}
                hlsUrl={lesson.videoHlsUrl}
                posterUrl={lesson.posterUrl}
                captionUrl={lesson.transcriptVttUrl}
                durationSeconds={lesson.durationSeconds}
                lastPositionSeconds={progress?.lastPositionSeconds}
                isWatched={videoWatched}
                isLoading={markWatched.isPending}
                onWatched={() => {
                  markWatched.mutate({ lessonId: lesson.id });
                }}
                onTimeUpdate={setCurrentTime}
                onSavePosition={(positionSeconds) => {
                  saveLastPosition.mutate({
                    lessonId: lesson.id,
                    positionSeconds,
                  });
                }}
              />
            )}

            {/* Transcript */}
            {lesson.videoUrl && lesson.transcriptVttUrl && (
              <div className="mt-6">
                <TranscriptPanel
                  vttUrl={lesson.transcriptVttUrl}
                  currentTime={currentTime}
                  onSeek={(s) => playerRef.current?.seekTo(s)}
                />
              </div>
            )}

            {/* Next Step CTA - appears when current step is complete */}
            {isComplete && nextLesson && (
              <Link
                href={`/dashboard/player/bootcamp/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
                className="group mt-6 flex items-center justify-between rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-5 transition-colors hover:border-blue-400/30 hover:from-blue-600/20 hover:to-purple-600/20"
              >
                <div>
                  <div className="font-rajdhani text-xs font-bold uppercase tracking-wider text-blue-400/60">
                    Next Step
                  </div>
                  <div className="mt-1 font-rajdhani text-lg font-bold text-white group-hover:text-blue-100">
                    {nextLesson.title}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-400/50 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
              </Link>
            )}

            {/* Bootcamp Complete */}
            {isComplete && !nextLesson && (
              <Link
                href="/dashboard/player/bootcamp/complete"
                className="mt-6 flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-5"
              >
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-rajdhani text-base font-bold text-white">
                    Bootcamp Complete!
                  </div>
                  <div className="font-rajdhani text-xs text-white/30">
                    Click to view your certificate
                  </div>
                </div>
              </Link>
            )}

            {/* Description & Takeaways */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Card className="border-white/10 bg-white/5 py-0">
                <CardContent className="p-5">
                  <h3 className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Description
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    {stepInfo?.description ?? lesson.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 py-0">
                <CardContent className="p-5">
                  <h3 className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Key Takeaways
                  </h3>
                  {stepInfo?.takeaways ? (
                    <ul className="mt-3 space-y-2">
                      {stepInfo.takeaways.map((t, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-white/50"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400/60" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-white/50">
                      Complete this step to progress in the bootcamp.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Interactive Panel */}
          <div className="lg:col-span-2">
            {isInteractiveStep ? (
              <div>
                {moduleIndex === 0 && (
                  <StepZeroWhyEsports
                    initialSelections={
                      (stepData.why_esports as string[]) ?? []
                    }
                    initialWhyText={(stepData.your_why as string) ?? ""}
                    isSaving={saveStepData.isPending}
                    onSaveWhyEsports={async (selections) => {
                      await saveStepData.mutateAsync({
                        lessonId: lesson.id,
                        stepData: { why_esports: selections },
                      });
                    }}
                    onSaveYourWhy={async (text) => {
                      await saveStepData.mutateAsync({
                        lessonId: lesson.id,
                        stepData: { your_why: text },
                      });
                    }}
                  />
                )}

                {moduleIndex === 2 && (
                  <StepOneCollegeList
                    initialData={stepData as {
                      game_played?: string;
                      gpa?: string;
                      college_rankings?: string[];
                      recruiting_factors?: string[];
                    }}
                    isSaving={saveStepData.isPending}
                    onSave={async (data) => {
                      await saveStepData.mutateAsync({
                        lessonId: lesson.id,
                        stepData: data,
                      });
                    }}
                  />
                )}

                {moduleIndex === 3 && (
                  <StepTwoProfile
                    initialData={stepData as {
                      coach_perspective?: Record<string, string>;
                      eval_ranking_description?: string;
                    }}
                    isSaving={saveStepData.isPending}
                    onSave={async (data) => {
                      await saveStepData.mutateAsync({
                        lessonId: lesson.id,
                        stepData: data,
                      });
                    }}
                  />
                )}

                {moduleIndex === 4 && (
                  <StepThreeHighlightReel
                    initialData={stepData as {
                      reel_action_completed?: boolean;
                      uploaded_clips?: string[];
                    }}
                    isSaving={saveStepData.isPending}
                    onSave={async (data) => {
                      await saveStepData.mutateAsync({
                        lessonId: lesson.id,
                        stepData: data,
                      });
                    }}
                  />
                )}

                {moduleIndex === 5 && (
                  <StepFourEmailWriting
                    initialData={stepData as {
                      email_draft?: Record<string, string>;
                      email_signature?: string;
                    }}
                    isSaving={saveStepData.isPending}
                    onSave={async (data) => {
                      await saveStepData.mutateAsync({
                        lessonId: lesson.id,
                        stepData: data,
                      });
                    }}
                  />
                )}

                {/* Motivating message */}
                <Card className="mt-4 border-white/10 bg-white/5 py-0">
                  <CardContent className="p-4">
                    <p className="text-center font-rajdhani text-xs text-gray-400">
                      Complete the bootcamp to earn your EVAL certificate. The
                      better you do, the more likely you are to get into your
                      preferred cohort.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Legacy quiz/reflection format for any non-interactive lessons */
              <div className="space-y-6">
                {!videoWatched && (
                  <Card className="border-blue-500/20 bg-gradient-to-r from-blue-600/5 to-purple-600/5 py-0">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                          <Play className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-rajdhani text-sm font-bold text-white">
                            Watch the Video First
                          </h3>
                          <p className="mt-1 font-rajdhani text-xs text-gray-400">
                            Watch the video and click &ldquo;Mark as watched&rdquo; to unlock
                            the reflection and quiz for this step.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lesson.requiresReflection && videoWatched && (
                  <ReflectionForm
                    alreadySubmitted={progress?.reflectionSubmitted ?? false}
                    existingText={progress?.reflectionText}
                    onSubmit={async (text) => {
                      await submitReflection.mutateAsync({
                        lessonId: lesson.id,
                        reflectionText: text,
                      });
                    }}
                  />
                )}

                {lesson.quiz && videoWatched && (
                  <QuizComponent
                    title={lesson.quiz.title}
                    questions={lesson.quiz.questions}
                    passingScore={lesson.quiz.passingScore}
                    alreadyPassed={progress?.quizPassed ?? false}
                    previousScore={progress?.quizScore}
                    previousAttempts={progress?.quizAttempts}
                    onSubmit={async (answers) => {
                      const result = await submitQuiz.mutateAsync({
                        lessonId: lesson.id,
                        answers,
                      });
                      void refetchProgress();
                      void refetchBootcamp();
                      if (result.bootcampComplete) {
                        toast.success(
                          "Bootcamp complete — EVAL Verified badge earned!",
                          { duration: 5000 },
                        );
                      }
                      return result;
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
