import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ChapterNavItem } from "@/types/content";

interface ChapterNavProps {
  prev: ChapterNavItem | null;
  next: ChapterNavItem | null;
}

export function ChapterNav({ prev, next }: ChapterNavProps) {
  return (
    <nav className="stagger-2 mt-12 animate-slide-up border-t pt-6">
      <div className="grid grid-cols-2 gap-3">
        {/* Previous */}
        {prev ? (
          <Link
            href={`/course/${prev.slug}`}
            className="group flex items-center gap-3 overflow-hidden rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary/40 hover:bg-accent/40"
          >
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Previous
              </div>
              <div className="truncate text-sm font-medium group-hover:text-primary">
                Ch. {prev.number} — {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {/* Next */}
        {next ? (
          <Link
            href={`/course/${next.slug}`}
            className="group flex items-center justify-end gap-3 overflow-hidden rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary/40 hover:bg-accent/40"
          >
            <div className="min-w-0 text-right">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Next
              </div>
              <div className="truncate text-sm font-medium group-hover:text-primary">
                Ch. {next.number} — {next.title}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
