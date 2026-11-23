import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { scheduleCard } from "@/lib/flashcards/fsrs";
import { z } from "zod";

const reviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.number().int().min(1).max(4), // 1=Again, 2=Hard, 3=Good, 4=Easy
});

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify card ownership via deck
  const card = await db.flashcardCard.findFirst({
    where: { id: parsed.data.cardId, deck: { userId: user.id } },
  });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  // Run FSRS scheduling
  const updated = scheduleCard(
    {
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: card.elapsedDays,
      scheduledDays: card.scheduledDays,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      learningSteps: card.learningSteps,
      lastReview: card.lastReview,
      dueDate: card.dueDate,
    },
    parsed.data.rating,
  );

  // Update card + log review in a transaction
  const [updatedCard] = await db.$transaction([
    db.flashcardCard.update({
      where: { id: parsed.data.cardId },
      data: updated,
    }),
    db.flashcardReview.create({
      data: {
        cardId: parsed.data.cardId,
        userId: user.id,
        rating: parsed.data.rating,
      },
    }),
  ]);

  return NextResponse.json(updatedCard);
}
