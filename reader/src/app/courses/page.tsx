import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, StickyNote, Bookmark } from "lucide-react";
import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";
import { SetActiveCourseButton } from "@/components/course/set-active-course-button";
import { StopPropagation } from "@/components/course/stop-propagation";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const [courses, activeCourseId] = await Promise.all([
    db.course.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { notes: true, bookmarks: true } } },
    }),
    getActiveCourseId(),
  ]);

  const summaries = await Promise.all(
    courses.map(async (course) => {
      const [total, completed, lastRead] = await Promise.all([
        db.chapter.count({ where: { courseId: course.id } }),
        db.readingProgress.count({ where: { courseId: course.id, completed: true } }),
        db.readingProgress.findFirst({
          where: { courseId: course.id },
          orderBy: { lastReadAt: "desc" },
          include: { chapter: { select: { title: true, slug: true, number: true } } },
        }),
      ]);
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...course,
        totalChapters: total,
        completedChapters: completed,
        completionPct,
        isActive: course.id === activeCourseId,
        lastReadChapter: lastRead?.chapter ?? null,
      };
    }),
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="mt-1 text-muted-foreground">
          {courses.length} course{courses.length !== 1 ? "s" : ""} in your library
        </p>
      </div>

      <div className="space-y-4">
        {summaries.map((course, i) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className={`group block animate-slide-up rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm ${
              course.isActive ? "border-primary/30 bg-primary/5" : ""
            } ${i === 0 ? "stagger-1" : i === 1 ? "stagger-2" : i === 2 ? "stagger-3" : "stagger-4"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-lg font-semibold transition-colors group-hover:text-primary">
                    {course.title}
                  </h2>
                  {course.isActive && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      active
                    </span>
                  )}
                </div>
                {course.description && (
                  <p className="mb-3 text-sm text-muted-foreground">{course.description}</p>
                )}

                {/* Stats row */}
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.totalChapters} chapters
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    {course.completedChapters} completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5 text-yellow-500" />
                    {course._count.notes} notes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="h-3.5 w-3.5 text-blue-500" />
                    {course._count.bookmarks} bookmarks
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{course.completionPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${course.completionPct}%` }}
                  />
                </div>

                {course.lastReadChapter && course.isActive && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last read: Ch. {course.lastReadChapter.number} — {course.lastReadChapter.title}
                  </p>
                )}
              </div>

              {/* Set active button — stop propagation so clicking it doesn't navigate */}
              <StopPropagation>
                <SetActiveCourseButton courseId={course.id} isActive={course.isActive} />
              </StopPropagation>
            </div>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-medium">No courses yet</h2>
          <p className="text-sm text-muted-foreground">
            Add a course collection to <code className="font-mono">courses/</code> and run{" "}
            <code className="font-mono">npm run db:seed</code>.
          </p>
        </div>
      )}
    </div>
  );
}
