"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SessionChatProps {
  chapterId: string;
  chapterTitle: string;
}

interface Exchange {
  question: string;
  answer: string | null;
  feedback: string | null;
  score: number | null;
}

export function SessionChat({ chapterId, chapterTitle }: SessionChatProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to start session");
        return;
      }
      const data = await res.json();
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
    } finally {
      setStarting(false);
    }
  }

  async function handleRespond() {
    if (!sessionId || !input.trim() || loading) return;
    const answer = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    // Add the answered exchange optimistically
    setExchanges((prev) => [
      ...prev,
      { question: currentQuestion!, answer, feedback: null, score: null },
    ]);

    try {
      const res = await fetch(`/api/ai/study-session/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to evaluate");
        // Roll back optimistic exchange and restore input
        setExchanges((prev) => prev.slice(0, -1));
        setInput(answer);
        return;
      }
      const data = await res.json();

      // Update last exchange with feedback
      setExchanges((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          feedback: data.feedback,
          score: data.score,
        };
        return updated;
      });

      if (data.isComplete) {
        setCompleted(true);
        setOverallScore(data.overallScore);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data.nextQuestion);
      }
    } finally {
      setLoading(false);
    }
  }

  // Not started
  if (!sessionId) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-xl font-bold">AI Study Session</h2>
        <p className="mb-1 text-sm text-muted-foreground">{chapterTitle}</p>
        <p className="mb-6 text-xs text-muted-foreground">
          The AI tutor will ask questions and evaluate your answers
        </p>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <Button onClick={handleStart} disabled={starting} className="gap-1.5">
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {starting ? "Starting..." : "Start Study Session"}
        </Button>
      </div>
    );
  }

  // Completed
  if (completed) {
    const scoreColor =
      (overallScore ?? 0) >= 80
        ? "text-emerald-600 dark:text-emerald-400"
        : (overallScore ?? 0) >= 50
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
          <h2 className="mb-1 text-xl font-bold">Session Complete!</h2>
          <div className={`text-3xl font-bold tabular-nums ${scoreColor}`}>{overallScore}%</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {exchanges.length} questions answered
          </p>
        </div>
        <div className="space-y-3">
          {exchanges.map((e, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <p className="mb-2 text-sm font-medium">{e.question}</p>
              <p className="mb-1 text-xs text-muted-foreground">Your answer: {e.answer}</p>
              {e.feedback && <p className="text-xs text-muted-foreground">{e.feedback}</p>}
              {e.score !== null && (
                <div
                  className={`mt-1 text-xs font-medium ${e.score >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                >
                  Score: {e.score}%
                </div>
              )}
            </div>
          ))}
        </div>
        <Button onClick={() => window.location.reload()} className="w-full">
          Start New Session
        </Button>
      </div>
    );
  }

  // Active session
  return (
    <div className="space-y-4">
      {/* Past exchanges */}
      {exchanges.map((e, i) => (
        <div key={i} className="space-y-2">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">{e.question}</div>
          <div className="ml-4 rounded-lg bg-indigo-50 p-3 text-sm dark:bg-indigo-950/30">
            {e.answer}
          </div>
          {e.feedback && (
            <div className="ml-4 flex items-start gap-2 rounded-lg border p-3 text-xs text-muted-foreground">
              {(e.score ?? 0) >= 70 ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              )}
              <span>{e.feedback}</span>
            </div>
          )}
        </div>
      ))}

      {/* Current question */}
      {currentQuestion && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">{currentQuestion}</p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Answer input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRespond();
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          disabled={loading}
          className="text-sm"
        />
        <Button type="submit" size="sm" disabled={loading || !input.trim()} className="h-9 px-3">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
