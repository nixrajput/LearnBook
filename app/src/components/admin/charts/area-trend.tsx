"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";

interface AreaTrendProps {
  data: { date: string; value: number }[];
  title: string;
  subtitle: string;
  total: number;
  unit: string;
  color?: string;
  height?: number;
}

export function AreaTrend({
  data,
  title,
  subtitle,
  total,
  unit,
  color = "hsl(var(--primary))",
  height = 160,
}: AreaTrendProps) {
  const gradientId = `gradient-${title.replace(/\s+/g, "-")}`;

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">{title}</h4>
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums">{total.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">{unit}</div>
          </div>
        </div>
      </div>
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => d.slice(5)}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltipContent labelFormatter={(d) => d} />} />
            <Area
              type="monotone"
              dataKey="value"
              name={title}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
