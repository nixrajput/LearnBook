"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/quiz-card";
import { QuizResults } from "@/components/quiz/quiz-results";

interface QuizQuestion {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: unknown;
}

interface QuizResult {
  question: string;
  type: string;
  userAnswer: unknown;
  correctAnswer: unknown;
  isCorrect: boolean;
}

export default function QuizPage() {
  const params = useParams<{ chapterId: string }>();
  const chapterId = params.chapterId;

  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correct: number;
    total: number;
    results: QuizResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateQuiz(forceRegenerate = false) {
    setGenerating(true);
    setError(null);
    setResults(null);
    setAnswers({});
    setCurrentIndex(0);
    setQuizId(null);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, questionCount: 5, forceRegenerate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to generate quiz");
        return;
      }
      const quiz = await res.json();
      setQuizId(quiz.id);
      try {
        const q = typeof quiz.questions === "string" ? JSON.parse(quiz.questions) : quiz.questions;
        setQuestions(q);
      } catch {
        setError("Invalid quiz format");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function submitQuiz() {
    if (!quizId) return;
    setSubmitting(true);
    setError(null);

    const answerArray = questions.map((_, i) => answers[i] ?? null);

    try {
      const res = await fetch(`/api/ai/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArray }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to submit");
        return;
      }
      const data = await res.json();
      setResults(data);
    } finally {
      setSubmitting(false);
    }
  }

  // Auto-generate on mount
  useEffect(() => {
    if (chapterId) generateQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  if (generating) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-500" />
        <h2 className="text-lg font-semibold">Generating quiz...</h2>
        <p className="text-sm text-muted-foreground">AI is creating questions from the chapter</p>
      </div>
    );
  }

  if (results) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Quiz Results</h1>
        <QuizResults {...results} />
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => generateQuiz(true)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        {error ? (
          <>
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={() => generateQuiz()}>Retry</Button>
          </>
        ) : (
          <p className="text-muted-foreground">No quiz available</p>
        )}
      </div>
    );
  }

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Chapter Quiz</h1>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-400"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <QuizCard
        question={questions[currentIndex]}
        index={currentIndex}
        total={questions.length}
        answer={answers[currentIndex]}
        onAnswer={(a) => setAnswers((prev) => ({ ...prev, [currentIndex]: a }))}
      />

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={answers[currentIndex] === undefined}
            className="gap-1.5"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submitQuiz} disabled={!allAnswered || submitting} className="gap-1.5">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
