import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { BookOpen, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashcardDeckList } from "@/components/flashcards/deck-list";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage() {
  const user = await requireSession();

  const decks = await db.flashcardDeck.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  const decksWithDue = await Promise.all(
    decks.map(async (deck) => {
      const dueCount = await db.flashcardCard.count({
        where: { deckId: deck.id, OR: [{ dueDate: { lte: new Date() } }, { reps: 0 }] },
      });
      return { ...deck, dueCount };
    }),
  );

  const totalDue = decksWithDue.reduce((sum, d) => sum + d.dueCount, 0);

  const data = decksWithDue.map((d) => ({
    id: d.id,
    title: d.title,
    cardCount: d._count.cards,
    dueCount: d.dueCount,
    updatedAt: d.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="mt-1 text-muted-foreground">
            {decks.length} deck{decks.length !== 1 ? "s" : ""} · {totalDue} card
            {totalDue !== 1 ? "s" : ""} due
          </p>
        </div>
        {totalDue > 0 && (
          <Button asChild className="gap-1.5">
            <Link href="/review">
              Review {totalDue} due <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <FlashcardDeckList decks={data} />
    </div>
  );
}
