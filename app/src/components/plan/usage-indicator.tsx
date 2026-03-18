import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface UsageIndicatorProps {
  /** e.g. "notes", "bookmarks", "highlights" */
  label: string;
  current: number;
  /** -1 means unlimited */
  limit: number;
}

export function UsageIndicator({ label, current, limit }: UsageIndicatorProps) {
  if (limit === -1) return null; // unlimited — nothing to show

  const pct = Math.round((current / limit) * 100);
  const nearLimit = pct >= 80;
  const atLimit = current >= limit;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
        atLimit
          ? "border-destructive/30 bg-destructive/5"
          : nearLimit
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-muted"
      }`}
    >
      <div className="flex-1">
        <span className="font-medium tabular-nums">
          {current}/{limit}
        </span>{" "}
        <span className="text-muted-foreground">{label} used</span>
        {atLimit && <span className="ml-2 text-xs text-destructive">— limit reached</span>}
      </div>
      {nearLimit && (
        <Link
          href="/pricing"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Upgrade for unlimited
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
