"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";

interface ReadingProgressBarProps {
  chapterId: string;
}

export function ReadingProgressBar({ chapterId }: ReadingProgressBarProps) {
  const progress = useReadingProgress(chapterId);

  return (
    <div className="fixed left-0 right-0 top-14 z-30 h-0.5 bg-transparent">
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
