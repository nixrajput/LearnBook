"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiGenerateButtonProps {
  deckId: string;
  chapterId?: string;
  highlightText?: string;
  noteContent?: string;
  onGenerated?: (count: number) => void;
}

export function AiGenerateButton({
  deckId,
  chapterId,
  highlightText,
  noteContent,
  onGenerated,
}: AiGenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, chapterId, highlightText, noteContent }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(`Generated ${data.count} flashcards`);
        onGenerated?.(data.count);
        setTimeout(() => setResult(null), 3000);
      } else {
        setError(data.error ?? "Generation failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        )}
        {loading ? "Generating..." : "AI Generate"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {result && <p className="text-xs text-emerald-600 dark:text-emerald-400">{result}</p>}
    </div>
  );
}
