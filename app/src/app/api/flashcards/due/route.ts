import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  const dueCards = await db.flashcardCard.findMany({
    where: {
      deck: { userId: user.id },
      OR: [
        { dueDate: { lte: now } },
        { reps: 0 }, // New cards (never reviewed)
      ],
    },
    include: {
      deck: { select: { title: true } },
    },
    orderBy: { dueDate: "asc" },
    take: 50,
  });

  return NextResponse.json({ cards: dueCards, totalDue: dueCards.length });
}
