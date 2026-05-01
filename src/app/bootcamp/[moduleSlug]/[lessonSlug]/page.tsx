"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import {
  VideoPlayer,
  type BootcampVideoPlayerHandle,
} from "@/components/bootcamp/VideoPlayer";
import { QuizComponent } from "@/components/bootcamp/QuizComponent";
import { useUser, SignUpButton } from "@clerk/nextjs";
import {
  ArrowRight,
  ChevronDown,
  Lock,
  Sparkles,
  Check,
} from "lucide-react";

interface QuizQ {
  question: string;
  options: string[];
  correct_index: number;
}

interface CommonQ {
  question: string;
  answer: string;
}

const FIVE_OUTCOMES = [
  "Define the standard you hold yourself to",
  "Get clarity on the direction you're moving in",
  "Understand what coaches actually value",
  "Build the foundation that sustains effort over time",
];

function renderMarkdownLite(markdown: string) {
  // Tiny renderer: handles #/##/### headings, bullet lists, numbered lists,
  // and paragraph breaks. Good enough for the bootcamp lesson copy.
  const blocks = markdown.split(/\n\n+/);
  return blocks.map((block, i) => {
    const lines = block.split("\n");
    const first = lines[0] ?? "";
    if (first.startsWith("# ")) {
      return (
        <h2
          key={i}
          className="font-orbitron mt-12 mb-4 text-2xl font-black text-white md:text-3xl"
        >
          {first.slice(2)}
        </h2>
      );
    }
    if (first.startsWith("## ")) {
      return (
        <h3
          key={i}
          className="font-orbitron mt-10 mb-3 text-xl font-bold text-white"
        >
          {first.slice(3)}
        </h3>
      );
    }
    if (first.startsWith("- ")) {
      return (
        <ul key={i} className="my-4 space-y-1.5 pl-1">
          {lines.map((l, j) => (
            <li
              key={j}
              className="font-rajdhani flex items-start gap-3 text-[17px] leading-relaxed text-white/75"
            >
              <span className="mt-2.5 h-1 w-3 flex-shrink-0 bg-cyan-400/70" />
              <span>{l.replace(/^- /, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(first)) {
      return (
        <ol key={i} className="my-4 space-y-2 pl-1">
          {lines.map((l, j) => {
            const m = /^(\d+)\.\s(.*)$/.exec(l);
            return (
              <li
                key={j}
                className="font-rajdhani flex items-start gap-3 text-[17px] leading-relaxed text-white/75"
              >
                <span className="font-orbitron mt-0.5 inline-block w-6 flex-shrink-0 text-sm font-bold text-cyan-300">
                  {String(m?.[1] ?? j + 1).padStart(2, "0")}
                </span>
                <span>{m?.[2] ?? l}</span>
              </li>
            );
          })}
        </ol>
      );
    }
    return (
      <p
        key={i}
        className="font-rajdhani my-4 text-[17px] leading-relaxed text-white/75"
      >
        {block}
      </p>
    );
  });
}

export default function PublicBootcampLessonPage() {
  const params = useParams<{ moduleSlug: string; lessonSlug: string }>();
  const { isSignedIn } = useUser();
  const playerRef = useRef<BootcampVideoPlayerHandle>(null);

  const { data: lesson, isLoading } =
    api.bootcamp.getPublicStepOneLesson.useQuery({
      moduleSlug: params.moduleSlug,
      lessonSlug: params.lessonSlug,
    });

  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [reflection, setReflection] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const quizQuestions = useMemo<QuizQ[]>(() => {
    if (!lesson?.quiz) return [];
    return (lesson.quiz.questions as unknown as QuizQ[]) ?? [];
  }, [lesson]);

  const commonQuestions = useMemo<CommonQ[]>(() => {
    if (!lesson?.commonQuestions) return [];
    return (lesson.commonQuestions as unknown as CommonQ[]) ?? [];
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#070416]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#070416] px-6 text-center">
        <p className="font-orbitron text-sm tracking-[0.3em] text-white/40 uppercase">
          Lesson not in the free preview
        </p>
        <p className="font-rajdhani max-w-md text-white/60">
          Only the first step of the EVAL+ Bootcamp is available without an
          account. Sign up free to continue.
        </p>
        <Link
          href="/pricing?from=bootcamp"
          className="font-orbitron mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-2 text-xs font-bold tracking-[0.2em] text-cyan-200 hover:bg-cyan-400/20"
        >
          See pricing <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const stepNumber = lesson.module.orderIndex + 1;

  return (
    <div className="min-h-screen bg-[#070416] text-white">
      {/* Top free-preview ribbon */}
      <div className="relative overflow-hidden border-b border-cyan-400/15 bg-black/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0 22px, rgba(34,211,238,0.95) 22px 24px, transparent 24px 46px, rgba(167,139,250,0.95) 46px 48px)",
          }}
        />
        <div className="relative container mx-auto flex flex-col items-start justify-between gap-3 px-6 py-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
            </span>
            <span className="font-orbitron text-[10px] font-bold tracking-[0.3em] text-cyan-300/90">
              FREE PREVIEW · STEP {stepNumber}
            </span>
          </div>
          <Link
            href="/pricing?from=bootcamp"
            className="font-rajdhani text-xs text-white/60 transition-colors hover:text-white"
          >
            Unlock all 5 steps →
          </Link>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Hero */}
        <header className="mb-12 grid gap-10 md:mb-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <p className="font-orbitron text-[11px] font-bold tracking-[0.4em] text-cyan-300/80 uppercase">
              EVAL+ Bootcamp · Step {stepNumber} of 5
            </p>
            <h1 className="font-orbitron mt-4 text-4xl leading-[1.05] font-black text-white md:text-6xl">
              {lesson.title.replace(/"/g, "“")}
            </h1>
            <p className="font-rajdhani mt-5 max-w-xl text-lg text-white/70">
              {lesson.description ?? lesson.module.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="font-mono inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] tracking-widest text-white/50 uppercase">
                <Sparkles className="h-3 w-3 text-cyan-300" />
                Free · No account needed
              </span>
              {lesson.durationSeconds && (
                <span className="font-mono inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] tracking-widest text-white/50 uppercase">
                  ~{Math.round(lesson.durationSeconds / 60)} min watch
                </span>
              )}
            </div>
          </div>

          {/* Outcomes card */}
          <aside className="md:col-span-5">
            <div className="relative overflow-hidden rounded-sm border border-white/10 bg-white/[0.02] p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-px right-0 left-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/70 to-cyan-400/0"
              />
              <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-300/70 uppercase">
                What you walk away with
              </p>
              <ul className="mt-4 space-y-3">
                {FIVE_OUTCOMES.map((o, i) => (
                  <li
                    key={i}
                    className="font-rajdhani flex items-start gap-3 text-sm text-white/75"
                  >
                    <span className="font-orbitron mt-0.5 inline-block w-6 flex-shrink-0 text-xs font-bold text-cyan-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </header>

        {/* Video */}
        {lesson.videoUrl && (
          <section className="mb-14 md:mb-20">
            <p className="font-mono mb-3 text-[10px] tracking-[0.3em] text-white/30 uppercase">
              ▌ Video lesson
            </p>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1 -z-10 rounded-md bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-orange-500/15 blur-xl"
              />
              <VideoPlayer
                ref={playerRef}
                videoUrl={lesson.videoUrl}
                hlsUrl={lesson.videoHlsUrl}
                posterUrl={lesson.posterUrl}
                captionUrl={lesson.transcriptVttUrl}
                durationSeconds={lesson.durationSeconds}
                lastPositionSeconds={null}
                isWatched={false}
                isLoading={false}
                onWatched={() => {
                  /* noop for guests */
                }}
                onTimeUpdate={() => {
                  /* noop */
                }}
                onSavePosition={() => {
                  /* noop */
                }}
              />
            </div>
          </section>
        )}

        {/* Lesson content */}
        <section className="mb-14 md:mb-20">
          <p className="font-mono mb-4 text-[10px] tracking-[0.3em] text-white/30 uppercase">
            ▌ The lesson
          </p>
          <article className="max-w-3xl border-l border-white/[0.08] pl-6 md:pl-10">
            {renderMarkdownLite(lesson.contentMarkdown)}
          </article>
        </section>

        {/* Common Questions */}
        {commonQuestions.length > 0 && (
          <section className="mb-14 md:mb-20">
            <p className="font-mono mb-4 text-[10px] tracking-[0.3em] text-white/30 uppercase">
              ▌ Common questions
            </p>
            <div className="max-w-3xl divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {commonQuestions.map((q, i) => {
                const open = openQuestion === i;
                return (
                  <button
                    key={i}
                    onClick={() => setOpenQuestion(open ? null : i)}
                    className="block w-full py-5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <span className="font-rajdhani text-base font-semibold text-white">
                        {q.question}
                      </span>
                      <ChevronDown
                        className={`mt-1 h-4 w-4 flex-shrink-0 text-white/40 transition-transform duration-300 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <div
                      className={`grid overflow-hidden transition-all duration-500 ${
                        open
                          ? "mt-3 grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0">
                        <p className="font-rajdhani text-[15px] leading-relaxed text-white/60">
                          {q.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Reflection */}
        {lesson.requiresReflection && (
          <section className="mb-14 md:mb-20">
            <p className="font-mono mb-4 text-[10px] tracking-[0.3em] text-white/30 uppercase">
              ▌ Your reflection
            </p>
            <div className="max-w-3xl rounded-sm border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <h3 className="font-orbitron text-lg font-bold text-white">
                What is your why?
              </h3>
              <p className="font-rajdhani mt-1 text-sm text-white/55">
                3-5 sentences. Be specific and personal.
              </p>
              <textarea
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  setReflectionSaved(false);
                }}
                rows={6}
                placeholder="Type your reflection here…"
                className="font-rajdhani mt-4 block w-full resize-y border border-white/10 bg-black/30 p-4 text-[15px] text-white placeholder-white/25 focus:border-cyan-400/50 focus:outline-none"
              />
              <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="font-rajdhani text-xs text-white/45">
                  {isSignedIn
                    ? "Sign in took you to the dashboard — finish your reflection there to save it to your profile."
                    : "Drafting locally. Create a free account to save it to your EVAL profile."}
                </p>
                {!isSignedIn && reflection.trim().length > 0 && (
                  <SignUpButton mode="modal" unsafeMetadata={{ userType: "player" }}>
                    <button
                      onClick={() => setReflectionSaved(true)}
                      className="font-orbitron inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-2 text-xs font-bold tracking-[0.18em] text-cyan-200 transition-all hover:bg-cyan-400/20"
                    >
                      {reflectionSaved ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Saved locally · Sign up
                        </>
                      ) : (
                        <>
                          Save & sign up <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </SignUpButton>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Quiz */}
        {quizQuestions.length > 0 && (
          <section className="mb-14 md:mb-20">
            <p className="font-mono mb-4 text-[10px] tracking-[0.3em] text-white/30 uppercase">
              ▌ Quick check
            </p>
            <div className="max-w-3xl rounded-sm border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <QuizComponent
                title={lesson.quiz?.title ?? "Step 1 Quiz"}
                questions={quizQuestions.map((q) => ({
                  question: q.question,
                  options: q.options,
                }))}
                passingScore={
                  lesson.quiz?.passing_score ?? quizQuestions.length
                }
                onSubmit={async (answers) => {
                  let score = 0;
                  for (let i = 0; i < quizQuestions.length; i++) {
                    if (quizQuestions[i]!.correct_index === answers[i]) score++;
                  }
                  return {
                    passed: score === quizQuestions.length,
                    score,
                    total: quizQuestions.length,
                    correctAnswers: quizQuestions.map((q) => q.correct_index),
                  };
                }}
                alreadyPassed={false}
              />
              <p className="font-rajdhani mt-6 text-xs text-white/45">
                Heads up — your score isn&apos;t saved without an account.
              </p>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="relative mt-20 overflow-hidden rounded-sm border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-orange-500/10 p-8 md:mt-28 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, transparent 0 24px, rgba(34,211,238,0.95) 24px 26px, transparent 26px 52px, rgba(167,139,250,0.95) 52px 54px)",
            }}
          />
          <div className="relative grid items-center gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="font-orbitron text-[11px] font-bold tracking-[0.35em] text-cyan-300/80 uppercase">
                Step {stepNumber + 1} · Build Your College List
              </p>
              <h2 className="font-orbitron mt-3 text-3xl leading-tight font-black text-white md:text-4xl">
                Keep going. Step {stepNumber + 1} unlocks with EVAL+.
              </h2>
              <p className="font-rajdhani mt-3 max-w-xl text-white/70">
                Build a ranked college list, get your profile coach-ready, and
                practice outreach — the same playbook that placed players at
                Princeton, Boise State, and Maryville.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
              {!isSignedIn ? (
                <SignUpButton mode="modal" unsafeMetadata={{ userType: "player" }}>
                  <button className="font-orbitron group inline-flex items-center gap-2 bg-white px-6 py-4 text-xs font-bold tracking-[0.2em] text-black uppercase transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]">
                    Create free account
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </SignUpButton>
              ) : (
                <Link
                  href="/dashboard/player/bootcamp"
                  className="font-orbitron group inline-flex items-center gap-2 bg-white px-6 py-4 text-xs font-bold tracking-[0.2em] text-black uppercase transition-all hover:scale-[1.02]"
                >
                  Continue in dashboard
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              <Link
                href="/pricing?from=bootcamp"
                className="font-orbitron inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-cyan-200/80 uppercase hover:text-white"
              >
                <Lock className="h-3 w-3" /> See EVAL+ pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
