import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";
import { Bookmark, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const bookmarks = await db.bookmark.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      chapter: { select: { title: true, slug: true, number: true } },
      section: { select: { heading: true, slug: true } },
      course: { select: { id: true, title: true } },
    },
  });

  // Group by course
  const byCourse = bookmarks.reduce(
    (acc, bm) => {
      const key = bm.courseId;
      if (!acc[key]) acc[key] = { course: bm.course, bookmarks: [] };
      acc[key].bookmarks.push(bm);
      return acc;
    },
    {} as Record<string, { course: (typeof bookmarks)[0]["course"]; bookmarks: typeof bookmarks }>,
  );

  const courseGroups = Object.values(byCourse);

  return (
    <div className="container mx-auto max-w-3xl animate-fade-in px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        <p className="mt-1 text-muted-foreground">
          {bookmarks.length} saved across {courseGroups.length} course
          {courseGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bookmarks.length === 0 && (
        <div className="py-20 text-center">
          <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-medium">No bookmarks yet</h2>
          <p className="text-sm text-muted-foreground">
            Click the bookmark icon in the reader toolbar to save chapters.
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
        {courseGroups.map(({ course, bookmarks: courseBookmarks }) => (
          <div key={course.id}>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <h2 className="text-base font-semibold">{course.title}</h2>
              <span className="text-xs text-muted-foreground">
                {courseBookmarks.length} bookmark{courseBookmarks.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {courseBookmarks.map((bookmark) => (
                <Link
                  key={bookmark.id}
                  href={
                    bookmark.section
                      ? `/course/${bookmark.chapter.slug}#${bookmark.section.slug}`
                      : `/course/${bookmark.chapter.slug}`
                  }
                  className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium transition-colors group-hover:text-primary">
                      Ch. {bookmark.chapter.number} — {bookmark.chapter.title}
                    </div>
                    {bookmark.section && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {bookmark.section.heading}
                      </div>
                    )}
                    {bookmark.label && (
                      <div className="mt-0.5 text-xs italic text-muted-foreground">
                        {bookmark.label}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(bookmark.createdAt)}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
