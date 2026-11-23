"use client";

import { useState } from "react";
import { Globe, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImportUrlDialog({ onImported }: { onImported?: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/content/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(`Imported "${data.title}" (${data.wordCount} words)`);
        setUrl("");
        onImported?.();
        setTimeout(() => setResult(null), 5000);
      } else {
        setError(data.error ?? "Failed to import");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-violet-500" />
        <span className="text-sm font-medium">Import Web Article</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Paste a URL to save any web article to your library.
      </p>
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="h-9 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleImport()}
        />
        <Button
          size="sm"
          className="h-9 shrink-0"
          onClick={handleImport}
          disabled={loading || !url.trim()}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Import"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {result && (
        <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {result}
        </p>
      )}
    </div>
  );
}
