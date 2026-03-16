import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exportPayloadSchema } from "@/lib/validators/import-export";
import { getActiveCourseId } from "@/lib/content/parser";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = exportPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid import format", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { notes, bookmarks, highlights, progress, preferences } = parsed.data;
  const stats = { notes: 0, bookmarks: 0, highlights: 0, progress: 0 };
  const courseId = await getActiveCourseId();

  // Get chapter map for lookups scoped to active course
  const chapters = await db.chapter.findMany({
    where: { courseId },
    select: { id: true, slug: true },
  });
  const chapterMap = new Map(chapters.map((c) => [c.slug, c.id]));

  // Import notes
  for (const n of notes) {
    const chapterId = chapterMap.get(n.chapterSlug);
    if (!chapterId) continue;
    await db.note.create({
      data: { courseId, chapterId, sectionSlug: n.sectionSlug ?? null, content: n.content },
    });
    stats.notes++;
  }

  // Import bookmarks
  for (const b of bookmarks) {
    const chapterId = chapterMap.get(b.chapterSlug);
    if (!chapterId) continue;
    try {
      await db.bookmark.create({
        data: { courseId, chapterId, label: b.label ?? null },
      });
      stats.bookmarks++;
    } catch {
      // Skip duplicates
    }
  }

  // Import highlights
  for (const h of highlights) {
    const chapterId = chapterMap.get(h.chapterSlug);
    if (!chapterId) continue;
    await db.highlight.create({
      data: {
        courseId,
        chapterId,
        text: h.text,
        color: h.color,
        note: h.note ?? null,
        startOffset: h.startOffset,
        endOffset: h.endOffset,
      },
    });
    stats.highlights++;
  }

  // Import progress
  for (const p of progress) {
    const chapterId = chapterMap.get(p.chapterSlug);
    if (!chapterId) continue;
    await db.readingProgress.upsert({
      where: { chapterId },
      update: {
        scrollPosition: p.scrollPosition,
        completed: p.completed,
        completedAt: p.completedAt ? new Date(p.completedAt) : null,
        timeSpentSec: p.timeSpentSec,
      },
      create: {
        courseId,
        chapterId,
        scrollPosition: p.scrollPosition,
        completed: p.completed,
        completedAt: p.completedAt ? new Date(p.completedAt) : null,
        timeSpentSec: p.timeSpentSec,
      },
    });
    stats.progress++;
  }

  // Import preferences
  await db.userPreference.upsert({
    where: { id: "default" },
    update: preferences,
    create: { id: "default", ...preferences },
  });

  return NextResponse.json({ success: true, stats });
}
