// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
// jest-dom matchers loaded via setup-dom.ts

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/pricing",
}));

import { PricingPageClient } from "@/components/pricing/pricing-page-client";
import type { PlanInfo } from "@/lib/plans";

const mockPlans: PlanInfo[] = [
  {
    planKey: "FREE",
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: JSON.stringify(["3 courses", "50 notes", "Basic analytics"]),
    limits: { maxNotes: 50, maxBookmarks: 25, maxHighlights: 50, maxCourses: 3 },
    sortOrder: 0,
  },
  {
    planKey: "PRO",
    name: "Pro",
    priceMonthly: 499,
    priceYearly: 4999,
    stripePriceIdMonthly: "price_pro_monthly",
    stripePriceIdYearly: "price_pro_yearly",
    features: JSON.stringify(["Unlimited courses", "Full analytics", "Reading goals"]),
    limits: { maxNotes: -1, maxBookmarks: -1, maxHighlights: -1, maxCourses: -1 },
    sortOrder: 1,
  },
  {
    planKey: "PREMIUM",
    name: "Premium",
    priceMonthly: 999,
    priceYearly: 9999,
    stripePriceIdMonthly: "price_premium_monthly",
    stripePriceIdYearly: "price_premium_yearly",
    features: JSON.stringify(["Everything in Pro", "Advanced analytics", "Priority support"]),
    limits: { maxNotes: -1, maxBookmarks: -1, maxHighlights: -1, maxCourses: -1 },
    sortOrder: 2,
  },
];

describe("PricingPageClient", () => {
  it("renders all 3 plan cards", () => {
    render(<PricingPageClient plans={mockPlans} />);
    // Plan names appear in cards + comparison table header, so use getAllByText
    expect(screen.getAllByText("Starter").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Pro").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Premium").length).toBeGreaterThanOrEqual(1);
  });

  it("renders billing toggle", () => {
    render(<PricingPageClient plans={mockPlans} />);
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Yearly")).toBeInTheDocument();
  });

  it("renders feature comparison table", () => {
    render(<PricingPageClient plans={mockPlans} />);
    expect(screen.getByText("Full Feature Comparison")).toBeInTheDocument();
  });

  it("shows 'Current Plan' for active plan", () => {
    render(<PricingPageClient plans={mockPlans} currentPlan="PRO" />);
    expect(screen.getByText("Current Plan")).toBeInTheDocument();
  });

  it("renders offer code input section", () => {
    render(<PricingPageClient plans={mockPlans} />);
    expect(screen.getByText("Have a promo code?")).toBeInTheDocument();
  });
});
