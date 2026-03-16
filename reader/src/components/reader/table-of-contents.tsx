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
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <nav className="space-y-1">
          {sections.map((section) => (
            <a
              key={section.slug}
              href={`#${section.slug}`}
              className={cn(
                "block py-0.5 text-xs leading-relaxed transition-colors",
                section.level === 4 && "pl-3",
                activeHeadingSlug === section.slug
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {section.heading}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
