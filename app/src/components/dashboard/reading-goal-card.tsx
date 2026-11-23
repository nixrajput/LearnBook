"use client";

import { useState } from "react";
import { Target, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReadingGoalCardProps {
  dailyMinutes: number;
  weeklyChapters: number;
  todayMinutes: number;
  weekChapters: number;
  isPro: boolean;
}

export function ReadingGoalCard({
  dailyMinutes,
  weeklyChapters,
  todayMinutes,
  weekChapters,
  isPro,
}: ReadingGoalCardProps) {
  const [editing, setEditing] = useState(false);
  const [daily, setDaily] = useState(dailyMinutes);
  const [weekly, setWeekly] = useState(weeklyChapters);
  const [saving, setSaving] = useState(false);

  const dailyPct = Math.min(100, Math.round((todayMinutes / dailyMinutes) * 100));
  const weeklyPct = Math.min(100, Math.round((weekChapters / weeklyChapters) * 100));

  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyMinutes: daily, weeklyChapters: weekly }),
      });
      if (res.ok) {
        setEditing(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save goals");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-slide-up rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10">
            <Target className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <h3 className="font-semibold">Reading Goals</h3>
        </div>
        {!editing ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSave}
              disabled={saving}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setEditing(false);
                setDaily(dailyMinutes);
                setWeekly(weeklyChapters);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        {/* Daily goal */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily reading</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={daily}
                  onChange={(e) => setDaily(Math.max(5, parseInt(e.target.value) || 5))}
                  className="h-6 w-16 text-center text-xs"
                  min={5}
                  max={480}
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            ) : (
              <span className="text-sm font-medium">
                {todayMinutes}/{dailyMinutes} min
              </span>
            )}
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-rose-500 transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-muted-foreground">{dailyPct}%</div>
        </div>

        {/* Weekly goal */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Weekly chapters</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={weekly}
                  onChange={(e) => setWeekly(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-6 w-16 text-center text-xs"
                  min={1}
                  max={100}
                />
                <span className="text-xs text-muted-foreground">ch</span>
              </div>
            ) : (
              <span className="text-sm font-medium">
                {weekChapters}/{weeklyChapters} ch
              </span>
            )}
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-muted-foreground">{weeklyPct}%</div>
        </div>
      </div>
      {error && (
        <div className="border-t px-6 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
