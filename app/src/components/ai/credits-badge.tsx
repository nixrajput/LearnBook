"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function CreditsBadge() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ai/credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits ?? null))
      .catch(() => {});
  }, []);

  // Always render the container to maintain consistent DOM tree (prevents Radix hydration mismatch)
  return (
    <Link
      href="/credits"
      className="flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title="AI Credits"
    >
      <Sparkles className="h-3 w-3 text-amber-500" />
      <span className="tabular-nums">{credits ?? "—"}</span>
    </Link>
  );
}
