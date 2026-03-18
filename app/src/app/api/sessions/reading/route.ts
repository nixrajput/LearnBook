import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const startSessionSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
});

const endSessionSchema = z.object({
  sessionId: z.string().min(1),
  wordsRead: z.number().int().min(0),
});

// POST — start or end a reading session
export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (action === "start") {
    const parsed = startSessionSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const session = await db.readingSession.create({
      data: {
        userId: user.id,
        courseId: parsed.data.courseId,
        chapterId: parsed.data.chapterId,
      },
    });
    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  }

  if (action === "end") {
    const parsed = endSessionSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const existing = await db.readingSession.findFirst({
      where: { id: parsed.data.sessionId, userId: user.id, endedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found or already ended" }, { status: 404 });
    }

    const durationSec = Math.floor((Date.now() - existing.startedAt.getTime()) / 1000);

    const session = await db.readingSession.update({
      where: { id: parsed.data.sessionId },
      data: {
        endedAt: new Date(),
        wordsRead: parsed.data.wordsRead,
        durationSec,
      },
    });

    return NextResponse.json(session);
  }

  return NextResponse.json({ error: "action must be 'start' or 'end'" }, { status: 400 });
}
