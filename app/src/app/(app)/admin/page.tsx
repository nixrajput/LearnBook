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
  Upload,
  Tag,
  Sparkles,
  Layers,
  Brain,
  FileText,
} from "lucide-react";

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
  ]);

  const freeUsers = userCount - proUsers - premiumUsers;
  const mrr = proUsers * 499 + premiumUsers * 999;

  const planData = [
    { label: "Free", count: freeUsers, color: "bg-muted-foreground/30" },
    { label: "Pro", count: proUsers, color: "bg-blue-500" },
    { label: "Premium", count: premiumUsers, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">Platform health at a glance</p>
      </div>

      {/* ── Key metrics ──────────────────────────────────────────────────── */}
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

      {/* ── Content & Engagement ─────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Content & Engagement</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            color="text-primary"
            bg="bg-primary/10"
            label="Courses"
            value={`${publishedCourses}/${courseCount}`}
          />
          <StatCard
            icon={StickyNote}
            color="text-amber-500"
            bg="bg-amber-500/10"
            label="Notes"
            value={noteCount}
          />
          <StatCard
            icon={Bookmark}
            color="text-rose-500"
            bg="bg-rose-500/10"
            label="Bookmarks"
            value={bookmarkCount}
          />
          <StatCard
            icon={FileText}
            color="text-sky-500"
            bg="bg-sky-500/10"
            label="Highlights"
            value={highlightCount}
          />
        </div>
      </div>

      {/* ── AI & Features ────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">AI & Features</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Sparkles}
            color="text-indigo-500"
            bg="bg-indigo-500/10"
            label="AI Credits Used"
            value={totalAiCreditsUsed}
          />
          <StatCard
            icon={Layers}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
            label="Flashcard Decks"
            value={flashcardDeckCount}
            sub={`${flashcardCardCount} cards`}
          />
          <StatCard
            icon={Brain}
            color="text-rose-500"
            bg="bg-rose-500/10"
            label="Study Groups"
            value={groupCount}
          />
          <StatCard
            icon={Upload}
            color="text-cyan-500"
            bg="bg-cyan-500/10"
            label="Content Sources"
            value={contentSourceCount}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Revenue breakdown ────────────────────────────────────────── */}
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
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{formatPrice(mrr)}</span>
              <span className="text-sm text-muted-foreground">MRR</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-lg font-bold tabular-nums">{freeUsers}</div>
                <div className="text-[10px] text-muted-foreground">Free</div>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                <div className="text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {proUsers}
                </div>
                <div className="text-[10px] text-muted-foreground">Pro</div>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                <div className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {premiumUsers}
                </div>
                <div className="text-[10px] text-muted-foreground">Premium</div>
              </div>
            </div>
            {userCount > 0 && (
              <div>
                <div className="mb-2 flex h-4 overflow-hidden rounded-full">
                  {planData.map((p) => (
                    <div
                      key={p.label}
                      className={`${p.color} transition-all duration-500`}
                      style={{
                        width: `${Math.max((p.count / userCount) * 100, p.count > 0 ? 2 : 0)}%`,
                      }}
                      title={`${p.label}: ${p.count}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  {planData.map((p) => (
                    <div key={p.label} className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${p.color}`} />
                      {p.label} ({userCount > 0 ? Math.round((p.count / userCount) * 100) : 0}%)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── User growth ──────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="font-semibold">User Growth</h3>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              All users <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold tabular-nums">+{newUsers7d}</div>
                <div className="text-xs text-muted-foreground">Last 7 days</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">+{newUsers30d}</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </div>
            </div>
            <div className="space-y-3">
              <GrowthBar
                label="7-day signups"
                value={newUsers7d}
                total={userCount}
                color="bg-emerald-500"
              />
              <GrowthBar
                label="30-day signups"
                value={newUsers30d}
                total={userCount}
                color="bg-sky-500"
              />
              <GrowthBar
                label="Paid conversion"
                value={proUsers + premiumUsers}
                total={userCount}
                color="bg-violet-500"
                showPercent
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent events ────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              Recent Signups
            </h3>
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

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y">
            {recentNotes.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No activity yet
              </div>
            ) : (
              recentNotes.map((n) => (
                <div key={n.id} className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{n.user.name ?? n.user.email}</span>
                    <span className="text-xs text-muted-foreground">added a note</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{n.course.title}</span>
                    <span>·</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">
                    {n.content.slice(0, 100)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Quick links ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/admin/courses/upload"
          icon={<Upload className="h-4 w-4 text-primary" />}
          label="Upload Course"
          desc="Add new content"
        />
        <QuickAction
          href="/admin/offers"
          icon={<Tag className="h-4 w-4 text-emerald-500" />}
          label="Manage Offers"
          desc="Discount codes"
        />
        <QuickAction
          href="/admin/plans"
          icon={<CreditCard className="h-4 w-4 text-violet-500" />}
          label="Plan Config"
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

function StatCard({
  icon: Icon,
  color,
  bg,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md">
      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function GrowthBar({
  label,
  value,
  total,
  color,
  showPercent,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  showPercent?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{showPercent ? `${pct}%` : value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
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
