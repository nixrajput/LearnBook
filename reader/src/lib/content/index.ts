import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";
import type { ChapterWithProgress, ChapterDetail, PartWithChapters } from "@/types/content";

export async function getAllPartsWithChapters(): Promise<PartWithChapters[]> {
  const courseId = await getActiveCourseId();

  const parts = await db.part.findMany({
    where: { courseId },
    orderBy: { sortOrder: "asc" },
    include: {
      chapters: {
        where: { courseId },
        orderBy: { sortOrder: "asc" },
        include: {
          progress: true,
          _count: { select: { bookmarks: true, notes: true } },
        },
      },
    },
  });

  return parts.map((part) => {
    const chapters: ChapterWithProgress[] = part.chapters.map((ch) => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      slug: ch.slug,
      partId: ch.partId,
      partNumber: part.number,
      partTitle: part.title,
      wordCount: ch.wordCount,
      readingTimeMin: ch.readingTimeMin,
      progress: ch.progress
        ? {
            scrollPosition: ch.progress.scrollPosition,
            completed: ch.progress.completed,
            lastReadAt: ch.progress.lastReadAt,
          }
        : null,
      bookmarkCount: ch._count.bookmarks,
      noteCount: ch._count.notes,
    }));

    const completedCount = chapters.filter((c) => c.progress?.completed).length;

    return {
      id: part.id,
      number: part.number,
      romanNumeral: part.romanNumeral,
      title: part.title,
      chapters,
      completedCount,
      totalCount: chapters.length,
    };
  });
}

export async function getChapterBySlug(slug: string): Promise<ChapterDetail | null> {
  const courseId = await getActiveCourseId();

  const chapter = await db.chapter.findUnique({
    where: { courseId_slug: { courseId, slug } },
    include: {
      part: true,
      sections: { orderBy: { sortOrder: "asc" } },
      progress: true,
    },
  });

  if (!chapter) return null;

  // Get prev/next chapters scoped to same course, ordered by sortOrder for determinism
  const [prevChapter, nextChapter] = await Promise.all([
    db.chapter.findFirst({
      where: { courseId, sortOrder: { lt: chapter.sortOrder } },
      orderBy: { sortOrder: "desc" },
      include: { part: true },
    }),
    db.chapter.findFirst({
      where: { courseId, sortOrder: { gt: chapter.sortOrder } },
      orderBy: { sortOrder: "asc" },
      include: { part: true },
    }),
  ]);

  return {
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    slug: chapter.slug,
    partNumber: chapter.part.number,
    partTitle: chapter.part.title,
    wordCount: chapter.wordCount,
    readingTimeMin: chapter.readingTimeMin,
    rawContent: chapter.rawContent,
    sections: chapter.sections.map((s) => ({
      heading: s.heading,
      slug: s.slug,
      level: s.level,
      sortOrder: s.sortOrder,
    })),
    prevChapter: prevChapter
      ? {
          slug: prevChapter.slug,
          number: prevChapter.number,
          title: prevChapter.title,
          partNumber: prevChapter.part.number,
        }
      : null,
    nextChapter: nextChapter
      ? {
          slug: nextChapter.slug,
          number: nextChapter.number,
          title: nextChapter.title,
          partNumber: nextChapter.part.number,
        }
      : null,
    progress: chapter.progress
      ? {
          scrollPosition: chapter.progress.scrollPosition,
          completed: chapter.progress.completed,
          lastReadAt: chapter.progress.lastReadAt,
        }
      : null,
  };
}

export async function getAllChapterSlugs(): Promise<string[]> {
  const courseId = await getActiveCourseId();
  const chapters = await db.chapter.findMany({
    where: { courseId },
    select: { slug: true },
    orderBy: { sortOrder: "asc" },
  });
  return chapters.map((c) => c.slug);
}

export async function getAdjacentChapters(chapterSlug: string) {
  const courseId = await getActiveCourseId();
  const current = await db.chapter.findUnique({
    where: { courseId_slug: { courseId, slug: chapterSlug } },
    select: { sortOrder: true },
  });
  if (!current) return { prev: null, next: null };
  const [prev, next] = await Promise.all([
    db.chapter.findFirst({
      where: { courseId, sortOrder: { lt: current.sortOrder } },
      orderBy: { sortOrder: "desc" },
      select: { slug: true, number: true, title: true },
    }),
    db.chapter.findFirst({
      where: { courseId, sortOrder: { gt: current.sortOrder } },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, number: true, title: true },
    }),
  ]);
  return { prev, next };
}
