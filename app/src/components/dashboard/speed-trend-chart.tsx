"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
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

  const chartData = stats.sessions.slice(-20).map((s) => ({
    date: s.date,
    value: s.wpm,
  }));

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

      <ResponsiveContainer width="100%" height={96}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <Tooltip content={<ChartTooltipContent formatter={(v) => `${v} WPM`} />} />
          <Area
            type="monotone"
            dataKey="value"
            name="WPM"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#speedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
