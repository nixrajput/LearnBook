import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/plans";
import {
  BookOpen,
  Users,
  StickyNote,
  Bookmark,
  CreditCard,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Tag,
  Sparkles,
  Layers,
  Brain,
  FileText,
} from "lucide-react";
import { AreaTrend } from "@/components/admin/charts/area-trend";
import { PlanDonut } from "@/components/admin/charts/plan-donut";

export default async function AdminOverviewPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    courseCount,
    publishedCourses,
    userCount,
    proUsers,
    premiumUsers,
    noteCount,
    bookmarkCount,
    highlightCount,
    newUsers7d,
    newUsers30d,
    activeSubscriptions,
    totalAiCreditsUsed,
    flashcardDeckCount,
    flashcardCardCount,
    groupCount,
    contentSourceCount,
    recentSignups,
    recentNotes,
    signupDates,
    aiUsageDates,
    readingStreaks,
  ] = await Promise.all([
    db.course.count(),
    db.course.count({ where: { isPublished: true } }),
    db.user.count(),
    db.user.count({ where: { plan: "PRO" } }),
    db.user.count({ where: { plan: "PREMIUM" } }),
    db.note.count(),
    db.bookmark.count(),
    db.highlight.count(),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { stripeSubscriptionId: { not: null } } }),
    db.aiUsageLog.aggregate({ _sum: { credits: true } }).then((r) => r._sum.credits ?? 0),
    db.flashcardDeck.count(),
    db.flashcardCard.count(),
    db.studyGroup.count(),
    db.contentSource.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    }),
    db.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    db.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    db.aiUsageLog.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 14 * 86400000) } },
      select: { createdAt: true, credits: true },
    }),
    db.readingStreak.findMany({
      where: { date: { gte: new Date(now.getTime() - 14 * 86400000).toISOString().split("T")[0] } },
      select: { date: true, minutesRead: true },
    }),
  ]);

  const freeUsers = userCount - proUsers - premiumUsers;
  const mrr = proUsers * 499 + premiumUsers * 999;
  const conversionRate =
    userCount > 0 ? Math.round(((proUsers + premiumUsers) / userCount) * 100) : 0;

  // Build trends
  const signupTrend = buildDailyTrend(
    signupDates.map((u) => u.createdAt),
    14,
  );
  const aiTrend = buildDailySumTrend(
    aiUsageDates.map((u) => ({ date: u.createdAt, value: u.credits })),
    14,
  );
  const readingTrend = buildDailyReadingTrend(readingStreaks, 14);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">Platform health at a glance</p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          color="text-blue-500"
          bg="bg-blue-500/10"
          label="Total Users"
          value={userCount}
        />
        <StatCard
          icon={UserPlus}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          label="New (7d)"
          value={`+${newUsers7d}`}
        />
        <StatCard
          icon={CreditCard}
          color="text-violet-500"
          bg="bg-violet-500/10"
          label="Active Subs"
          value={activeSubscriptions}
        />
        <StatCard
          icon={TrendingUp}
          color="text-amber-500"
          bg="bg-amber-500/10"
          label="MRR"
          value={formatPrice(mrr)}
        />
      </div>

      {/* Trend charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AreaTrend
          title="User Signups"
          subtitle="Last 14 days"
          data={signupTrend}
          total={signupTrend.reduce((s, d) => s + d.value, 0)}
          unit="signups"
          color="hsl(var(--chart-1))"
        />
        <AreaTrend
          title="AI Credits Used"
          subtitle="Last 14 days"
          data={aiTrend}
          total={aiTrend.reduce((s, d) => s + d.value, 0)}
          unit="credits"
          color="hsl(var(--chart-2))"
        />
        <AreaTrend
          title="Reading Activity"
          subtitle="Last 14 days"
          data={readingTrend}
          total={readingTrend.reduce((s, d) => s + d.value, 0)}
          unit="minutes"
          color="hsl(var(--chart-3))"
        />
      </div>

      {/* Revenue + Plan Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="font-semibold">Revenue</h3>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6">
            <div className="mb-3 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold tabular-nums">{formatPrice(mrr)}</div>
                <div className="text-xs text-muted-foreground">MRR</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{formatPrice(mrr * 12)}</div>
                <div className="text-xs text-muted-foreground">ARR</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{conversionRate}%</div>
                <div className="text-xs text-muted-foreground">Conversion</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="font-semibold">Plan Distribution</h3>
          </div>
          <div className="flex items-center justify-center p-6">
            <PlanDonut
              data={[
                { name: "Free", value: freeUsers, color: "hsl(var(--muted-foreground))" },
                { name: "Pro", value: proUsers, color: "hsl(217, 91%, 60%)" },
                { name: "Premium", value: premiumUsers, color: "hsl(45, 93%, 47%)" },
              ]}
              total={userCount}
              centerLabel="users"
            />
          </div>
        </div>
      </div>

      {/* Content & Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">Content & Engagement</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 p-6">
            <MiniStat
              label="Courses"
              value={`${publishedCourses}/${courseCount}`}
              icon={BookOpen}
            />
            <MiniStat label="Notes" value={noteCount} icon={StickyNote} />
            <MiniStat label="Bookmarks" value={bookmarkCount} icon={Bookmark} />
            <MiniStat label="Highlights" value={highlightCount} icon={FileText} />
            <MiniStat label="AI Credits" value={totalAiCreditsUsed} icon={Sparkles} />
            <MiniStat
              label="Flashcards"
              value={`${flashcardDeckCount}d/${flashcardCardCount}c`}
              icon={Layers}
            />
            <MiniStat label="Groups" value={groupCount} icon={Brain} />
            <MiniStat label="Sources" value={contentSourceCount} icon={FileText} />
          </div>
        </div>

        {/* Recent signups */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              Recent Signups
            </h3>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentSignups.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No users yet
              </div>
            ) : (
              recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <div className="text-sm font-medium">{u.name ?? u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${u.plan === "PRO" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : u.plan === "PREMIUM" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}
                    >
                      {u.plan}
                    </span>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/admin/courses"
          icon={<BookOpen className="h-4 w-4 text-primary" />}
          label="Courses"
          desc="Manage content"
        />
        <QuickAction
          href="/admin/offers"
          icon={<Tag className="h-4 w-4 text-emerald-500" />}
          label="Offers"
          desc="Discount codes"
        />
        <QuickAction
          href="/admin/plans"
          icon={<CreditCard className="h-4 w-4 text-violet-500" />}
          label="Plans"
          desc="Limits & pricing"
        />
        <QuickAction
          href="/admin/analytics"
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          label="Analytics"
          desc="Detailed metrics"
        />
      </div>
    </div>
  );
}

/* ── Data helpers ─────────────────────────────────────────────────────── */

function buildDailyTrend(dates: Date[], days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      value: dates.filter((dt) => dt.toISOString().split("T")[0] === dateStr).length,
    };
  });
}

function buildDailySumTrend(items: { date: Date; value: number }[], days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      value: items
        .filter((it) => it.date.toISOString().split("T")[0] === dateStr)
        .reduce((s, it) => s + it.value, 0),
    };
  });
}

function buildDailyReadingTrend(streaks: { date: string; minutesRead: number }[], days: number) {
  const now = new Date();
  const byDate = new Map<string, number>();
  for (const s of streaks) byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.minutesRead);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().split("T")[0],
      value: byDate.get(d.toISOString().split("T")[0]) ?? 0,
    };
  });
}

/* ── UI Components ───────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  color,
  bg,
  label,
  value,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md">
      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-sm font-bold tabular-nums">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 transition-colors group-hover:bg-primary/10">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium group-hover:text-primary">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}
