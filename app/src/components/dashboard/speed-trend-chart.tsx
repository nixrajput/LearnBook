import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReadingSpeedStats } from "@/lib/content";

interface SpeedTrendChartProps {
  stats: ReadingSpeedStats;
}

export function SpeedTrendChart({ stats }: SpeedTrendChartProps) {
  if (stats.sessions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-sky-500" />
          Reading Speed
        </h3>
        <p className="text-sm text-muted-foreground">Start reading to track your WPM trends.</p>
      </div>
    );
  }

  const maxWpm = Math.max(...stats.sessions.map((s) => s.wpm), 1);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-sky-500" />
          Reading Speed
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums">{stats.avgWpm}</span>
          <span className="text-sm text-muted-foreground">avg WPM</span>
          {stats.trend !== null && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${stats.trend > 0 ? "text-emerald-500" : stats.trend < 0 ? "text-red-500" : "text-muted-foreground"}`}
            >
              {stats.trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : stats.trend < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {stats.trend > 0 ? "+" : ""}
              {stats.trend}
            </span>
          )}
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="flex h-24 items-end gap-1">
        {stats.sessions.slice(-20).map((s, i) => {
          const heightPct = Math.max(4, Math.round((s.wpm / maxWpm) * 100));
          return (
            <div
              key={`${s.date}-${i}`}
              className="flex-1 rounded-t bg-sky-500 transition-all hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-300"
              style={{ height: `${heightPct}%` }}
              title={`${s.date}: ${s.wpm} WPM`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{stats.sessions.slice(-20)[0]?.date ?? ""}</span>
        <span>{stats.sessions[stats.sessions.length - 1]?.date ?? ""}</span>
      </div>
    </div>
  );
}
