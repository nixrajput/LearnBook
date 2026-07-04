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
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar — fixed height, independently scrollable */}
      <ChapterSidebar parts={parts} open={sidebarOpen} />

      {/* Main content area */}
      <div className={cn("flex min-w-0 flex-1 overflow-hidden")}>
        {/* Reader — only this area scrolls */}
        <div id="reader-scroll-area" className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Right TOC — fixed height, independently scrollable */}
        {tocOpen && (
          <div className="hidden w-56 shrink-0 animate-slide-in-right overflow-y-auto border-l px-5 py-6 xl:block">
            <TableOfContents sections={chapter.sections as SectionSummary[]} open={tocOpen} />
          </div>
        )}
      </div>

      {/* Notes panel (split view on large screens) — fixed height, independently scrollable */}
      {notesPanelOpen && (
        <NotesPanel courseId={courseId} chapterId={chapter.id} chapterTitle={chapter.title} />
      )}
    </div>
  );
}
