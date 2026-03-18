import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for LearnBook.",
};

const plans = [
  {
    key: "FREE",
    name: "Starter",
    price: { monthly: "Free", yearly: "Free" },
    color: "border-border",
    features: {
      courses: "3 courses",
      notes: "50 notes",
      bookmarks: "25 bookmarks",
      highlights: "50 highlights",
      analytics: "Basic progress",
      goals: false,
      export: false,
      support: "Community",
    },
    cta: "Get Started",
    href: "/login",
    variant: "outline" as const,
  },
  {
    key: "PRO",
    name: "Pro",
    price: { monthly: "$7.99", yearly: "$79.90" },
    popular: true,
    color: "border-primary",
    features: {
      courses: "Unlimited courses",
      notes: "Unlimited notes",
      bookmarks: "Unlimited bookmarks",
      highlights: "Unlimited highlights",
      analytics: "Full stats + streaks",
      goals: true,
      export: "Markdown export",
      support: "Email support",
    },
    cta: "Start Pro",
    href: "/login",
    variant: "default" as const,
  },
  {
    key: "PREMIUM",
    name: "Premium",
    price: { monthly: "$14.99", yearly: "$149.90" },
    color: "border-border",
    features: {
      courses: "Unlimited + exclusive",
      notes: "Unlimited notes",
      bookmarks: "Unlimited bookmarks",
      highlights: "Unlimited highlights",
      analytics: "Advanced analytics",
      goals: true,
      export: "All formats",
      support: "Priority support",
    },
    cta: "Go Premium",
    href: "/login",
    variant: "outline" as const,
  },
];

const comparisonRows = [
  { label: "Courses", keys: ["courses"] },
  { label: "Notes", keys: ["notes"] },
  { label: "Bookmarks", keys: ["bookmarks"] },
  { label: "Highlights", keys: ["highlights"] },
  { label: "Analytics", keys: ["analytics"] },
  { label: "Reading goals", keys: ["goals"] },
  { label: "Export", keys: ["export"] },
  { label: "Support", keys: ["support"] },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === false) return <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  if (value === true) return <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />;
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground">
          Start free. Upgrade when you need more power.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-xl border-2 bg-card p-8 ${plan.color} ${plan.popular ? "shadow-lg" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            <h2 className="mb-1 text-xl font-bold">{plan.name}</h2>
            <div className="mb-1 text-4xl font-bold text-primary">{plan.price.monthly}</div>
            <p className="mb-6 text-sm text-muted-foreground">
              {plan.price.monthly === "Free" ? "Forever free" : "per month"}
            </p>
            <ul className="mb-8 space-y-3">
              {Object.entries(plan.features).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2 text-sm">
                  {v === false ? (
                    <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  )}
                  <span className={v === false ? "text-muted-foreground/50" : "text-foreground"}>
                    {v === false
                      ? (comparisonRows.find((r) => r.keys[0] === k)?.label ?? k)
                      : String(v)}
                  </span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={plan.variant} asChild>
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="overflow-hidden rounded-xl border bg-card">
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
                    key={p.key}
                    className={`px-6 py-3 text-center text-sm font-semibold ${p.popular ? "text-primary" : ""}`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{row.label}</td>
                  {plans.map((plan) => (
                    <td key={plan.key} className="px-6 py-3 text-center">
                      <FeatureValue
                        value={plan.features[row.keys[0] as keyof typeof plan.features]}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ / CTA */}
      <div className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">
          Questions? All plans include a 14-day money-back guarantee.
        </p>
        <Button size="lg" asChild>
          <Link href="/login">Get Started Free</Link>
        </Button>
      </div>
    </div>
  );
}
