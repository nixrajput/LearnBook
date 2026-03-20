"use client";

import { Clock, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
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

  const chartData = insights.hourDistribution.map((secs, hour) => ({
    name: `${hour}:00`,
    value: Math.round(secs / 60),
    isPeak: hour === insights.peakHour,
  }));

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

      <div className="mt-4">
        <div className="mb-1 text-xs text-muted-foreground">Reading hours</div>
        <ResponsiveContainer width="100%" height={64}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <Tooltip content={<ChartTooltipContent formatter={(v) => `${v} min`} />} />
            <Bar dataKey="value" name="Minutes" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isPeak ? "hsl(var(--chart-2))" : "hsl(var(--chart-2) / 0.35)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
