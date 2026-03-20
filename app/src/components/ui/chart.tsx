"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

// Chart config for consistent theming
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ComponentType;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  const cssVars = Object.entries(config).reduce(
    (vars, [key, value]) => {
      vars[`--color-${key}`] = value.color;
      return vars;
    },
    {} as Record<string, string>,
  );

  return (
    <div
      className={cn("flex aspect-auto justify-center text-xs", className)}
      style={cssVars}
      {...props}
    >
      {children}
    </div>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  formatter?: (value: number, name: string) => string;
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  hideLabel,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      {!hideLabel && label && (
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium tabular-nums">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
