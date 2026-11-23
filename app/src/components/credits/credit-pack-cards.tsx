"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatPrice } from "@/lib/plans";

interface CreditPackData {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
}

export function CreditPackCards({ packs, locale }: { packs: CreditPackData[]; locale?: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CreditPackData | null>(null);

  async function handlePurchase(pack: CreditPackData) {
    setLoading(pack.id);
    setError(null);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Purchase failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((pack) => {
          const perCredit = pack.price / pack.credits;
          return (
            <div
              key={pack.id}
              className={`relative rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md ${
                pack.popular ? "border-primary shadow-sm" : ""
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Best Value
                  </span>
                </div>
              )}
              <div className="mb-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-lg font-bold tabular-nums">
                  {pack.credits.toLocaleString()}
                </span>
              </div>
              <p className="mb-1 text-xs text-muted-foreground">{pack.name} Pack</p>
              <div className="mb-3">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(pack.price, locale)}
                </span>
                <span className="ml-1 text-[10px] text-muted-foreground">
                  ({formatPrice(Number(perCredit.toFixed(2)), locale)}/credit)
                </span>
              </div>
              <Button
                className="w-full"
                size="sm"
                variant={pack.popular ? "default" : "outline"}
                disabled={loading === pack.id}
                onClick={() => setConfirmTarget(pack)}
              >
                {loading === pack.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Buy Credits"
                )}
              </Button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-center text-xs text-destructive">{error}</p>}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Purchase Credits"
        description={`Buy ${confirmTarget?.credits.toLocaleString()} credits for ${confirmTarget ? formatPrice(confirmTarget.price, locale) : ""}? You'll be redirected to Stripe to complete the payment.`}
        confirmLabel="Proceed to Payment"
        onConfirm={() => {
          if (confirmTarget) {
            setConfirmTarget(null);
            handlePurchase(confirmTarget);
          }
        }}
      />
    </div>
  );
}
