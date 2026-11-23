"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Save, X, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatPrice } from "@/lib/format-price";

interface PackRow {
  id: string;
  packKey: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export function AdminCreditPackList({ packs }: { packs: PackRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PackRow>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);

  function startEdit(pack: PackRow) {
    setEditingId(pack.id);
    setEditData({ name: pack.name, credits: pack.credits, price: pack.price });
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
    setConfirmSave(false);
  }

  async function doSave(packKey: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/credit-packs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packKey, ...editData }),
      });
      if (res.ok) {
        setSuccess(`${packKey} updated`);
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
      setConfirmSave(false);
    }
  }

  if (packs.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-muted-foreground">
          No credit packs configured. Run the database seeder.
        </p>
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

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Pack
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Credits
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Per Credit
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {packs.map((p) => {
                const isEditing = editingId === p.id;
                const credits = isEditing ? (editData.credits ?? p.credits) : p.credits;
                const price = isEditing ? (editData.price ?? p.price) : p.price;
                const name = isEditing ? (editData.name ?? p.name) : p.name;
                const perCredit = credits > 0 ? price / credits : 0;

                return (
                  <tr
                    key={p.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        {isEditing ? (
                          <Input
                            value={name}
                            onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                            className="h-7 w-32 text-sm"
                          />
                        ) : (
                          <div>
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {p.packKey}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={credits}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, credits: parseInt(e.target.value) || 0 }))
                          }
                          className="mx-auto h-7 w-24 text-center text-sm"
                          min={1}
                        />
                      ) : (
                        <span className="text-sm font-medium tabular-nums">
                          {p.credits.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={price}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, price: parseInt(e.target.value) || 0 }))
                          }
                          className="mx-auto h-7 w-24 text-center text-sm"
                          min={1}
                        />
                      ) : (
                        <span className="text-sm tabular-nums">{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs tabular-nums text-muted-foreground">
                      {formatPrice(Number(perCredit.toFixed(2)))}/cr
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.popular ? (
                        <Badge className="bg-primary/10 text-[10px] text-primary">Popular</Badge>
                      ) : (
                        <Badge
                          variant={p.isActive ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isEditing ? (
                        <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmSave(true)}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmSave}
        onOpenChange={(open) => !open && setConfirmSave(false)}
        title="Save Credit Pack Changes"
        description="Are you sure you want to save these changes? Updated pricing will apply to all future purchases."
        confirmLabel="Save Changes"
        onConfirm={() => {
          const pack = packs.find((p) => p.id === editingId);
          if (pack) doSave(pack.packKey);
        }}
        loading={saving}
      />
    </div>
  );
}
