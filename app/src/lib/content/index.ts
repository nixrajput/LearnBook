import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";
import type { ChapterWithProgress, ChapterDetail, PartWithChapters } from "@/types/content";

export async function getAllPartsWithChapters(userId?: string): Promise<PartWithChapters[]> {
  const courseId = await getActiveCourseId(userId);

  const parts = await db.part.findMany({
    where: { courseId },
    orderBy: { sortOrder: "asc" },
    include: {
      chapters: {
        where: { courseId },
        orderBy: { sortOrder: "asc" },
        include: {
          progress: userId ? { where: { userId } } : false,
          _count: { select: { bookmarks: true, notes: true } },
        },
      },
    },
  });

  return parts.map((part) => {
    const chapters: ChapterWithProgress[] = part.chapters.map((ch) => {
      const prog = Array.isArray(ch.progress) ? ch.progress[0] : null;
      return {
        id: ch.id,
        number: ch.number,
        title: ch.title,
        slug: ch.slug,
        partId: ch.partId,
        partNumber: part.number,
        partTitle: part.title,
        wordCount: ch.wordCount,
        readingTimeMin: ch.readingTimeMin,
        progress: prog
          ? {
              scrollPosition: prog.scrollPosition,
              completed: prog.completed,
              lastReadAt: prog.lastReadAt,
            }
          : null,
        bookmarkCount: ch._count.bookmarks,
        noteCount: ch._count.notes,
      };
    });

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

export async function getChapterBySlug(
  slug: string,
  userId?: string,
): Promise<ChapterDetail | null> {
  const courseId = await getActiveCourseId(userId);

  const chapter = await db.chapter.findUnique({
    where: { courseId_slug: { courseId, slug } },
    include: {
      part: true,
      sections: { orderBy: { sortOrder: "asc" } },
      progress: userId ? { where: { userId } } : false,
    },
  });

  if (!chapter) return null;

  const prog = Array.isArray(chapter.progress) ? chapter.progress[0] : null;

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
    progress: prog
      ? {
          scrollPosition: prog.scrollPosition,
          completed: prog.completed,
          lastReadAt: prog.lastReadAt,
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

// ─── Advanced Analytics Functions ─────────────────────────────────────────────

export interface ReadingSpeedStats {
  sessions: { date: string; wpm: number }[];
  avgWpm: number;
  trend: number | null; // positive = improving
}

export async function getReadingSpeedStats(userId: string): Promise<ReadingSpeedStats> {
  const sessions = await db.readingSession.findMany({
    where: { userId, endedAt: { not: null }, durationSec: { gt: 0 }, wordsRead: { gt: 0 } },
    orderBy: { startedAt: "asc" },
    take: 50,
    select: { startedAt: true, wordsRead: true, durationSec: true },
  });

  const data = sessions.map((s) => ({
    date: s.startedAt.toISOString().split("T")[0],
    wpm: Math.round((s.wordsRead / s.durationSec) * 60),
  }));

  const totalWpm = data.reduce((sum, d) => sum + d.wpm, 0);
  const avgWpm = data.length > 0 ? Math.round(totalWpm / data.length) : 0;

  // Trend: compare last 5 vs previous 5
  let trend: number | null = null;
  if (data.length >= 10) {
    const recent = data.slice(-5).reduce((s, d) => s + d.wpm, 0) / 5;
    const prior = data.slice(-10, -5).reduce((s, d) => s + d.wpm, 0) / 5;
    trend = Math.round(recent - prior);
  }

  return { sessions: data, avgWpm, trend };
}

export interface FocusInsights {
  peakHour: number | null; // 0-23
  peakHourLabel: string;
  avgSessionMin: number;
  totalSessions: number;
  hourDistribution: number[]; // 24 buckets
}

export async function getFocusInsights(userId: string): Promise<FocusInsights> {
  const sessions = await db.readingSession.findMany({
    where: { userId, endedAt: { not: null }, durationSec: { gt: 30 } },
    select: { startedAt: true, durationSec: true },
  });

  const hourBuckets = new Array(24).fill(0) as number[];
  let totalDuration = 0;

  for (const s of sessions) {
    const hour = s.startedAt.getHours();
    hourBuckets[hour] += s.durationSec;
    totalDuration += s.durationSec;
  }

  const peakHour = sessions.length > 0 ? hourBuckets.indexOf(Math.max(...hourBuckets)) : null;
  const HOUR_LABELS = [
    "12 AM",
    "1 AM",
    "2 AM",
    "3 AM",
    "4 AM",
    "5 AM",
    "6 AM",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
  ];

  return {
    peakHour,
    peakHourLabel: peakHour !== null ? HOUR_LABELS[peakHour] : "—",
    avgSessionMin: sessions.length > 0 ? Math.round(totalDuration / sessions.length / 60) : 0,
    totalSessions: sessions.length,
    hourDistribution: hourBuckets,
  };
}

export interface CompletionForecast {
  estimatedDaysLeft: number | null;
  estimatedDate: string | null;
  avgChaptersPerWeek: number;
  remainingChapters: number;
}

export async function getCompletionForecast(
  userId: string,
  courseId: string,
): Promise<CompletionForecast> {
  const [totalChapters, completedCount, recentCompletions] = await Promise.all([
    db.chapter.count({ where: { courseId } }),
    db.readingProgress.count({ where: { userId, courseId, completed: true } }),
    db.readingProgress.findMany({
      where: { userId, courseId, completed: true, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 20,
      select: { completedAt: true },
    }),
  ]);

  const remaining = totalChapters - completedCount;
  if (remaining <= 0) {
    return {
      estimatedDaysLeft: 0,
      estimatedDate: null,
      avgChaptersPerWeek: 0,
      remainingChapters: 0,
    };
  }

  // Calculate average chapters per week from recent completions
  if (recentCompletions.length < 2) {
    return {
      estimatedDaysLeft: null,
      estimatedDate: null,
      avgChaptersPerWeek: 0,
      remainingChapters: remaining,
    };
  }

  const oldest = recentCompletions[recentCompletions.length - 1].completedAt!;
  const newest = recentCompletions[0].completedAt!;
  const daySpan = Math.max(1, (newest.getTime() - oldest.getTime()) / 86400000);
  const avgPerDay = (recentCompletions.length - 1) / daySpan;
  const avgPerWeek = Math.round(avgPerDay * 7 * 10) / 10;

  const daysLeft = avgPerDay > 0 ? Math.ceil(remaining / avgPerDay) : null;
  const estimatedDate =
    daysLeft !== null
      ? new Date(Date.now() + daysLeft * 86400000).toISOString().split("T")[0]
      : null;

  return {
    estimatedDaysLeft: daysLeft,
    estimatedDate,
    avgChaptersPerWeek: avgPerWeek,
    remainingChapters: remaining,
  };
}

export async function getAdjacentChapters(chapterSlug: string, userId?: string) {
  const courseId = await getActiveCourseId(userId);
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
