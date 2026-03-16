"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import type { PartWithChapters } from "@/types/content";

interface ChapterSidebarProps {
  parts: PartWithChapters[];
  open: boolean;
}

export function ChapterSidebar({ parts, open }: ChapterSidebarProps) {
  const pathname = usePathname();
  const currentSlug = pathname.split("/").pop() ?? "";

  const [collapsedParts, setCollapsedParts] = useState<Set<number>>(new Set());

  const togglePart = (partNumber: number) => {
    setCollapsedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partNumber)) next.delete(partNumber);
      else next.add(partNumber);
      return next;
    });
  };

  if (!open) return null;

  return (
    <aside className="hidden w-64 shrink-0 animate-slide-in-left flex-col border-r bg-background/50 md:flex">
      <div className="border-b px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Chapters
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="pb-8">
          {parts.map((part) => {
            const isCollapsed = collapsedParts.has(part.number);
            const partPct =
              part.totalCount > 0 ? Math.round((part.completedCount / part.totalCount) * 100) : 0;

            return (
              <div key={part.id}>
                <button
                  onClick={() => togglePart(part.number)}
                  className="group flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
                >
                  <span className="w-6 shrink-0 text-xs font-bold text-muted-foreground">
                    {part.romanNumeral}
                  </span>
                  <span className="flex-1 truncate text-xs font-semibold">{part.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {part.completedCount}/{part.totalCount}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="pb-1">
                    {partPct > 0 && (
                      <div className="mx-4 mb-1">
                        <Progress value={partPct} className="h-0.5" />
                      </div>
                    )}
                    {part.chapters.map((chapter) => {
                      const isActive = chapter.slug === currentSlug;
                      const isCompleted = chapter.progress?.completed ?? false;
                      const progressPct = (chapter.progress?.scrollPosition ?? 0) * 100;

                      return (
                        <Link
                          key={chapter.id}
                          href={`/course/${chapter.slug}`}
                          className={cn(
                            "group relative flex items-start gap-2 px-4 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                          )}
                        >
                          {/* Left border indicator */}
                          {isActive && (
                            <span className="absolute bottom-0 left-0 top-0 w-0.5 rounded-r bg-primary" />
                          )}

                          <span className="mt-0.5 w-5 shrink-0 text-xs tabular-nums">
                            {chapter.number}
                          </span>
                          <span className="line-clamp-2 flex-1 text-xs leading-relaxed">
                            {chapter.title}
                          </span>
                          {isCompleted ? (
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                          ) : progressPct > 5 ? (
                            <span className="mt-0.5 shrink-0 text-[10px] text-muted-foreground">
                              {Math.round(progressPct)}%
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
