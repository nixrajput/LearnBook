"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/plans";

interface PlanCardProps {
  planKey: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string;
  popular?: boolean;
  isCurrentPlan?: boolean;
  billingInterval: "monthly" | "yearly";
  offerCode?: string;
  discountPercent?: number;
  locale?: string;
}

export function PlanCard({
  planKey,
  name,
  priceMonthly,
  priceYearly,
  features,
  popular,
  isCurrentPlan,
  billingInterval,
  offerCode,
  discountPercent,
  locale = "en-US",
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = billingInterval === "yearly" ? priceYearly : priceMonthly;
  const monthlyEquivalent =
    billingInterval === "yearly" ? Math.round(priceYearly / 12) : priceMonthly;
  let featureList: (string | boolean)[] = [];
  try {
    featureList = JSON.parse(features);
  } catch {
    /* malformed features */
  }
  const isFree = planKey === "FREE";

  const displayPrice = discountPercent ? Math.round(price * (1 - discountPercent / 100)) : price;

  async function handleCheckout() {
    if (isFree || isCurrentPlan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, billingInterval, offerCode }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative rounded-xl border-2 bg-card p-8 transition-all duration-200 hover:shadow-lg ${
        popular
          ? "border-primary shadow-lg shadow-primary/10 dark:shadow-primary/5"
          : "border-border"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      <h2 className="mb-1 text-xl font-bold">{name}</h2>

      <div className="mb-1 flex items-baseline gap-1">
        {discountPercent && !isFree ? (
          <>
            <span className="text-2xl text-muted-foreground line-through">
              {formatPrice(price, locale)}
            </span>
            <span className="text-4xl font-bold text-primary">
              {formatPrice(displayPrice, locale)}
            </span>
          </>
        ) : (
          <span className="text-4xl font-bold text-primary">{formatPrice(price, locale)}</span>
        )}
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {isFree
          ? "Forever free"
          : billingInterval === "yearly"
            ? `${formatPrice(monthlyEquivalent, locale)}/mo, billed yearly`
            : "per month"}
      </p>

      {discountPercent && !isFree && (
        <div className="mb-4 rounded-md bg-emerald-500/10 px-3 py-1.5 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {discountPercent}% off applied
        </div>
      )}

      <ul className="mb-8 space-y-3">
        {featureList.map((feat, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {feat === false ? (
              <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
            ) : (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
            )}
            <span className={feat === false ? "text-muted-foreground/50" : "text-foreground"}>
              {typeof feat === "string" ? feat : ""}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={popular ? "default" : "outline"}
        disabled={isCurrentPlan || loading}
        onClick={handleCheckout}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : isFree ? (
          "Get Started"
        ) : (
          `Start ${name}`
        )}
      </Button>

      {error && <p className="mt-2 text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}
