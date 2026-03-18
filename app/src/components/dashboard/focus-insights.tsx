import { Clock, Zap } from "lucide-react";
import type { FocusInsights as FocusData } from "@/lib/content";

interface FocusInsightsProps {
  insights: FocusData;
}

export function FocusInsights({ insights }: FocusInsightsProps) {
  if (insights.totalSessions === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-violet-500" />
          Focus Insights
        </h3>
        <p className="text-sm text-muted-foreground">
          Start reading sessions to unlock focus analytics.
        </p>
      </div>
    );
  }

  const maxBucket = Math.max(...insights.hourDistribution, 1);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-violet-500" />
          Focus Insights
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-amber-500" />
          Peak: {insights.peakHourLabel}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold tabular-nums">{insights.avgSessionMin}m</div>
          <div className="text-xs text-muted-foreground">avg session</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{insights.totalSessions}</div>
          <div className="text-xs text-muted-foreground">total sessions</div>
        </div>
      </div>

      {/* Hour distribution chart */}
      <div className="mt-4">
        <div className="mb-1 text-xs text-muted-foreground">Reading hours</div>
        <div className="flex h-16 items-end gap-px">
          {insights.hourDistribution.map((secs, hour) => {
            const heightPct = Math.max(secs > 0 ? 4 : 0, Math.round((secs / maxBucket) * 100));
            const isPeak = hour === insights.peakHour;
            return (
              <div
                key={hour}
                className={`flex-1 rounded-t transition-all ${isPeak ? "bg-violet-500" : "bg-violet-500/30"}`}
                style={{ height: `${heightPct}%` }}
                title={`${hour}:00 — ${Math.round(secs / 60)}min`}
              />
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
      </div>
    </div>
  );
}
