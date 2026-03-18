"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useReaderStore } from "@/stores/reader-store";
import type { PartWithChapters } from "@/types/content";

interface ChapterSidebarProps {
  parts: PartWithChapters[];
  open: boolean;
}

function SidebarContent({ parts }: { parts: PartWithChapters[] }) {
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

  return (
    <>
      {parts.map((part) => {
        const isCollapsed = collapsedParts.has(part.number);
        const partPct =
          part.totalCount > 0 ? Math.round((part.completedCount / part.totalCount) * 100) : 0;

        return (
          <div key={part.id}>
            <button
              onClick={() => togglePart(part.number)}
              className="group flex w-full items-start gap-2 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
            >
              <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                {part.romanNumeral}
              </span>
              <span className="min-w-0 flex-1 break-words text-xs font-semibold leading-snug">
                {part.title}
              </span>
              <span className="mt-0.5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {part.completedCount}/{part.totalCount}
              </span>
              {isCollapsed ? (
                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
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

                      <span className="mt-0.5 w-5 shrink-0 text-xs tabular-nums text-muted-foreground/70">
                        {chapter.number}
                      </span>
                      <span className="min-w-0 flex-1 break-words text-xs leading-relaxed">
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
    </>
  );
}

export function ChapterSidebar({ parts, open }: ChapterSidebarProps) {
  const setSidebarOpen = useReaderStore((s) => s.setSidebarOpen);

  if (!open) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-14 left-0 z-50 flex w-64 shrink-0 animate-slide-in-left flex-col border-r bg-background md:static md:inset-auto md:z-auto md:flex",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Chapters
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="pb-8">
            <SidebarContent parts={parts} />
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
