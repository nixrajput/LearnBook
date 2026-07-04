import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET() {
  const [courses, activeCourseId] = await Promise.all([
    db.course.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { notes: true, bookmarks: true } } },
    }),
    getActiveCourseId(),
  ]);

  const summaries = await Promise.all(
    courses.map(async (course) => {
      const [total, completed] = await Promise.all([
        db.chapter.count({ where: { courseId: course.id } }),
        db.readingProgress.count({ where: { courseId: course.id, completed: true } }),
      ]);
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...course,
        totalChapters: total,
        completedChapters: completed,
        completionPct,
        isActive: course.id === activeCourseId,
      };
    }),
  );

  return NextResponse.json(summaries);
}
