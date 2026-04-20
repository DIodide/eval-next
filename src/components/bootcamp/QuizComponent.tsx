"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, RotateCcw } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizResult {
  passed: boolean;
  score: number;
  total: number;
  correctAnswers: number[];
}

interface QuizComponentProps {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  onSubmit: (answers: number[]) => Promise<QuizResult>;
  alreadyPassed: boolean;
  previousScore?: number | null;
  previousAttempts?: number;
}

export function QuizComponent({
  title,
  questions,
  passingScore,
  onSubmit,
  alreadyPassed,
  previousScore,
  previousAttempts,
}: QuizComponentProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null),
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAnswered = selectedAnswers.every((a) => a !== null);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (result) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setIsSubmitting(true);
    try {
      const quizResult = await onSubmit(
        selectedAnswers.filter((a): a is number => a !== null),
      );
      setResult(quizResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedAnswers(new Array(questions.length).fill(null));
  };

  if (alreadyPassed && !result) {
    return (
      <div className="border border-white/[0.08] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center border border-white/20 bg-white text-black">
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-rajdhani text-sm font-semibold text-white/60">
              Quiz Passed
            </div>
            <div className="font-mono text-[10px] text-white/25">
              {previousScore}/{questions.length} correct
              {previousAttempts
                ? ` / ${previousAttempts} attempt${previousAttempts > 1 ? "s" : ""}`
                : ""}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-white/25">
          Quiz
        </h3>
        <div className="mt-1 font-rajdhani text-lg font-semibold text-white">
          {title}
        </div>
        <p className="mt-1 font-mono text-[11px] text-white/25">
          All {questions.length} answers must be correct to pass
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q, qi) => (
          <div key={qi}>
            <div className="mb-3 text-[14px] font-medium text-white/70">
              <span className="mr-2 font-mono text-[11px] text-white/25">
                {String(qi + 1).padStart(2, "0")}
              </span>
              {q.question}
            </div>
            <div className="space-y-1">
              {q.options.map((option, oi) => {
                const isSelected = selectedAnswers[qi] === oi;
                const showResult = result !== null;
                const isCorrect = showResult && result.correctAnswers[qi] === oi;
                const isWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    disabled={!!result}
                    className={cn(
                      "flex w-full items-center gap-3 border px-4 py-3 text-left text-[13px] transition-all",
                      result
                        ? "cursor-default"
                        : "cursor-pointer hover:border-white/15 hover:bg-white/[0.02]",
                      isCorrect
                        ? "border-white/20 bg-white/[0.05] text-white"
                        : isWrong
                          ? "border-red-500/30 bg-red-500/[0.05] text-red-400/80"
                          : isSelected && !showResult
                            ? "border-white/20 bg-white/[0.04] text-white"
                            : "border-white/[0.06] text-white/45",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[9px]",
                        isCorrect
                          ? "border-white/30 bg-white text-black"
                          : isWrong
                            ? "border-red-500/40 text-red-400"
                            : isSelected && !showResult
                              ? "border-white/30 text-white"
                              : "border-white/10 text-white/25",
                      )}
                    >
                      {isCorrect ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      ) : isWrong ? (
                        <X className="h-2.5 w-2.5" strokeWidth={3} />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div
          className={cn(
            "mt-8 border p-5",
            result.passed
              ? "border-white/[0.08]"
              : "border-red-500/20 bg-red-500/[0.03]",
          )}
        >
          {result.passed ? (
            <div>
              <div className="font-rajdhani text-sm font-semibold text-white">
                Quiz Passed
              </div>
              <div className="mt-1 font-mono text-[11px] text-white/30">
                {result.score}/{result.total} correct
              </div>
            </div>
          ) : (
            <div>
              <div className="font-rajdhani text-sm font-semibold text-red-400/80">
                Not quite
              </div>
              <div className="mt-1 font-mono text-[11px] text-white/30">
                {result.score}/{result.total} correct — all {result.total} required
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="border border-white/20 bg-white px-5 py-2.5 font-rajdhani text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isSubmitting ? "Checking..." : "Submit"}
          </button>
        )}
        {result && !result.passed && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 border border-white/10 px-4 py-2.5 font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
