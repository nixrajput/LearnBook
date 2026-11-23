"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Save, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/plans";

interface PlanRow {
  id: string;
  planKey: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  features: string;
  maxNotes: number;
  maxBookmarks: number;
  maxHighlights: number;
  maxCourses: number;
  isActive: boolean;
  sortOrder: number;
}

function limitLabel(value: number): string {
  return value === -1 ? "Unlimited" : String(value);
}

export function AdminPlanList({
  plans,
  usersByPlan,
}: {
  plans: PlanRow[];
  usersByPlan: Record<string, number>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PlanRow>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function startEdit(plan: PlanRow) {
    setEditingId(plan.id);
    setEditData({
      maxNotes: plan.maxNotes,
      maxBookmarks: plan.maxBookmarks,
      maxHighlights: plan.maxHighlights,
      maxCourses: plan.maxCourses,
    });
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit(planKey: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, ...editData }),
      });
      if (res.ok) {
        setSuccess(`${planKey} updated`);
        setEditingId(null);
        setEditData({});
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update");
      }
    } finally {
      setSaving(false);
    }
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-muted-foreground">No plans configured. Run the database seeder.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/5 px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {success}
        </div>
      )}

      <div className="space-y-4">
        {plans.map((p) => {
          const isEditing = editingId === p.id;
          const users = usersByPlan[p.planKey] ?? 0;

          return (
            <div key={p.id} className="rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <Badge
                        className={`text-[10px] ${p.planKey === "PRO" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : p.planKey === "PREMIUM" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {p.planKey}
                      </Badge>
                      <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px]">
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(p.priceMonthly)}/mo · {formatPrice(p.priceYearly)}/yr · {users}{" "}
                      user{users !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveEdit(p.planKey)}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <LimitField
                    label="Max Notes"
                    value={isEditing ? (editData.maxNotes ?? p.maxNotes) : p.maxNotes}
                    editing={isEditing}
                    onChange={(v) => setEditData((d) => ({ ...d, maxNotes: v }))}
                  />
                  <LimitField
                    label="Max Bookmarks"
                    value={isEditing ? (editData.maxBookmarks ?? p.maxBookmarks) : p.maxBookmarks}
                    editing={isEditing}
                    onChange={(v) => setEditData((d) => ({ ...d, maxBookmarks: v }))}
                  />
                  <LimitField
                    label="Max Highlights"
                    value={
                      isEditing ? (editData.maxHighlights ?? p.maxHighlights) : p.maxHighlights
                    }
                    editing={isEditing}
                    onChange={(v) => setEditData((d) => ({ ...d, maxHighlights: v }))}
                  />
                  <LimitField
                    label="Max Courses"
                    value={isEditing ? (editData.maxCourses ?? p.maxCourses) : p.maxCourses}
                    editing={isEditing}
                    onChange={(v) => setEditData((d) => ({ ...d, maxCourses: v }))}
                  />
                </div>

                {/* Stripe status */}
                <div className="mt-4 flex gap-4 text-[10px] text-muted-foreground">
                  <span>
                    Stripe monthly:{" "}
                    {p.stripePriceIdMonthly ? (
                      <span className="text-emerald-600 dark:text-emerald-400">configured</span>
                    ) : (
                      <span className="text-destructive">not set</span>
                    )}
                  </span>
                  <span>
                    Stripe yearly:{" "}
                    {p.stripePriceIdYearly ? (
                      <span className="text-emerald-600 dark:text-emerald-400">configured</span>
                    ) : (
                      <span className="text-destructive">not set</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LimitField({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: number;
  editing: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-medium text-muted-foreground">{label}</div>
      {editing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="h-8 text-sm"
          min={-1}
          placeholder="-1 for unlimited"
        />
      ) : (
        <div className="text-sm font-medium tabular-nums">{limitLabel(value)}</div>
      )}
    </div>
  );
}
