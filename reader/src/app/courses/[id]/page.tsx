import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, CheckCircle2, BookOpen, ArrowLeft, StickyNote, Bookmark } from "lucide-react";
import { db } from "@/lib/db";
import { Progress } from "@/components/ui/progress";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await db.course.findUnique({ where: { id }, select: { title: true } });
  return { title: course?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [course, parts] = await Promise.all([
    db.course.findUnique({ where: { id }, select: { title: true, description: true } }),
    db.part.findMany({
      where: { courseId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        chapters: {
          where: { courseId: id },
          orderBy: { sortOrder: "asc" },
          include: {
            progress: true,
            _count: { select: { bookmarks: true, notes: true } },
          },
        },
      },
    }),
  ]);

  if (!course) notFound();

  // Auto-activate this course when viewing its detail page
  await db.userPreference.upsert({
    where: { id: "default" },
    update: { activeCourseId: id },
    create: { id: "default", activeCourseId: id },
  });

  const isActive = true;
  const totalChapters = parts.reduce((s, p) => s + p.chapters.length, 0);
  const completedChapters = parts.reduce(
    (s, p) => s + p.chapters.filter((c) => c.progress?.completed).length,
    0,
  );
  const completionPct =
    totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All courses
      </Link>

      {/* ── Course header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 animate-slide-down">
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{course.title}</h1>
          {course.description && <p className="text-muted-foreground">{course.description}</p>}
        </div>

        {/* Stats row */}
        <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {totalChapters} chapters
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {completedChapters} completed
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {totalChapters - completedChapters} remaining
          </span>
        </div>

        {/* Overall progress bar */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Overall progress</span>
            <span className="text-lg font-bold tabular-nums text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </div>
      </div>

      {/* ── Parts ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        {parts.map((part, i) => {
          const partCompleted = part.chapters.filter((c) => c.progress?.completed).length;
          const partPct =
            part.chapters.length > 0 ? Math.round((partCompleted / part.chapters.length) * 100) : 0;

          return (
            <section
              key={part.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Part header */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                      Part {part.number}
                    </span>
                    <h2 className="text-base font-semibold leading-snug">{part.title}</h2>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {partCompleted}/{part.chapters.length}
                  </span>
                </div>
                <Progress value={partPct} className="h-1" />
              </div>

              {/* Chapter list */}
              <div className="space-y-2">
                {part.chapters.map((chapter) => {
                  const completed = chapter.progress?.completed ?? false;
                  const inProgress = !completed && (chapter.progress?.scrollPosition ?? 0) > 0.05;
                  const progressPct = Math.round((chapter.progress?.scrollPosition ?? 0) * 100);

                  return (
                    <Link
                      key={chapter.id}
                      href={`/course/${chapter.slug}`}
                      className="group flex items-center gap-4 rounded-lg border bg-card px-4 py-3.5 transition-all duration-150 hover:border-primary/30 hover:bg-accent/40"
                    >
                      {/* Status icon */}
                      <div className="shrink-0">
                        {completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : inProgress ? (
                          <div className="relative flex h-5 w-5 items-center justify-center">
                            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="none"
                                strokeWidth="2"
                                className="stroke-muted"
                              />
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="none"
                                strokeWidth="2"
                                strokeDasharray={`${2 * Math.PI * 8}`}
                                strokeDashoffset={`${2 * Math.PI * 8 * (1 - progressPct / 100)}`}
                                className="stroke-primary transition-all"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/25">
                            <span className="text-[10px] font-medium text-muted-foreground/60">
                              {chapter.number}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Chapter info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                            {chapter.title}
                          </h3>
                          {inProgress && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              {progressPct}%
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {chapter.readingTimeMin} min
                          </span>
                          {chapter._count.notes > 0 && (
                            <span className="flex items-center gap-1">
                              <StickyNote className="h-3 w-3" />
                              {chapter._count.notes}
                            </span>
                          )}
                          {chapter._count.bookmarks > 0 && (
                            <span className="flex items-center gap-1">
                              <Bookmark className="h-3 w-3" />
                              {chapter._count.bookmarks}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Completion indicator */}
                      {completed && (
                        <span className="shrink-0 text-[11px] font-medium text-emerald-500">
                          Done
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
