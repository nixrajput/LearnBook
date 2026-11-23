import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId, readableCourseWhere } from "@/lib/content/parser";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [courses, activeCourseId] = await Promise.all([
    db.course.findMany({ where: readableCourseWhere(user.id), orderBy: { createdAt: "asc" } }),
    getActiveCourseId(user.id),
  ]);

  const summaries = await Promise.all(
    courses.map(async (course) => {
      const [total, completed, notesCount, bookmarksCount] = await Promise.all([
        db.chapter.count({ where: { courseId: course.id } }),
        db.readingProgress.count({
          where: { userId: user.id, courseId: course.id, completed: true },
        }),
        db.note.count({ where: { userId: user.id, courseId: course.id } }),
        db.bookmark.count({ where: { userId: user.id, courseId: course.id } }),
      ]);
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...course,
        _count: { notes: notesCount, bookmarks: bookmarksCount },
        totalChapters: total,
        completedChapters: completed,
        completionPct,
        isActive: course.id === activeCourseId,
      };
    }),
  );

  return NextResponse.json(summaries);
}
