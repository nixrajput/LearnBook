"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function CreditsBadge() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ai/credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits ?? null))
      .catch(() => {});
  }, []);

  if (credits === null) return null;

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
      <Sparkles className="h-3 w-3 text-amber-500" />
      <span className="tabular-nums">{credits}</span>
    </div>
  );
}
