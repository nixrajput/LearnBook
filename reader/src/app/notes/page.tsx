import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";
import { StickyNote, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "My Notes" };

const SCOPE_COLORS: Record<string, string> = {
  course: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  section: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  selection: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  chapter: "bg-muted text-muted-foreground",
};

export default async function NotesPage() {
  const notes = await db.note.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      chapter: { select: { title: true, slug: true, number: true } },
      course: { select: { id: true, title: true } },
    },
  });

  // Group by course, then by chapter
  const byCourse = notes.reduce(
    (acc, note) => {
      const courseKey = note.courseId;
      if (!acc[courseKey]) {
        acc[courseKey] = { course: note.course, chapters: {} };
      }
      const chapterKey = note.chapterId;
      if (!acc[courseKey].chapters[chapterKey]) {
        acc[courseKey].chapters[chapterKey] = { chapter: note.chapter, notes: [] };
      }
      acc[courseKey].chapters[chapterKey].notes.push(note);
      return acc;
    },
    {} as Record<
      string,
      {
        course: (typeof notes)[0]["course"];
        chapters: Record<string, { chapter: (typeof notes)[0]["chapter"]; notes: typeof notes }>;
      }
    >,
  );

  const courseGroups = Object.values(byCourse);

  return (
    <div className="container mx-auto max-w-3xl animate-fade-in px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
          <p className="mt-1 text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? "s" : ""} across {courseGroups.length} course
            {courseGroups.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {notes.length === 0 && (
        <div className="py-20 text-center">
          <StickyNote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-medium">No notes yet</h2>
          <p className="text-sm text-muted-foreground">
            Open a chapter and use the notes panel to start capturing your thoughts.
          </p>
          <Link
            href="/course"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Browse chapters <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {courseGroups.map(({ course, chapters }) => {
          const chapterGroups = Object.values(chapters);
          const courseNoteCount = chapterGroups.reduce((n, g) => n + g.notes.length, 0);
          return (
            <div key={course.id}>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <h2 className="text-base font-semibold">{course.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {courseNoteCount} note{courseNoteCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-8">
                {chapterGroups.map(({ chapter, notes: chapterNotes }) => (
                  <div key={chapter?.slug ?? "__course__"}>
                    <div className="mb-3 flex items-center justify-between">
                      <Link
                        href={`/course/${chapter.slug}`}
                        className="font-medium transition-colors hover:text-primary"
                      >
                        Ch. {chapter.number} — {chapter.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {chapterNotes.length} note{chapterNotes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {chapterNotes.map((note) => {
                        const scope = (note as typeof note & { scope?: string }).scope ?? "chapter";
                        const selectedText = (
                          note as typeof note & { selectedText?: string | null }
                        ).selectedText;
                        return (
                          <div key={note.id} className="rounded-lg border bg-card p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                  SCOPE_COLORS[scope] ?? SCOPE_COLORS.chapter,
                                )}
                              >
                                {scope}
                              </span>
                              {note.sectionSlug && scope === "section" && (
                                <span className="text-[10px] text-muted-foreground">
                                  #{note.sectionSlug}
                                </span>
                              )}
                            </div>
                            {selectedText && (
                              <blockquote className="mb-2 border-l-2 border-muted-foreground/30 pl-2 text-xs italic text-muted-foreground">
                                {selectedText}
                              </blockquote>
                            )}
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {note.content}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {formatDate(note.updatedAt)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
