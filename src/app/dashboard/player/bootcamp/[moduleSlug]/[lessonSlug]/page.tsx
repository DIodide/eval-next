"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VideoPlayer } from "@/components/bootcamp/VideoPlayer";
import { QuizComponent } from "@/components/bootcamp/QuizComponent";
import { ReflectionForm } from "@/components/bootcamp/ReflectionForm";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

export default function LessonPage() {
  const params = useParams<{ moduleSlug: string; lessonSlug: string }>();

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

  const { data: bootcampProgress, refetch: refetchBootcampProgress } =
    api.bootcamp.getBootcampProgress.useQuery({
      bootcampSlug: "recruit-bootcamp",
    });

  const markWatched = api.bootcamp.markVideoWatched.useMutation({
    onSuccess: () => {
      void refetchProgress();
      toast.success("Video marked as watched!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const submitQuiz = api.bootcamp.submitQuiz.useMutation();

  const submitReflection = api.bootcamp.submitReflection.useMutation({
    onSuccess: () => {
      void refetchProgress();
      void refetchBootcampProgress();
      toast.success("Reflection submitted!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

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
        <p className="text-gray-400">Lesson not found.</p>
      </div>
    );
  }

  const commonQuestions = lesson.commonQuestions as
    | { question: string; answer: string }[]
    | null;

  // Find next lesson in the bootcamp
  const findNextLesson = () => {
    if (!bootcampProgress) return null;
    const modules = bootcampProgress.modules;
    const currentModIndex = modules.findIndex(
      (m) => m.slug === params.moduleSlug,
    );
    if (currentModIndex === -1) return null;
    const currentMod = modules[currentModIndex]!;
    const currentLessonIndex = currentMod.lessons.findIndex(
      (l) => l.slug === params.lessonSlug,
    );

    // Next lesson in same module
    if (currentLessonIndex < currentMod.lessons.length - 1) {
      const nextLesson = currentMod.lessons[currentLessonIndex + 1]!;
      return {
        moduleSlug: currentMod.slug,
        lessonSlug: nextLesson.slug,
        title: nextLesson.title,
      };
    }

    // First lesson of next module
    if (currentModIndex < modules.length - 1) {
      const nextMod = modules[currentModIndex + 1]!;
      if (nextMod.lessons.length > 0) {
        return {
          moduleSlug: nextMod.slug,
          lessonSlug: nextMod.lessons[0]!.slug,
          title: `Step ${nextMod.order_index}: ${nextMod.title}`,
        };
      }
    }

    return null; // Last lesson in bootcamp
  };

  const nextLesson = findNextLesson();
  const isLessonComplete = progress?.completed ?? false;

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
        <span>Step {lesson.module.orderIndex}</span>
        <span>/</span>
        <span className="text-white">{lesson.title}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-gray-500">
            Step {lesson.module.orderIndex}
          </span>
          {lesson.module.isFree && (
            <Badge
              variant="outline"
              className="border-green-500/50 text-xs text-green-400"
            >
              Free
            </Badge>
          )}
          {isLessonComplete && (
            <Badge
              variant="outline"
              className="border-green-500/50 text-xs text-green-400"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Complete
            </Badge>
          )}
        </div>
        <h1 className="mt-1 font-orbitron text-2xl font-bold text-white">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-2 text-gray-400">{lesson.description}</p>
        )}
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <VideoPlayer
          videoUrl={lesson.videoUrl}
          isWatched={progress?.videoWatched ?? false}
          isLoading={markWatched.isPending}
          onWatched={() => {
            markWatched.mutate({ lessonId: lesson.id });
          }}
        />
      )}

      {/* Lesson Content */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div
          className="text-gray-300 leading-relaxed [&>h1]:mb-4 [&>h1]:mt-6 [&>h1]:font-orbitron [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h2]:mb-3 [&>h2]:mt-5 [&>h2]:font-rajdhani [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-white [&>h3]:mb-2 [&>h3]:mt-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-white [&>hr]:my-6 [&>hr]:border-white/10 [&>ol]:my-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:my-2 [&>ul]:my-3 [&>ul]:list-disc [&>ul]:pl-6"
          dangerouslySetInnerHTML={{
            __html: lesson.contentMarkdown
              .replace(/^### (.+)$/gm, "<h3>$1</h3>")
              .replace(/^## (.+)$/gm, "<h2>$1</h2>")
              .replace(/^# (.+)$/gm, "<h1>$1</h1>")
              .replace(/^---$/gm, "<hr>")
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
              .replace(/^- (.+)$/gm, "<li>$1</li>")
              .replace(/\n\n/g, "<br><br>"),
          }}
        />
      </div>

      {/* Common Questions */}
      {commonQuestions && commonQuestions.length > 0 && (
        <div>
          <h2 className="mb-4 font-rajdhani text-xl font-semibold text-white">
            Common Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {commonQuestions.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-lg border border-white/10 bg-white/5 px-4"
              >
                <AccordionTrigger className="text-left text-sm text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Written Reflection (Step 1 only) */}
      {lesson.requiresReflection && (progress?.videoWatched ?? false) && (
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

      {/* Quiz (appears after video is watched) */}
      {lesson.quiz && (progress?.videoWatched ?? false) && (
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
            void refetchBootcampProgress();

            if (result.bootcampComplete) {
              toast.success(
                "Bootcamp Complete! You've earned the EVAL Verified badge!",
                { duration: 5000 },
              );
            }

            return result;
          }}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <Link
          href="/dashboard/player/bootcamp"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>

        {isLessonComplete && nextLesson && (
          <Link
            href={`/dashboard/player/bootcamp/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
          >
            <Button className="bg-blue-600 hover:bg-blue-700">
              Next: {nextLesson.title}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}

        {isLessonComplete && !nextLesson && (
          <div className="flex items-center gap-2 text-green-400">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Bootcamp Complete!</span>
          </div>
        )}
      </div>
    </div>
  );
}
