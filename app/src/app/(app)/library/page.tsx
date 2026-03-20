import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { BookOpen, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatBadge } from "@/components/library/format-badge";
import { ImportUrlDialog } from "@/components/library/import-url-dialog";

export const metadata: Metadata = { title: "My Library" };

export default async function LibraryPage() {
  const user = await requireSession();

  // Get user's uploaded/imported courses with their content sources
  const courses = await db.course.findMany({
    where: { uploadedBy: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      contentSources: { select: { sourceType: true, originalUrl: true, fileSize: true }, take: 1 },
      _count: { select: { parts: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="mt-1 text-muted-foreground">
            {courses.length} item{courses.length !== 1 ? "s" : ""} in your personal library
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/library/upload">
            <Upload className="h-4 w-4" />
            Upload
          </Link>
        </Button>
      </div>

      {/* Import web article */}
      <div className="mb-8">
        <ImportUrlDialog />
      </div>

      {/* Library items */}
      {courses.length === 0 ? (
        <div className="rounded-xl border bg-card py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <h2 className="mb-1 text-lg font-medium">Your library is empty</h2>
          <p className="text-sm text-muted-foreground">
            Upload a PDF, EPUB, or import a web article to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const source = course.contentSources[0];
            const sourceType = source?.sourceType ?? "markdown";
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium group-hover:text-primary">
                      {course.title}
                    </h3>
                    <FormatBadge sourceType={sourceType} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {course.totalChapters} chapter{course.totalChapters !== 1 ? "s" : ""}
                    {source?.originalUrl &&
                      (() => {
                        try {
                          return (
                            <>
                              {" "}
                              ·{" "}
                              <span className="truncate">
                                {new URL(source.originalUrl).hostname}
                              </span>
                            </>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    {source?.fileSize && <> · {(source.fileSize / 1024 / 1024).toFixed(1)} MB</>}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
