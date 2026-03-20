"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, BookOpen, StickyNote, Bookmark, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConceptSource {
  sourceType: string;
  sourceId: string;
  chapterId: string;
  courseId: string;
  chapterTitle: string;
  chapterSlug: string;
  chapterNumber: number;
  courseTitle: string;
}

const SOURCE_ICONS: Record<string, React.ElementType> = {
  highlight: Sparkles,
  note: StickyNote,
  flashcard: BookOpen,
};

export function ConceptPanel({ conceptId }: { conceptId: string | null }) {
  const [concept, setConcept] = useState<{ id: string; name: string } | null>(null);
  const [sources, setSources] = useState<ConceptSource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conceptId) {
      setConcept(null);
      setSources([]);
      return;
    }

    setLoading(true);
    fetch(`/api/knowledge-graph/concept/${conceptId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setConcept(data.concept ?? null);
        setSources(data.sources ?? []);
      })
      .catch(() => {
        setConcept(null);
        setSources([]);
      })
      .finally(() => setLoading(false));
  }, [conceptId]);

  if (!conceptId) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        Click a concept node to see its connections
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-card p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!concept) return null;

  // Group sources by course → chapter
  const byCourse = sources.reduce<
    Record<string, { courseTitle: string; chapters: ConceptSource[] }>
  >((acc, s) => {
    if (!acc[s.courseId]) acc[s.courseId] = { courseTitle: s.courseTitle, chapters: [] };
    acc[s.courseId].chapters.push(s);
    return acc;
  }, {});

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-5 py-3">
        <h3 className="text-sm font-semibold">{concept.name}</h3>
        <p className="text-xs text-muted-foreground">
          {sources.length} connection{sources.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="divide-y">
        {Object.entries(byCourse).map(([courseId, { courseTitle, chapters }]) => (
          <div key={courseId} className="px-5 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{courseTitle}</p>
            <div className="space-y-1.5">
              {chapters.map((s, i) => {
                const Icon = SOURCE_ICONS[s.sourceType] ?? Bookmark;
                return (
                  <Link
                    key={`${s.sourceId}-${i}`}
                    href={`/course/${s.chapterSlug}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted"
                  >
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span>
                      Ch. {s.chapterNumber} — {s.chapterTitle}
                    </span>
                    <Badge className="ml-auto text-[8px]">{s.sourceType}</Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
