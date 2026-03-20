"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

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
    if (result) return; // Don't allow changes after submission
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
      const quizResult = await onSubmit(selectedAnswers.filter((a): a is number => a !== null));
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
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="flex items-center gap-3 p-6">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
          <div>
            <p className="font-semibold text-green-400">Quiz Passed</p>
            <p className="text-sm text-gray-400">
              Score: {previousScore}/{questions.length}
              {previousAttempts ? ` (${previousAttempts} attempt${previousAttempts > 1 ? "s" : ""})` : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="font-rajdhani text-xl">{title}</CardTitle>
        <p className="text-sm text-gray-400">
          Answer all questions correctly to pass ({passingScore}/{questions.length} required)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-3">
            <p className="font-medium text-white">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, oi) => {
                const isSelected = selectedAnswers[qi] === oi;
                const showResult = result !== null;
                const isCorrect = showResult && result.correctAnswers[qi] === oi;
                const isWrong =
                  showResult && isSelected && result.correctAnswers[qi] !== oi;

                let borderClass = "border-white/10 hover:border-white/30";
                if (isSelected && !showResult) {
                  borderClass = "border-blue-500/50 bg-blue-500/10";
                } else if (isCorrect) {
                  borderClass = "border-green-500/50 bg-green-500/10";
                } else if (isWrong) {
                  borderClass = "border-red-500/50 bg-red-500/10";
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    disabled={!!result}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${borderClass} ${
                      result ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="text-sm text-gray-200">{option}</span>
                    {isCorrect && (
                      <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-green-400" />
                    )}
                    {isWrong && (
                      <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Result display */}
        {result && (
          <div
            className={`rounded-lg border p-4 ${
              result.passed
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            {result.passed ? (
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">
                    Quiz Passed!
                  </p>
                  <p className="text-sm text-gray-400">
                    {result.score}/{result.total} correct
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-400" />
                <div>
                  <p className="font-semibold text-red-400">Not quite!</p>
                  <p className="text-sm text-gray-400">
                    {result.score}/{result.total} correct — you need {result.total}/{result.total}. Review the correct answers and try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!result && (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Answers"}
            </Button>
          )}
          {result && !result.passed && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border-white/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
