import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  StickyNote,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Courses" };

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, courses, activeCourseId] = await Promise.all([
    db.course.count(),
    db.course.findMany({
      orderBy: { createdAt: "asc" },
      skip,
      take: PAGE_SIZE,
      include: { _count: { select: { notes: true, bookmarks: true } } },
    }),
    getActiveCourseId(),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
          {totalCount} course{totalCount !== 1 ? "s" : ""} in your library
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

              {course.isActive && (
                <Badge variant="success" className="shrink-0">
                  Active
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>

      {totalCount === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-medium">No courses yet</h2>
          <p className="text-sm text-muted-foreground">
            Add a course collection to <code className="font-mono">courses/</code> and run{" "}
            <code className="font-mono">npm run db:seed</code>.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/courses?page=${page - 1}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border bg-card px-3 text-sm text-muted-foreground opacity-50">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={`/courses?page=${p}`}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        p === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {p}
                    </Link>
                  ),
                )}
            </div>

            {page < totalPages ? (
              <Link
                href={`/courses?page=${page + 1}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border bg-card px-3 text-sm text-muted-foreground opacity-50">
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
