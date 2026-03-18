import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateProgressSchema } from "@/lib/validators/progress";
import { todayString } from "@/lib/utils/date";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId } = await params;
  try {
    const progress = await db.readingProgress.findUnique({
      where: { userId_chapterId: { userId: user.id, chapterId } },
    });
    return NextResponse.json(progress ?? null);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateProgressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { scrollPosition, completed, timeSpentSec } = parsed.data;
  const courseId = await getActiveCourseId(user.id);

  try {
    const existing = await db.readingProgress.findUnique({
      where: { userId_chapterId: { userId: user.id, chapterId } },
    });

    const data: Parameters<typeof db.readingProgress.upsert>[0]["update"] = {
      scrollPosition,
      lastReadAt: new Date(),
    };

    if (completed !== undefined) {
      data.completed = completed;
      if (completed && !existing?.completed) {
        data.completedAt = new Date();
      }
    }

    if (timeSpentSec) {
      data.timeSpentSec = (existing?.timeSpentSec ?? 0) + timeSpentSec;
    }

    const progress = await db.readingProgress.upsert({
      where: { userId_chapterId: { userId: user.id, chapterId } },
      update: data,
      create: {
        userId: user.id,
        courseId,
        chapterId,
        scrollPosition,
        completed: completed ?? false,
        completedAt: completed ? new Date() : null,
        timeSpentSec: timeSpentSec ?? 0,
      },
    });

    // Update daily streak scoped to this user + course
    const today = todayString();
    await db.readingStreak.upsert({
      where: { userId_courseId_date: { userId: user.id, courseId, date: today } },
      update: {
        minutesRead: { increment: Math.floor((timeSpentSec ?? 0) / 60) },
        chaptersRead: { increment: completed && !existing?.completed ? 1 : 0 },
      },
      create: {
        userId: user.id,
        courseId,
        date: today,
        minutesRead: Math.floor((timeSpentSec ?? 0) / 60),
        chaptersRead: completed ? 1 : 0,
      },
    });

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
