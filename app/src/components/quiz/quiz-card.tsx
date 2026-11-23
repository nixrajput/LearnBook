"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuizQuestion {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: unknown;
}

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  answer: unknown;
  onAnswer: (answer: unknown) => void;
}

export function QuizCard({ question, index, total, answer, onAnswer }: QuizCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {question.type === "multiple_choice"
            ? "Multiple Choice"
            : question.type === "true_false"
              ? "True/False"
              : "Short Answer"}
        </span>
      </div>

      <p className="mb-6 text-lg font-medium leading-relaxed">{question.question}</p>

      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-all duration-200 ${
                answer === option
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : "hover:border-muted-foreground/30 hover:bg-muted/30"
              }`}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <Button
              key={String(val)}
              variant={answer === val ? "default" : "outline"}
              className="flex-1"
              onClick={() => onAnswer(val)}
            >
              {val ? "True" : "False"}
            </Button>
          ))}
        </div>
      )}

      {question.type === "short_answer" && (
        <Input
          value={String(answer ?? "")}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="text-sm"
        />
      )}
    </div>
  );
}
