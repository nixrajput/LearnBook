"use client";

import { useReaderStore } from "@/stores/reader-store";
import { useActiveHeading } from "@/hooks/use-active-heading";
import { cn } from "@/lib/utils/cn";
import type { SectionSummary } from "@/types/content";

interface TableOfContentsProps {
  sections: SectionSummary[];
  open: boolean;
}

export function TableOfContents({ sections, open }: TableOfContentsProps) {
  const activeHeadingSlug = useReaderStore((s) => s.activeHeadingSlug);
  const slugs = sections.map((s) => s.slug);
  useActiveHeading(slugs);

  if (!open || sections.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        On this page
      </p>
      <ul className="space-y-0.5">
        {sections.map((section) => {
          const isActive = activeHeadingSlug === section.slug;
          // level 2 = h2 (no indent), level 3 = h3 (small indent), level 4+ = deeper
          const indent = section.level === 3 ? "pl-3" : section.level >= 4 ? "pl-5" : "";

          return (
            <li key={section.slug} className={cn("relative", indent)}>
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute -left-3 bottom-0 top-0 w-0.5 rounded-full bg-primary" />
              )}
              <a
                href={`#${section.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  const container = document.getElementById("reader-scroll-area");
                  const target = document.getElementById(section.slug);
                  if (container && target) {
                    container.scrollTo({ top: target.offsetTop - 24, behavior: "smooth" });
                  }
                }}
                className={cn(
                  "block cursor-pointer py-1 text-xs leading-snug transition-colors duration-150",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  section.level >= 3 && !isActive && "text-[11px]",
                )}
              >
                {section.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
