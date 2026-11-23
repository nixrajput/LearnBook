"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeckItem {
  id: string;
  title: string;
  cardCount: number;
  dueCount: number;
  updatedAt: string;
}

export function FlashcardDeckList({ decks }: { decks: DeckItem[] }) {
  if (decks.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-muted-foreground">No flashcard decks yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map((deck) => (
        <Link
          key={deck.id}
          href={`/flashcards/${deck.id}`}
          className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all duration-200 hover:border-indigo-500/30 hover:shadow-md"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {deck.title}
              </h3>
              {deck.dueCount > 0 && (
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {deck.dueCount} due
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
