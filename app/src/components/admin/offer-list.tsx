"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, ToggleLeft, ToggleRight, Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface OfferRow {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  applicablePlans: string;
  maxRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
}

export function AdminOfferList({ offers }: { offers: OfferRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OfferRow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  async function toggleActive(id: string, isActive: boolean) {
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setLoading(deleteTarget.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/offers/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Failed");
    } finally {
      setLoading(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-3.5 w-3.5" />
          {showCreate ? "Cancel" : "Create Offer"}
        </Button>
      </div>

      {showCreate && (
        <CreateOfferForm
          onCreated={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      )}

      {error && (
        <div className="rounded-lg bg-destructive/5 px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="rounded-xl border bg-card py-12 text-center">
          <p className="text-muted-foreground">No offers yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => {
            let plans: string[] = [];
            try {
              plans = JSON.parse(o.applicablePlans);
            } catch {
              /* */
            }
            return (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border bg-card px-5 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{o.code}</span>
                    <button
                      onClick={() => copyCode(o.code, o.id)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Copy code"
                    >
                      {copiedId === o.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    <Badge variant={o.isActive ? "default" : "secondary"} className="text-[10px]">
                      {o.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      {o.discountPercent}% off
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{o.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Plans: {plans.join(", ") || "—"}</span>
                    <span>
                      Redeemed: {o.currentRedemptions}
                      {o.maxRedemptions ? `/${o.maxRedemptions}` : ""}
                    </span>
                    {o.validUntil && (
                      <span>Expires: {new Date(o.validUntil).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(o.id, o.isActive)}
                    disabled={loading === o.id}
                  >
                    {o.isActive ? (
                      <ToggleRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(o)}
                    disabled={loading === o.id}
                  >
                    {loading === o.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Offer"
        description={`Are you sure you want to delete offer "${deleteTarget?.code}"? This action cannot be undone.`}
        confirmLabel="Delete Offer"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={loading === deleteTarget?.id}
      />
    </div>
  );
}

function CreateOfferForm({ onCreated }: { onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          description,
          discountPercent: discount,
          applicablePlans: ["PRO", "PREMIUM"],
        }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create offer");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="LAUNCH20"
            className="mt-1 font-mono uppercase"
          />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Launch discount"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Discount %</Label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value) || 10)}
            min={1}
            max={100}
            className="mt-1"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <Button
        className="mt-4"
        size="sm"
        onClick={handleCreate}
        disabled={saving || !code.trim() || !description.trim()}
      >
        {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
        Create Offer
      </Button>
    </div>
  );
}
