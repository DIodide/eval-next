"use client";

import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
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
import { ArrowRight, ArrowLeft, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function Step0Page() {
  const { isSignedIn } = useUser();

  const { data: lesson, isLoading } = api.bootcamp.getLesson.useQuery({
    bootcampSlug: "recruit-bootcamp",
    moduleSlug: "step-0-welcome",
    lessonSlug: "welcome-and-why-eval-exists",
  });

  const { data: progress, refetch: refetchProgress } =
    api.bootcamp.getLessonProgress.useQuery(
      { lessonId: lesson?.id ?? "" },
      { enabled: !!lesson?.id && !!isSignedIn },
    );

  const markWatched = api.bootcamp.markVideoWatched.useMutation({
    onSuccess: () => {
      void refetchProgress();
      toast.success("Video marked as watched!");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to mark video as watched.");
    },
  });

  const submitQuiz = api.bootcamp.submitQuiz.useMutation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Lesson not found.</p>
      </div>
    );
  }

  const commonQuestions = lesson.commonQuestions as
    | { question: string; answer: string }[]
    | null;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/bootcamp" className="hover:text-white">
            Bootcamp
          </Link>
          <span>/</span>
          <span className="text-white">Step 0</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge
            variant="outline"
            className="mb-2 border-green-500/50 text-green-400"
          >
            Free
          </Badge>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            {lesson.title}
          </h1>
          <p className="mt-2 text-gray-400">{lesson.description}</p>
        </div>

        {/* Video */}
        {lesson.videoUrl && (
          <div className="mb-8">
            <VideoPlayer
              videoUrl={lesson.videoUrl}
              isWatched={progress?.videoWatched ?? false}
              isLoading={markWatched.isPending}
              onWatched={() => {
                if (isSignedIn && lesson.id) {
                  markWatched.mutate({ lessonId: lesson.id });
                } else {
                  toast.info("Sign in to save your progress.");
                }
              }}
            />
          </div>
        )}

        {/* Lesson Content */}
        <div className="prose prose-invert mb-8 max-w-none">
          <div
            className="text-gray-300 [&>h1]:font-orbitron [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h2]:font-rajdhani [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-white [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6"
            dangerouslySetInnerHTML={{
              __html: lesson.contentMarkdown
                .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\n\n/g, "</p><p>")
                .replace(/^(?!<[hlo])/gm, "<p>")
                .replace(/(?<![>])$/gm, "</p>"),
            }}
          />
        </div>

        {/* Common Questions */}
        {commonQuestions && commonQuestions.length > 0 && (
          <div className="mb-8">
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

        {/* Quiz */}
        {lesson.quiz && (progress?.videoWatched ?? !isSignedIn) && (
          <div className="mb-8">
            <QuizComponent
              title={lesson.quiz.title}
              questions={lesson.quiz.questions}
              passingScore={lesson.quiz.passingScore}
              alreadyPassed={progress?.quizPassed ?? false}
              previousScore={progress?.quizScore}
              previousAttempts={progress?.quizAttempts}
              onSubmit={async (answers) => {
                if (!isSignedIn) {
                  toast.info("Sign in to save your quiz results.");
                  // Still grade locally for demo
                  return {
                    passed: false,
                    score: 0,
                    total: lesson.quiz!.totalQuestions,
                    correctAnswers: [],
                  };
                }
                const result = await submitQuiz.mutateAsync({
                  lessonId: lesson.id,
                  answers,
                });
                void refetchProgress();
                return result;
              }}
            />
          </div>
        )}

        {/* Next Step CTA */}
        {progress?.quizPassed && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 text-green-400" />
            <h3 className="font-rajdhani text-lg font-semibold text-white">
              Step 0 Complete!
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Continue to Step 1 to define your &ldquo;why&rdquo; and build your foundation.
            </p>
            <Link href="/dashboard/player/bootcamp">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {!isSignedIn && (
          <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
            <h3 className="font-rajdhani text-lg font-semibold text-white">
              Create your free account to save progress
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Sign up to track your progress and continue to Step 1.
            </p>
            <div className="mt-4 flex justify-center gap-3">
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
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/bootcamp"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bootcamp Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
