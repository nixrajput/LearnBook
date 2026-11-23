"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { formatPrice } from "@/lib/format-price";

interface RevenueTrendProps {
  data: { date: string; mrr: number; pro: number; premium: number }[];
  height?: number;
}

export function RevenueTrend({ data, height = 200 }: RevenueTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradMrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
          tickFormatter={(v: number) => formatPrice(v)}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              formatter={(value: number, name: string) =>
                name === "MRR" ? formatPrice(value) : String(value)
              }
            />
          }
        />
        <Legend
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
          formatter={(value: string) => (
            <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="mrr"
          name="MRR"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#gradMrr)"
        />
        <Area
          type="monotone"
          dataKey="pro"
          name="Pro"
          stroke="hsl(217, 91%, 60%)"
          strokeWidth={1.5}
          fill="none"
          strokeDasharray="4 2"
        />
        <Area
          type="monotone"
          dataKey="premium"
          name="Premium"
          stroke="hsl(45, 93%, 47%)"
          strokeWidth={1.5}
          fill="none"
          strokeDasharray="4 2"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
