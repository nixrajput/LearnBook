import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";
import type { SearchResult } from "@/types/database";
import { snippet } from "@/lib/utils/snippet";

export async function GET(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const results: SearchResult[] = [];
  const limit = 20;
  const courseId = await getActiveCourseId(user.id);

  // Search chapters by title
  const chapters = await db.chapter.findMany({
    where: { courseId, title: { contains: q } },
    include: { part: { select: { number: true } } },
    take: 5,
  });

  for (const ch of chapters) {
    results.push({
      type: "chapter",
      chapterSlug: ch.slug,
      chapterTitle: ch.title,
      chapterNumber: ch.number,
      snippet: snippet(ch.title, q),
    });
  }

  // Search sections (scoped via chapter's courseId)
  const sections = await db.section.findMany({
    where: {
      chapter: { courseId },
      OR: [{ heading: { contains: q } }, { content: { contains: q } }],
    },
    include: { chapter: { select: { slug: true, title: true, number: true } } },
    take: 10,
  });

  for (const sec of sections) {
    results.push({
      type: "section",
      chapterSlug: sec.chapter.slug,
      chapterTitle: sec.chapter.title,
      chapterNumber: sec.chapter.number,
      sectionSlug: sec.slug,
      heading: sec.heading,
      snippet: snippet(sec.content, q),
    });
  }

  // Search notes scoped to this user
  const notes = await db.note.findMany({
    where: { userId: user.id, courseId, content: { contains: q } },
    include: { chapter: { select: { slug: true, title: true, number: true } } },
    take: 5,
  });

  for (const note of notes) {
    results.push({
      type: "note",
      chapterSlug: note.chapter.slug,
      chapterTitle: note.chapter.title,
      chapterNumber: note.chapter.number,
      heading: "My note",
      snippet: snippet(note.content, q),
    });
  }

  // Deduplicate by chapterSlug+sectionSlug
  const seen = new Set<string>();
  const deduped = results.filter((r) => {
    const key = `${r.chapterSlug}:${r.sectionSlug ?? ""}:${r.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ results: deduped.slice(0, limit) });
}
