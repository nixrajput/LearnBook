"use client";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/plans";

interface PlanRow {
  id: string;
  planKey: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxNotes: number;
  maxBookmarks: number;
  maxHighlights: number;
  maxCourses: number;
  isActive: boolean;
}

function limitLabel(value: number): string {
  return value === -1 ? "Unlimited" : String(value);
}

export function AdminPlanList({ plans }: { plans: PlanRow[] }) {
  if (plans.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-muted-foreground">No plans configured. Run the database seeder.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Plan
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Monthly
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Yearly
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Notes
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Bookmarks
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Highlights
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Courses
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-b transition-colors last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{p.planKey}</div>
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">
                  {formatPrice(p.priceMonthly)}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">
                  {formatPrice(p.priceYearly)}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">
                  {limitLabel(p.maxNotes)}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">
                  {limitLabel(p.maxBookmarks)}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">
                  {limitLabel(p.maxHighlights)}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">
                  {limitLabel(p.maxCourses)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px]">
                    {p.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        To edit plan limits or prices, use the API: PATCH /api/admin/plans
      </div>
    </div>
  );
}
