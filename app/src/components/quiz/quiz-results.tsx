"use client";

import { CheckCircle2, XCircle, Trophy } from "lucide-react";

interface QuizResult {
  question: string;
  type: string;
  userAnswer: unknown;
  correctAnswer: unknown;
  isCorrect: boolean;
}

interface QuizResultsProps {
  score: number;
  correct: number;
  total: number;
  results: QuizResult[];
}

export function QuizResults({ score, correct, total, results }: QuizResultsProps) {
  const scoreColor =
    score >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="rounded-xl border bg-card p-8 text-center">
        <Trophy className={`mx-auto mb-3 h-10 w-10 ${scoreColor}`} />
        <div className={`text-4xl font-bold tabular-nums ${scoreColor}`}>{score}%</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {correct} of {total} correct
        </p>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        {results.map((r, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 ${
              r.isCorrect
                ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
            }`}
          >
            <div className="mb-2 flex items-start gap-2">
              {r.isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              )}
              <p className="text-sm font-medium">{r.question}</p>
            </div>
            <div className="ml-6 space-y-1 text-xs">
              <p>
                <span className="text-muted-foreground">Your answer: </span>
                <span
                  className={
                    r.isCorrect
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {String(r.userAnswer ?? "No answer")}
                </span>
              </p>
              {!r.isCorrect && (
                <p>
                  <span className="text-muted-foreground">Correct: </span>
                  <span className="font-medium">{String(r.correctAnswer)}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
