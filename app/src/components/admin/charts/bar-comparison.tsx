"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";

interface BarComparisonProps {
  data: { name: string; value: number; color?: string }[];
  title: string;
  height?: number;
  color?: string;
}

export function BarComparison({
  data,
  title,
  height = 200,
  color = "hsl(var(--primary))",
}: BarComparisonProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              className="text-[10px]"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              className="text-[10px]"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" name={title} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
