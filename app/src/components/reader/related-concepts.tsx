"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";

interface RelatedConcept {
  id: string;
  name: string;
  linkCount: number;
}

export function RelatedConcepts({ chapterId }: { chapterId: string }) {
  const [concepts, setConcepts] = useState<RelatedConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/knowledge-graph")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        // Filter concepts that have links to this chapter
        const related = (data.nodes ?? [])
          .filter((n: { chapters: string[] }) => n.chapters?.includes(chapterId))
          .slice(0, 10);
        setConcepts(related);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (loading || concepts.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
        <Sparkles className="h-3 w-3 text-amber-500" />
        Related Concepts
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {concepts.map((c) => (
          <Link
            key={c.id}
            href="/knowledge"
            className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
