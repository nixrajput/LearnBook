"use client";

import { useReaderStore } from "@/stores/reader-store";
import { ChapterSidebar } from "./chapter-sidebar";
import { TableOfContents } from "./table-of-contents";
import { NotesPanel } from "@/components/notes/notes-panel";
import { cn } from "@/lib/utils/cn";
import type { PartWithChapters, SectionSummary, ChapterDetail } from "@/types/content";

interface ReaderLayoutProps {
  courseId: string;
  parts: PartWithChapters[];
  chapter: ChapterDetail;
  children: React.ReactNode;
}

export function ReaderLayout({ courseId, parts, chapter, children }: ReaderLayoutProps) {
  const { sidebarOpen, tocOpen, notesPanelOpen } = useReaderStore();

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Left sidebar */}
      <ChapterSidebar parts={parts} open={sidebarOpen} />

      {/* Main content area */}
      <div className={cn("flex min-w-0 flex-1 overflow-x-hidden", notesPanelOpen ? "xl:pr-0" : "")}>
        {/* Reader */}
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>

        {/* Right TOC */}
        {tocOpen && (
          <div className="hidden w-56 shrink-0 animate-slide-in-right px-6 py-6 xl:block">
            <TableOfContents sections={chapter.sections as SectionSummary[]} open={tocOpen} />
          </div>
        )}
      </div>

      {/* Notes panel (split view on large screens) */}
      {notesPanelOpen && (
        <NotesPanel courseId={courseId} chapterId={chapter.id} chapterTitle={chapter.title} />
      )}
    </div>
  );
}
