"use client";

import { useState, useEffect } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OfferBannerProps {
  planKey: string;
  onOfferApplied: (code: string, discountPercent: number) => void;
  onOfferRemoved: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
}

export function OfferBanner({
  planKey,
  onOfferApplied,
  onOfferRemoved,
  appliedCode,
  appliedDiscount,
}: OfferBannerProps) {
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [planKey]);

  async function handleValidate() {
    if (!code.trim()) return;
    setValidating(true);
    setError(null);

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), planKey }),
      });
      const data = await res.json();

      if (data.valid) {
        onOfferApplied(code.trim().toUpperCase(), data.discountPercent);
        setCode("");
      } else {
        setError(data.reason ?? "Invalid code");
      }
    } catch {
      setError("Failed to validate code");
    } finally {
      setValidating(false);
    }
  }

  if (appliedCode) {
    return (
      <div className="animate-fade-in rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">
              Code <span className="font-mono">{appliedCode}</span> applied — {appliedDiscount}% off
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onOfferRemoved}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Have a promo code?</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="h-8 font-mono text-xs uppercase"
          onKeyDown={(e) => e.key === "Enter" && handleValidate()}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0"
          onClick={handleValidate}
          disabled={validating || !code.trim()}
        >
          {validating ? "..." : "Apply"}
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
