import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";
import type { ExportPayload } from "@/types/database";

export async function GET() {
  const courseId = await getActiveCourseId();

  const [notes, bookmarks, highlights, progress, prefs] = await Promise.all([
    db.note.findMany({ where: { courseId }, include: { chapter: { select: { slug: true } } } }),
    db.bookmark.findMany({
      where: { courseId },
      include: {
        chapter: { select: { slug: true } },
        section: { select: { slug: true } },
      },
    }),
    db.highlight.findMany({
      where: { courseId },
      include: { chapter: { select: { slug: true } } },
    }),
    db.readingProgress.findMany({
      where: { courseId },
      include: { chapter: { select: { slug: true } } },
    }),
    db.userPreference.findUnique({ where: { id: "default" } }),
  ]);

  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: notes.map((n) => ({
      chapterSlug: n.chapter.slug,
      sectionSlug: n.sectionSlug,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
    bookmarks: bookmarks.map((b) => ({
      chapterSlug: b.chapter.slug,
      sectionSlug: b.section?.slug ?? null,
      label: b.label,
      createdAt: b.createdAt.toISOString(),
    })),
    highlights: highlights.map((h) => ({
      chapterSlug: h.chapter.slug,
      text: h.text,
      color: h.color,
      note: h.note,
      startOffset: h.startOffset,
      endOffset: h.endOffset,
      createdAt: h.createdAt.toISOString(),
    })),
    progress: progress.map((p) => ({
      chapterSlug: p.chapter.slug,
      scrollPosition: p.scrollPosition,
      completed: p.completed,
      completedAt: p.completedAt?.toISOString() ?? null,
      timeSpentSec: p.timeSpentSec,
    })),
    preferences: {
      theme: prefs?.theme ?? "system",
      fontSize: prefs?.fontSize ?? 16,
      lineWidth: prefs?.lineWidth ?? "md",
      fontFamily: prefs?.fontFamily ?? "sans",
      showLineNumbers: prefs?.showLineNumbers ?? true,
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${courseId}-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
