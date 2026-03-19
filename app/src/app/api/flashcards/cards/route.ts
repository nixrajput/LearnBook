import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { newCardFields } from "@/lib/flashcards/fsrs";
import { z } from "zod";

const createCardSchema = z.object({
  deckId: z.string().min(1),
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
  sourceType: z.enum(["highlight", "note", "ai_generated", "manual"]).optional(),
  sourceId: z.string().optional(),
  chapterId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deckId = req.nextUrl.searchParams.get("deckId");
  if (!deckId) return NextResponse.json({ error: "deckId required" }, { status: 400 });

  // Verify deck ownership
  const deck = await db.flashcardDeck.findFirst({ where: { id: deckId, userId: user.id } });
  if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  const cards = await db.flashcardCard.findMany({
    where: { deckId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createCardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify deck ownership
  const deck = await db.flashcardDeck.findFirst({
    where: { id: parsed.data.deckId, userId: user.id },
  });
  if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  // Plan limit: FREE = 100 cards total
  if (user.plan === "FREE") {
    const totalCards = await db.flashcardCard.count({
      where: { deck: { userId: user.id } },
    });
    if (totalCards >= 100) {
      return NextResponse.json(
        { error: "Free plan limited to 100 cards. Upgrade for unlimited." },
        { status: 403 },
      );
    }
  }

  const fsrsFields = newCardFields();

  const card = await db.flashcardCard.create({
    data: {
      deckId: parsed.data.deckId,
      front: parsed.data.front,
      back: parsed.data.back,
      sourceType: parsed.data.sourceType ?? "manual",
      sourceId: parsed.data.sourceId ?? null,
      chapterId: parsed.data.chapterId ?? null,
      ...fsrsFields,
    },
  });

  return NextResponse.json(card, { status: 201 });
}
