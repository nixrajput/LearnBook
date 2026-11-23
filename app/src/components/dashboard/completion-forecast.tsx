import { Calendar, CheckCircle2 } from "lucide-react";
import type { CompletionForecast as ForecastData } from "@/lib/content";

interface CompletionForecastProps {
  forecast: ForecastData;
}

export function CompletionForecast({ forecast }: CompletionForecastProps) {
  if (forecast.remainingChapters === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Course Complete
        </h3>
        <p className="text-sm text-muted-foreground">
          Congratulations! You&apos;ve finished this course.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <Calendar className="h-4 w-4 text-amber-500" />
        Completion Forecast
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {forecast.estimatedDaysLeft !== null ? `${forecast.estimatedDaysLeft}d` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">days remaining</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{forecast.estimatedDate ?? "—"}</div>
          <div className="text-xs text-muted-foreground">est. completion</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums">{forecast.avgChaptersPerWeek}</div>
          <div className="text-xs text-muted-foreground">ch/week pace</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums">{forecast.remainingChapters}</div>
          <div className="text-xs text-muted-foreground">chapters left</div>
        </div>
      </div>
    </div>
  );
}
