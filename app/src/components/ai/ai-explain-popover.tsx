"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiExplainPopoverProps {
  chapterId: string;
}

export function AiExplainPopover({ chapterId }: AiExplainPopoverProps) {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < 5) {
      if (!showResult) {
        setPosition(null);
        setSelectedText("");
      }
      return;
    }

    const range = selection?.getRangeAt(0);
    if (!range) return;

    const rect = range.getBoundingClientRect();
    const scrollArea = document.getElementById("reader-scroll-area");
    const scrollTop = scrollArea?.scrollTop ?? 0;

    setSelectedText(text);
    setPosition({
      top: rect.bottom + scrollTop + 8,
      left: Math.max(16, rect.left),
    });
    setShowResult(false);
    setExplanation("");
  }, [showResult]);

  // Attach listener via useEffect with proper cleanup
  useEffect(() => {
    const el = document.getElementById("reader-scroll-area");
    if (!el) return;

    el.addEventListener("mouseup", handleMouseUp);
    return () => el.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  async function handleExplain() {
    setLoading(true);
    setShowResult(true);
    setExplanation("");

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, chapterId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExplanation(data.error ?? "Failed to explain");
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
        setExplanation(result);
      }
    } catch {
      setExplanation("Failed to connect to AI");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setPosition(null);
    setSelectedText("");
    setShowResult(false);
    setExplanation("");
  }

  if (!position || !selectedText) return null;

  return (
    <div
      className="absolute z-50 w-80 animate-fade-in rounded-xl border bg-card p-4 shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      {!showResult ? (
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5" onClick={handleExplain}>
            <Sparkles className="h-3.5 w-3.5" />
            Explain
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClose}>
            Dismiss
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-3 w-3" />
              AI Explanation
            </div>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleClose}>
              Close
            </Button>
          </div>
          <blockquote className="mb-3 border-l-2 border-muted-foreground/30 pl-2 text-xs italic text-muted-foreground">
            {selectedText.slice(0, 100)}
            {selectedText.length > 100 ? "..." : ""}
          </blockquote>
          {loading && !explanation && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
          {explanation && (
            <div className="prose prose-sm prose-neutral max-h-64 overflow-y-auto dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
