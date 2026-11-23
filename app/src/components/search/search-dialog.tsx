"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, StickyNote } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/stores/search-store";
import { debounce } from "@/lib/utils/debounce";
import type { SearchResult } from "@/types/database";

export function SearchDialog() {
  const router = useRouter();
  const { isOpen, query, results, isLoading, setOpen, setQuery, setResults, setLoading } =
    useSearchStore();

  const search = useRef(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
  ).current;

  useEffect(() => {
    search(query);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    const url = result.sectionSlug
      ? `/course/${result.chapterSlug}#${result.sectionSlug}`
      : `/course/${result.chapterSlug}`;
    router.push(url);
    setOpen(false);
    setQuery("");
  };

  const iconForType = (type: string) => {
    if (type === "chapter") return <BookOpen className="h-4 w-4 text-blue-500" />;
    if (type === "section") return <FileText className="h-4 w-4 text-green-500" />;
    return <StickyNote className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        <div className="border-b px-4 py-3">
          <Input
            autoFocus
            placeholder="Search chapters, sections, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Searching…</div>
          )}
          {!isLoading && query && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          )}
          {!isLoading && !query && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Type to search across chapters, sections, and your notes.
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent"
            >
              <span className="mt-0.5 shrink-0">{iconForType(result.type)}</span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {result.heading ?? result.chapterTitle}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Ch. {result.chapterNumber} — {result.chapterTitle}
                </div>
                {result.snippet && (
                  <div
                    className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
          <span>
            <kbd className="font-mono">↑↓</kbd> to navigate
          </span>
          <span>
            <kbd className="font-mono">↵</kbd> to select
          </span>
          <span>
            <kbd className="font-mono">esc</kbd> to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
