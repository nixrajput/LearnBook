import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { FlashcardDeckDetail } from "@/components/flashcards/deck-detail";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckDetailPage({ params }: PageProps) {
  const user = await requireSession();
  const { deckId } = await params;

  const deck = await db.flashcardDeck.findFirst({
    where: { id: deckId, userId: user.id },
  });
  if (!deck) notFound();

  const cards = await db.flashcardCard.findMany({
    where: { deckId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      front: true,
      back: true,
      state: true,
      dueDate: true,
      reps: true,
      sourceType: true,
      createdAt: true,
    },
  });

  const data = cards.map((c) => ({
    ...c,
    dueDate: c.dueDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return <FlashcardDeckDetail deckId={deckId} deckTitle={deck.title} cards={data} />;
}
