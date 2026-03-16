"use client";

import { Bookmark, BookmarkCheck, PanelRight, AlignLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/stores/reader-store";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReaderToolbarProps {
  courseId: string;
  chapterId: string;
  chapterTitle: string;
  initiallyBookmarked: boolean;
}

export function ReaderToolbar({
  courseId,
  chapterId,
  chapterTitle,
  initiallyBookmarked,
}: ReaderToolbarProps) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const { toggleNotesPanel, toggleSidebar, toggleToc } = useReaderStore();

  const handleBookmark = async () => {
    if (bookmarked) {
      if (bookmarkId) {
        await fetch(`/api/bookmarks/${bookmarkId}`, { method: "DELETE" });
        setBookmarkId(null);
      }
      setBookmarked(false);
    } else {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, chapterId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkId(data.id);
        setBookmarked(true);
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle sidebar [</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={cn(bookmarked && "text-primary")}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {bookmarked ? "Remove bookmark (b)" : `Bookmark "${chapterTitle}" (b)`}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleNotesPanel}>
              <PanelRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle notes panel (n)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
