import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { Sparkles, ArrowRight, TrendingUp, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditPackCards } from "@/components/credits/credit-pack-cards";
import { getAllCreditPacks } from "@/config/credit-packs";

export const metadata: Metadata = { title: "AI Credits" };

const PLAN_CREDITS: Record<string, number> = {
  FREE: 100,
  PRO: 1500,
  PREMIUM: 10000,
};

export default async function CreditsPage() {
  const user = await requireSession();
  const plan = user.plan ?? "FREE";
  const monthlyAllocation = PLAN_CREDITS[plan] ?? 100;

  const [balance, recentUsage, usageByAction, creditPacks] = await Promise.all([
    db.aiCreditBalance.findUnique({ where: { userId: user.id } }),
    db.aiUsageLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        credits: true,
        model: true,
        createdAt: true,
      },
    }),
    db.aiUsageLog.groupBy({
      by: ["action"],
      where: { userId: user.id },
      _count: true,
      _sum: { credits: true },
    }),
    getAllCreditPacks(),
  ]);

  const credits = balance?.credits ?? 0;
  const usagePct = monthlyAllocation > 0 ? Math.round((credits / monthlyAllocation) * 100) : 0;
  const sortedActions = usageByAction.sort((a, b) => b._count - a._count);
  const totalUsed = sortedActions.reduce((s, a) => s + (a._sum.credits ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">AI Credits</h1>

      {/* Balance card */}
      <div className="mb-8 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums">{credits}</span>
                <span className="text-sm text-muted-foreground">/ {monthlyAllocation} credits</span>
              </div>
              <p className="text-xs text-muted-foreground">{plan} plan · resets monthly</p>
            </div>
          </div>
          {plan === "FREE" && (
            <Button asChild size="sm">
              <Link href="/pricing">
                Upgrade for more <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
        <div className="px-6 py-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Remaining this month</span>
            <span>{usagePct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePct > 20 ? "bg-indigo-500" : usagePct > 5 ? "bg-amber-500" : "bg-destructive"
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Buy more credits */}
      <div className="mb-8 rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Buy More Credits</h2>
        </div>
        <div className="px-6 py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Need more credits? Purchase additional packs anytime. Credits are added instantly and
            never expire.
          </p>
          <CreditPackCards packs={creditPacks} locale={user.locale ?? "en-US"} />
        </div>
      </div>

      {/* Usage breakdown */}
      {sortedActions.length > 0 && (
        <div className="mb-8 rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <h2 className="font-semibold">Usage Breakdown</h2>
          </div>
          <div className="px-6 py-4">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold tabular-nums">{totalUsed}</div>
                <div className="text-xs text-muted-foreground">Total credits used</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {sortedActions.reduce((s, a) => s + a._count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total AI requests</div>
              </div>
            </div>
            <div className="space-y-2">
              {sortedActions.map((a) => {
                const maxCount = sortedActions[0]._count;
                return (
                  <div key={a.action}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium capitalize">{a.action.replace(/_/g, " ")}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {a._count} calls · {a._sum.credits ?? 0} credits
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(a._count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent usage log */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        {recentUsage.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No AI usage yet. Start reading and use AI features!
          </div>
        ) : (
          <div className="divide-y">
            {recentUsage.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {u.action.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {u.model}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(u.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm tabular-nums">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="font-medium">-{u.credits}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
