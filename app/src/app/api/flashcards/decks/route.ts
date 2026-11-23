import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const createDeckSchema = z.object({
  title: z.string().min(1).max(200),
  courseId: z.string().optional(),
});

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decks = await db.flashcardDeck.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { cards: true } },
    },
  });

  // Add due count per deck
  const result = await Promise.all(
    decks.map(async (deck) => {
      const dueCount = await db.flashcardCard.count({
        where: {
          deckId: deck.id,
          OR: [{ dueDate: { lte: new Date() } }, { reps: 0 }],
        },
      });
      return { ...deck, dueCount };
    }),
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Plan limit: FREE = 3 decks max
  if (user.plan === "FREE") {
    const deckCount = await db.flashcardDeck.count({ where: { userId: user.id } });
    if (deckCount >= 3) {
      return NextResponse.json(
        { error: "Free plan limited to 3 decks. Upgrade for unlimited." },
        { status: 403 },
      );
    }
  }

  const deck = await db.flashcardDeck.create({
    data: { userId: user.id, title: parsed.data.title, courseId: parsed.data.courseId ?? null },
  });

  return NextResponse.json(deck, { status: 201 });
}
