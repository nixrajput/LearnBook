import { db } from "@/lib/db";

export interface PlanLimits {
  maxNotes: number;
  maxBookmarks: number;
  maxHighlights: number;
  maxCourses: number;
}

export interface PlanInfo {
  planKey: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  features: string;
  limits: PlanLimits;
  sortOrder: number;
}

/** Hardcoded defaults in case DB is empty or unavailable. */
const DEFAULT_PLANS: PlanInfo[] = [
  {
    planKey: "FREE",
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: JSON.stringify([
      "3 courses", // 0: Courses
      "50 notes, 25 bookmarks, 50 highlights", // 1: Notes, Bookmarks, Highlights
      "2 PDF/EPUB uploads", // 2: PDF/EPUB Uploads
      "5 web articles/month", // 3: Web Articles
      "100 AI credits/month (budget models)", // 4: AI Credits/month
      "3 flashcard decks (100 cards)", // 5: Flashcard Decks
      "Basic analytics", // 6: Analytics
      false, // 7: AI Study Sessions
      false, // 8: Knowledge Graph
      "Join 1 study group", // 9: Study Groups
      false, // 10: Export & Support
    ]),
    limits: { maxNotes: 50, maxBookmarks: 25, maxHighlights: 50, maxCourses: 3 },
    sortOrder: 0,
  },
  {
    planKey: "PRO",
    name: "Pro",
    priceMonthly: 499,
    priceYearly: 4999,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: JSON.stringify([
      "Unlimited courses",
      "Unlimited notes, bookmarks, highlights",
      "20 PDF/EPUB uploads",
      "50 web articles/month",
      "1,500 AI credits/month (budget + standard)",
      "Unlimited flashcard decks",
      "Full analytics + reading goals",
      "AI Study Sessions",
      "Knowledge graph (view only)",
      "Create 2 study groups, join 5",
      "Markdown export + email support",
    ]),
    limits: { maxNotes: -1, maxBookmarks: -1, maxHighlights: -1, maxCourses: -1 },
    sortOrder: 1,
  },
  {
    planKey: "PREMIUM",
    name: "Premium",
    priceMonthly: 999,
    priceYearly: 9999,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: JSON.stringify([
      "Unlimited + exclusive courses", // 0: Courses
      "Unlimited notes, bookmarks, highlights", // 1: Notes, Bookmarks, Highlights
      "Unlimited PDF/EPUB uploads", // 2: PDF/EPUB Uploads
      "Unlimited web articles", // 3: Web Articles
      "10,000 AI credits/month (all models)", // 4: AI Credits/month
      "Unlimited flashcard decks", // 5: Flashcard Decks
      "Advanced analytics + speed trends", // 6: Analytics
      "AI Study Sessions", // 7: AI Study Sessions
      "Full knowledge graph", // 8: Knowledge Graph
      "Create 10 groups (50 members each)", // 9: Study Groups
      "All export formats + priority support", // 10: Export & Support
    ]),
    limits: { maxNotes: -1, maxBookmarks: -1, maxHighlights: -1, maxCourses: -1 },
    sortOrder: 2,
  },
];

/** Load all active plan configs from DB, falling back to defaults. */
export async function getAllPlans(): Promise<PlanInfo[]> {
  try {
    const configs = await db.planConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (configs.length === 0) return DEFAULT_PLANS;

    return configs.map((c) => ({
      planKey: c.planKey,
      name: c.name,
      priceMonthly: c.priceMonthly,
      priceYearly: c.priceYearly,
      stripePriceIdMonthly: c.stripePriceIdMonthly,
      stripePriceIdYearly: c.stripePriceIdYearly,
      features: c.features,
      limits: {
        maxNotes: c.maxNotes,
        maxBookmarks: c.maxBookmarks,
        maxHighlights: c.maxHighlights,
        maxCourses: c.maxCourses,
      },
      sortOrder: c.sortOrder,
    }));
  } catch {
    return DEFAULT_PLANS;
  }
}

/** Get limits for a specific plan key. -1 means unlimited. */
export async function getPlanLimits(planKey: string): Promise<PlanLimits> {
  const plans = await getAllPlans();
  const plan = plans.find((p) => p.planKey === planKey);
  return plan?.limits ?? DEFAULT_PLANS[0].limits;
}

/** Check if a user has exceeded a plan limit. */
export function isWithinLimit(current: number, max: number): boolean {
  return max === -1 || current < max;
}

/** Format price amount to locale-formatted display string. */
export function formatPrice(amount: number, locale: string = "en-US"): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Convert price amount to smallest currency unit for Stripe API. */
export function toSmallestUnit(amount: number): number {
  return Math.round(amount * 100);
}
