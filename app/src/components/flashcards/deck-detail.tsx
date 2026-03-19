"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateCardModal } from "./create-card-modal";
import { AiGenerateButton } from "./ai-generate-button";

interface CardRow {
  id: string;
  front: string;
  back: string;
  state: number;
  dueDate: string | null;
  reps: number;
  sourceType: string | null;
  createdAt: string;
}

const STATE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "New", color: "bg-muted text-muted-foreground" },
  1: {
    label: "Learning",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  2: {
    label: "Review",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  3: { label: "Relearning", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

export function FlashcardDeckDetail({
  deckId,
  deckTitle,
  cards,
}: {
  deckId: string;
  deckTitle: string;
  cards: CardRow[];
}) {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/flashcards"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All decks
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{deckTitle}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{cards.length} cards</p>
        </div>
        <div className="flex items-center gap-2">
          <AiGenerateButton deckId={deckId} onGenerated={() => router.refresh()} />
          <CreateCardModal deckId={deckId} onCreated={() => router.refresh()} />
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border bg-card py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-muted-foreground">No cards yet. Add manually or generate with AI.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => {
            const stateInfo = STATE_LABELS[card.state] ?? STATE_LABELS[0];
            return (
              <div key={card.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className={`text-[10px] ${stateInfo.color}`}>{stateInfo.label}</Badge>
                  {card.sourceType && (
                    <span className="text-[10px] text-muted-foreground">{card.sourceType}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{card.reps} reviews</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Front</p>
                    <p className="mt-0.5 text-sm">{card.front}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Back</p>
                    <p className="mt-0.5 text-sm">{card.back}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
