"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { PlanCard } from "@/components/pricing/plan-card";
import { OfferBanner } from "@/components/pricing/offer-banner";
import type { PlanInfo } from "@/lib/plans";
import { formatPrice } from "@/lib/plans";

interface PricingPageClientProps {
  plans: PlanInfo[];
  currentPlan?: string;
  isLoggedIn?: boolean;
  locale?: string;
}

export const COMPARISON_ROWS = [
  { label: "Courses" },
  { label: "Notes, Bookmarks, Highlights" },
  { label: "PDF/EPUB Uploads" },
  { label: "Web Articles" },
  { label: "AI Credits/month" },
  { label: "Flashcard Decks" },
  { label: "Analytics" },
  { label: "AI Study Sessions" },
  { label: "Knowledge Graph" },
  { label: "Study Groups" },
  { label: "Export & Support" },
];

/** Extract the comparison value for a row from a plan's feature list. */
function getComparisonValue(features: string, rowIndex: number): string | boolean {
  try {
    const list: (string | boolean)[] = JSON.parse(features);
    return list[rowIndex] ?? false;
  } catch {
    return false;
  }
}

export function PricingPageClient({
  plans,
  currentPlan,
  isLoggedIn,
  locale = "en-US",
}: PricingPageClientProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [offerCode, setOfferCode] = useState<string | undefined>();
  const [discountPercent, setDiscountPercent] = useState<number | undefined>();

  // Default to the first paid plan for offer banner scope
  const firstPaidPlan = plans.find((p) => p.planKey !== "FREE");

  return (
    <>
      {/* Billing toggle */}
      <div className="mb-10 flex animate-slide-up justify-center">
        <div className="inline-flex items-center rounded-lg border bg-muted/40 p-1">
          <button
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              billingInterval === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingInterval("monthly")}
          >
            Monthly
          </button>
          <button
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              billingInterval === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingInterval("yearly")}
          >
            Yearly
            <span className="ml-1.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <div key={plan.planKey} className={`stagger-${i + 1} animate-slide-up`}>
            <PlanCard
              planKey={plan.planKey}
              name={plan.name}
              priceMonthly={plan.priceMonthly}
              priceYearly={plan.priceYearly}
              features={plan.features}
              featureLabels={COMPARISON_ROWS.map((r) => r.label)}
              popular={plan.sortOrder === 1}
              isCurrentPlan={currentPlan === plan.planKey}
              isLoggedIn={isLoggedIn}
              billingInterval={billingInterval}
              offerCode={offerCode}
              discountPercent={plan.planKey !== "FREE" ? discountPercent : undefined}
              locale={locale}
            />
          </div>
        ))}
      </div>

      {/* Offer code */}
      {firstPaidPlan && (
        <div className="stagger-4 mx-auto mb-16 max-w-sm animate-slide-up">
          <OfferBanner
            planKey={firstPaidPlan.planKey}
            onOfferApplied={(code, discount) => {
              setOfferCode(code);
              setDiscountPercent(discount);
            }}
            onOfferRemoved={() => {
              setOfferCode(undefined);
              setDiscountPercent(undefined);
            }}
            appliedCode={offerCode}
            appliedDiscount={discountPercent}
          />
        </div>
      )}

      {/* Feature comparison table */}
      <div className="animate-fade-in overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Full Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Feature
                </th>
                {plans.map((p) => (
                  <th
                    key={p.planKey}
                    className={`px-6 py-3 text-center text-sm font-semibold ${
                      p.sortOrder === 1 ? "text-primary" : ""
                    }`}
                  >
                    {p.name}
                    <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                      {formatPrice(
                        billingInterval === "yearly" ? p.priceYearly : p.priceMonthly,
                        locale,
                      )}
                      {p.priceMonthly > 0 && (billingInterval === "yearly" ? "/yr" : "/mo")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`transition-colors ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                >
                  <td className="px-6 py-3 text-sm text-muted-foreground">{row.label}</td>
                  {plans.map((plan) => {
                    const value = getComparisonValue(plan.features, i);
                    return (
                      <td key={plan.planKey} className="px-6 py-3 text-center">
                        {value === false ? (
                          <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        ) : value === true ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="text-sm">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
