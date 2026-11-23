"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardViewer } from "./card-viewer";

interface DueCard {
  id: string;
  front: string;
  back: string;
  deck: { title: string };
}

const RATING_LABELS = [
  {
    value: 1,
    label: "Again",
    color: "text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950",
  },
  {
    value: 2,
    label: "Hard",
    color:
      "text-amber-500 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950",
  },
  {
    value: 3,
    label: "Good",
    color:
      "text-emerald-500 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950",
  },
  {
    value: 4,
    label: "Easy",
    color:
      "text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950",
  },
];

export function ReviewSession() {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    fetch("/api/flashcards/due")
      .then((r) => r.json())
      .then((d) => setCards(d.cards ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [error, setError] = useState<string | null>(null);

  async function handleRate(rating: number) {
    const card = cards[currentIndex];
    if (!card || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, rating }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save review. Try again.");
        return;
      }

      setReviewed((r) => r + 1);

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setCompleted(true);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="py-16 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <h2 className="mb-1 text-lg font-semibold">All caught up!</h2>
        <p className="text-sm text-muted-foreground">No cards due for review right now.</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="py-16 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <h2 className="mb-1 text-lg font-semibold">Session complete!</h2>
        <p className="text-sm text-muted-foreground">
          You reviewed {reviewed} card{reviewed !== 1 ? "s" : ""}.
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Review more
        </Button>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{card.deck.title}</span>
        <span>
          {currentIndex + 1} / {cards.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-400"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <CardViewer front={card.front} back={card.back} />

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Rating buttons */}
      <div className="grid grid-cols-4 gap-2">
        {RATING_LABELS.map((r) => (
          <Button
            key={r.value}
            variant="outline"
            className={`flex-col gap-0.5 py-3 ${r.color}`}
            onClick={() => handleRate(r.value)}
            disabled={submitting}
          >
            <span className="text-xs font-semibold">{r.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
