import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { generateFlashcards } from "@/lib/flashcards/generator";
import { newCardFields } from "@/lib/flashcards/fsrs";
import { z } from "zod";

const generateSchema = z.object({
  deckId: z.string().min(1),
  chapterId: z.string().optional(),
  highlightText: z.string().optional(),
  noteContent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify deck ownership
  const deck = await db.flashcardDeck.findFirst({
    where: { id: parsed.data.deckId, userId: user.id },
  });
  if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  // Determine content source BEFORE reserving credits
  let content = "";
  let chapterId = parsed.data.chapterId ?? null;
  let courseId: string | null = null;

  if (parsed.data.highlightText) {
    content = parsed.data.highlightText;
  } else if (parsed.data.noteContent) {
    content = parsed.data.noteContent;
  } else if (parsed.data.chapterId) {
    const chapter = await db.chapter.findUnique({
      where: { id: parsed.data.chapterId },
      select: { rawContent: true, courseId: true },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    content = chapter.rawContent;
    courseId = chapter.courseId;
  }

  if (!content) {
    return NextResponse.json({ error: "No content provided for generation" }, { status: 400 });
  }

  // Reserve credits only after all validation passes
  await getOrCreateBalance(user.id, user.plan ?? "FREE");
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  const resolvedModel = await getAiModel(user.id, user.plan ?? "FREE", "flashcard");

  try {
    const { cards, inputTokens, outputTokens } = await generateFlashcards(content, resolvedModel);

    // Reconcile credits with actual usage
    await reconcileCredits(
      user.id,
      "flashcard",
      resolvedModel.def.provider,
      resolvedModel.def.id,
      inputTokens,
      outputTokens,
      resolvedModel.def.multiplier,
      2,
      courseId ?? undefined,
      chapterId ?? undefined,
    );

    // Create cards in DB
    const fsrsFields = newCardFields();
    const created = await Promise.all(
      cards.map((c) =>
        db.flashcardCard.create({
          data: {
            deckId: parsed.data.deckId,
            front: c.front,
            back: c.back,
            sourceType: "ai_generated",
            chapterId,
            ...fsrsFields,
          },
        }),
      ),
    );

    return NextResponse.json({ cards: created, count: created.length }, { status: 201 });
  } catch {
    // Refund reserved credits on AI failure
    await db.aiCreditBalance
      .update({
        where: { userId: user.id },
        data: { credits: { increment: 2 } },
      })
      .catch(() => {});
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
