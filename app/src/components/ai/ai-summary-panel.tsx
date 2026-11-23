"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiSummaryPanelProps {
  chapterId: string;
  chapterTitle: string;
}

export function AiSummaryPanel({ chapterId, chapterTitle }: AiSummaryPanelProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setOpen(true);
    setLoading(true);
    setSummary("");
    setError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to generate summary");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setSummary(result);
      }
    } catch {
      setError("Failed to connect to AI");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5" onClick={handleGenerate}>
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        AI Summary
      </Button>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-amber-500" />
          AI Summary — {chapterTitle}
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="max-h-96 overflow-y-auto p-4">
        {loading && !summary && (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating summary...
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {summary && (
          <div className="prose prose-sm prose-neutral dark:prose-invert">
            <div className="whitespace-pre-wrap leading-relaxed">{summary}</div>
          </div>
        )}
      </div>
    </div>
  );
}
