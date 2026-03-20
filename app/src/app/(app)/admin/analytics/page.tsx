import { db } from "@/lib/db";
import { formatPrice } from "@/lib/plans";
import {
  Users,
  BookOpen,
  StickyNote,
  CreditCard,
  TrendingUp,
  BarChart3,
  Sparkles,
  Layers,
  MessageSquare,
  Upload,
  Brain,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    proUsers,
    premiumUsers,
    recentUsers7d,
    recentUsers30d,
    totalCourses,
    publishedCourses,
    totalNotes,
    totalBookmarks,
    totalHighlights,
    activeSubscriptions,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { plan: "PRO" } }),
    db.user.count({ where: { plan: "PREMIUM" } }),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.course.count(),
    db.course.count({ where: { isPublished: true } }),
    db.note.count(),
    db.bookmark.count(),
    db.highlight.count(),
    db.user.count({ where: { stripeSubscriptionId: { not: null } } }),
  ]);

  const freeUsers = totalUsers - proUsers - premiumUsers;
  const mrr = proUsers * 499 + premiumUsers * 999;
  const conversionRate =
    totalUsers > 0 ? Math.round(((proUsers + premiumUsers) / totalUsers) * 100) : 0;

  // Per-course stats
  const courses = await db.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      totalChapters: true,
      _count: { select: { progress: true, notes: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const [enrollmentByGroup, completionByGroup] = await Promise.all([
    db.readingProgress.groupBy({
      by: ["courseId", "userId"],
      where: { courseId: { in: courses.map((c) => c.id) } },
    }),
    db.readingProgress.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courses.map((c) => c.id) }, completed: true },
      _count: true,
    }),
  ]);

  const enrolledByCourse = new Map<string, Set<string>>();
  for (const row of enrollmentByGroup) {
    if (!enrolledByCourse.has(row.courseId)) enrolledByCourse.set(row.courseId, new Set());
    enrolledByCourse.get(row.courseId)!.add(row.userId);
  }
  const completedByCourse = new Map<string, number>();
  for (const row of completionByGroup) {
    completedByCourse.set(row.courseId, row._count);
  }

  const courseStats = courses.map((c) => {
    const enrolled = enrolledByCourse.get(c.id)?.size ?? 0;
    const completedPairs = completedByCourse.get(c.id) ?? 0;
    const completionRate =
      enrolled > 0 && c.totalChapters > 0
        ? Math.round((completedPairs / (enrolled * c.totalChapters)) * 100)
        : 0;
    return {
      title: c.title,
      enrolled,
      totalChapters: c.totalChapters,
      completionRate,
      notes: c._count.notes,
    };
  });

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-1 text-xl font-bold tracking-tight">Platform Analytics</h2>
        <p className="text-sm text-muted-foreground">Comprehensive metrics across all features</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 1: Users & Revenue */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Users} title="Users & Revenue" color="text-blue-500" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Users" value={totalUsers} />
          <MetricCard label="New (7d)" value={`+${recentUsers7d}`} />
          <MetricCard label="New (30d)" value={`+${recentUsers30d}`} />
          <MetricCard label="Paid Conversion" value={`${conversionRate}%`} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Revenue */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{formatPrice(mrr)}</span>
              <span className="text-sm text-muted-foreground">MRR</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                { label: "Free", count: freeUsers, cls: "bg-muted/40" },
                {
                  label: "Pro",
                  count: proUsers,
                  cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Premium",
                  count: premiumUsers,
                  cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
              ].map((p) => (
                <div key={p.label} className={`rounded-lg p-3 text-center ${p.cls}`}>
                  <div className="text-lg font-bold tabular-nums">{p.count}</div>
                  <div className="text-[10px] text-muted-foreground">{p.label}</div>
                </div>
              ))}
            </div>
            {totalUsers > 0 && (
              <div className="flex h-3 overflow-hidden rounded-full">
                <div
                  className="bg-muted-foreground/20"
                  style={{ width: `${(freeUsers / totalUsers) * 100}%` }}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${(proUsers / totalUsers) * 100}%` }}
                />
                <div
                  className="bg-amber-500"
                  style={{ width: `${(premiumUsers / totalUsers) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Subscriptions */}
          <div className="rounded-xl border bg-card p-6">
            <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
              Subscription Health
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold tabular-nums">{activeSubscriptions}</div>
                <div className="text-xs text-muted-foreground">Active subscriptions</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{formatPrice(mrr * 12)}</div>
                <div className="text-xs text-muted-foreground">Projected ARR</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {activeSubscriptions > 0
                    ? formatPrice(Math.round(mrr / activeSubscriptions))
                    : "—"}
                </div>
                <div className="text-xs text-muted-foreground">ARPU</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{conversionRate}%</div>
                <div className="text-xs text-muted-foreground">Free → Paid</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 2: Content */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={BookOpen} title="Content & Engagement" color="text-primary" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Courses" value={`${publishedCourses}/${totalCourses}`} />
          <MetricCard label="Notes" value={totalNotes} />
          <MetricCard label="Bookmarks" value={totalBookmarks} />
          <MetricCard label="Highlights" value={totalHighlights} />
        </div>

        {courseStats.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-6 py-4">
              <h4 className="text-sm font-semibold">Course Performance</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Course
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                      Enrolled
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                      Chapters
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                      Completion
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((c) => (
                    <tr
                      key={c.title}
                      className="border-b transition-colors last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 text-sm font-medium">{c.title}</td>
                      <td className="px-4 py-3 text-center text-sm tabular-nums">{c.enrolled}</td>
                      <td className="px-4 py-3 text-center text-sm tabular-nums">
                        {c.totalChapters}
                      </td>
                      <td className="px-4 py-3 text-center text-sm tabular-nums">
                        {c.completionRate}%
                      </td>
                      <td className="px-4 py-3 text-center text-sm tabular-nums">{c.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 3: AI Usage */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Sparkles} title="AI Usage" color="text-indigo-500" />
        <div className="mt-4">
          <AIUsageSection />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 4: Feature Adoption */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={BarChart3} title="Feature Adoption" color="text-violet-500" />
        <div className="mt-4">
          <FeatureAdoptionSection />
        </div>
      </div>
    </div>
  );
}

/* ── Shared components ──────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b pb-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

async function AIUsageSection() {
  const [totalCreditsResult, totalLogs, topActionsRaw] = await Promise.all([
    db.aiUsageLog.aggregate({ _sum: { credits: true } }),
    db.aiUsageLog.count(),
    db.aiUsageLog.groupBy({ by: ["action"], _count: true, _sum: { credits: true } }),
  ]);
  const totalCreditsUsed = totalCreditsResult._sum.credits ?? 0;
  const topActions = topActionsRaw.sort((a, b) => b._count - a._count).slice(0, 6);
  const maxCount = topActions.length > 0 ? Math.max(...topActions.map((a) => a._count)) : 1;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-2xl font-bold tabular-nums">{totalCreditsUsed}</div>
            <div className="text-xs text-muted-foreground">Total credits consumed</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{totalLogs}</div>
            <div className="text-xs text-muted-foreground">Total AI requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {totalLogs > 0 ? (totalCreditsUsed / totalLogs).toFixed(1) : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Avg credits/request</div>
          </div>
        </div>
      </div>

      {topActions.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h4 className="mb-4 text-sm font-semibold text-muted-foreground">Usage by Action</h4>
          <div className="space-y-2.5">
            {topActions.map((a) => (
              <div key={a.action}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-mono">{a.action}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {a._count} calls · {a._sum.credits ?? 0} cr
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${(a._count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function FeatureAdoptionSection() {
  const [
    flashcardDecks,
    flashcardCards,
    reviews,
    quizzes,
    studySessions,
    groups,
    members,
    discussions,
    contentSources,
    concepts,
  ] = await Promise.all([
    db.flashcardDeck.count(),
    db.flashcardCard.count(),
    db.flashcardReview.count(),
    db.quiz.count(),
    db.studySession.count(),
    db.studyGroup.count(),
    db.groupMember.count(),
    db.groupDiscussion.count(),
    db.contentSource.count(),
    db.concept.count(),
  ]);

  const features = [
    {
      icon: Layers,
      label: "Flashcard Decks",
      value: flashcardDecks,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      icon: Layers,
      label: "Total Cards",
      value: flashcardCards,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      icon: BarChart3,
      label: "Reviews",
      value: reviews,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      icon: BookOpen,
      label: "Quizzes",
      value: quizzes,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: MessageSquare,
      label: "Study Sessions",
      value: studySessions,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      icon: Users,
      label: "Study Groups",
      value: groups,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Users,
      label: "Group Members",
      value: members,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: MessageSquare,
      label: "Discussions",
      value: discussions,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: Upload,
      label: "Content Sources",
      value: contentSources,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Brain,
      label: "Concepts",
      value: concepts,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {features.map((f) => (
        <div key={f.label} className="rounded-xl border bg-card p-4">
          <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${f.bg}`}>
            <f.icon className={`h-3.5 w-3.5 ${f.color}`} />
          </div>
          <div className="text-xl font-bold tabular-nums">{f.value}</div>
          <div className="text-[10px] text-muted-foreground">{f.label}</div>
        </div>
      ))}
    </div>
  );
}
