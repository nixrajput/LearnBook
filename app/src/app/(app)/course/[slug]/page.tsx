import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getChapterBySlug, getAllPartsWithChapters, getAllChapterSlugs } from "@/lib/content";
import { getActiveCourseId } from "@/lib/content/parser";
import { ReaderLayout } from "@/components/reader/reader-layout";
import { ChapterContent } from "@/components/reader/chapter-content";
import { ChapterNav } from "@/components/reader/chapter-nav";
import { ReadingProgressBar } from "@/components/reader/reading-progress-bar";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";
import { ScrollRestoration } from "@/components/shared/scroll-restoration";
import { KeyboardHandler } from "@/components/shared/keyboard-handler";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { auth } from "@/auth";
import { AiExplainPopover } from "@/components/ai/ai-explain-popover";
import { AiSummaryPanel } from "@/components/ai/ai-summary-panel";
import { AiChat } from "@/components/ai/ai-chat";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await auth();
  const courseId = await getActiveCourseId(session?.user?.id);
  const chapter = await db.chapter.findUnique({
    where: { courseId_slug: { courseId, slug } },
    select: { title: true, number: true },
  });
  if (!chapter) return {};
  return { title: `Ch. ${chapter.number} — ${chapter.title}` };
}

export async function generateStaticParams() {
  const slugs = await getAllChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ChapterPage({ params }: PageProps) {
  const user = await requireSession();
  const { slug } = await params;

  const courseId = await getActiveCourseId(user.id);
  const [chapter, parts, prefs, bookmarks] = await Promise.all([
    getChapterBySlug(slug, user.id),
    getAllPartsWithChapters(user.id),
    db.userPreference.findUnique({ where: { userId: user.id } }),
    db.bookmark.findMany({ where: { userId: user.id, courseId, chapter: { slug } } }),
  ]);

  if (!chapter) notFound();

  const isBookmarked = bookmarks.length > 0;

  return (
    <>
      <ReadingProgressBar
        chapterId={chapter.id}
        courseId={courseId}
        wordCount={chapter.wordCount}
      />
      <ScrollRestoration chapterSlug={slug} />
      <KeyboardHandler
        prevChapterSlug={chapter.prevChapter?.slug}
        nextChapterSlug={chapter.nextChapter?.slug}
      />

      <ReaderLayout courseId={courseId} parts={parts} chapter={chapter}>
        <article className="w-full min-w-0 animate-fade-in overflow-x-hidden px-4 py-8 md:px-6 lg:px-8">
          {/* Chapter header */}
          <header className="mb-8 animate-slide-down">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Part {chapter.partNumber}</span>
              <span>·</span>
              <span>{chapter.partTitle}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="mb-3 text-3xl font-bold tracking-tight">
                  <span className="mr-2 text-xl font-normal text-muted-foreground">
                    {chapter.number}.
                  </span>
                  {chapter.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {chapter.readingTimeMin} min read
                  </span>
                  <span>{chapter.wordCount.toLocaleString()} words</span>
                  {chapter.progress?.completed && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>

              <ReaderToolbar
                courseId={courseId}
                chapterId={chapter.id}
                chapterTitle={chapter.title}
                initiallyBookmarked={isBookmarked}
              />
            </div>
          </header>

          {/* Content */}
          <ChapterContent
            rawContent={chapter.rawContent}
            fontSize={prefs?.fontSize ?? 16}
            lineWidth={prefs?.lineWidth ?? "md"}
            fontFamily={prefs?.fontFamily ?? "sans"}
          />

          {/* AI tools */}
          <div className="my-8 flex flex-wrap gap-2">
            <AiSummaryPanel chapterId={chapter.id} chapterTitle={chapter.title} />
            <AiChat chapterId={chapter.id} chapterTitle={chapter.title} />
          </div>

          {/* Chapter navigation */}
          <ChapterNav prev={chapter.prevChapter} next={chapter.nextChapter} />
        </article>

        {/* AI text selection popover */}
        <AiExplainPopover chapterId={chapter.id} />
      </ReaderLayout>
    </>
  );
}
