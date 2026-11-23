import { db } from "@/lib/db";
import { AdminPlanList } from "@/components/admin/plan-list";

export default async function AdminPlansPage() {
  const plans = await db.planConfig.findMany({ orderBy: { sortOrder: "asc" } });

  const data = plans.map((p) => ({
    id: p.id,
    planKey: p.planKey,
    name: p.name,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    stripePriceIdMonthly: p.stripePriceIdMonthly,
    stripePriceIdYearly: p.stripePriceIdYearly,
    features: p.features,
    maxNotes: p.maxNotes,
    maxBookmarks: p.maxBookmarks,
    maxHighlights: p.maxHighlights,
    maxCourses: p.maxCourses,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  }));

  // Count users per plan for context
  const planCounts = await db.user.groupBy({ by: ["plan"], _count: true });
  const usersByPlan: Record<string, number> = {};
  for (const p of planCounts) usersByPlan[p.plan] = p._count;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Plan Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Manage plan limits, pricing, and features. Changes apply to new subscriptions.
        </p>
      </div>
      <AdminPlanList plans={data} usersByPlan={usersByPlan} />
    </div>
  );
}
