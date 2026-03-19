import { db } from "@/lib/db";
import { formatPrice } from "@/lib/plans";
import { Users, BookOpen, StickyNote, CreditCard, TrendingUp, BarChart3 } from "lucide-react";

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
    db.user.count({ where: { stripeSubscriptionId: { not: null } } }),
  ]);

  // Per-course stats — use course.totalChapters to avoid N+1, batch the rest
  const courses = await db.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      totalChapters: true,
      _count: {
        select: {
          progress: true,
          notes: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Batch: get enrolled user counts and completion counts per course in two queries
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

  // Build lookup maps
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
    const completedChapterUserPairs = completedByCourse.get(c.id) ?? 0;
    // Avg per-user completion: total completed pairs / (enrolled * totalChapters)
    const completionRate =
      enrolled > 0 && c.totalChapters > 0
        ? Math.round((completedChapterUserPairs / (enrolled * c.totalChapters)) * 100)
        : 0;
    return {
      title: c.title,
      enrolled,
      totalChapters: c.totalChapters,
      completionRate,
      notes: c._count.notes,
    };
  });

  const freeUsers = totalUsers - proUsers - premiumUsers;
  const mrr = proUsers * 499 + premiumUsers * 999;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "New (7d)",
      value: recentUsers7d,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "New (30d)",
      value: recentUsers30d,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Active Subs",
      value: activeSubscriptions,
      icon: CreditCard,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "MRR",
      value: formatPrice(mrr),
      icon: CreditCard,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Courses",
      value: `${publishedCourses}/${totalCourses}`,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Notes",
      value: totalNotes,
      icon: StickyNote,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Total Bookmarks",
      value: totalBookmarks,
      icon: BarChart3,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Platform Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`stagger-${i + 1} animate-slide-up rounded-xl border bg-card p-5`}
            >
              <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">Users by Plan</h3>
        <div className="flex items-center gap-6">
          {[
            { label: "Free", count: freeUsers, color: "bg-muted" },
            { label: "Pro", count: proUsers, color: "bg-blue-500" },
            { label: "Premium", count: premiumUsers, color: "bg-amber-500" },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${p.color}`} />
              <span className="text-sm">{p.label}</span>
              <span className="text-sm font-bold tabular-nums">{p.count}</span>
            </div>
          ))}
        </div>
        {totalUsers > 0 && (
          <div className="mt-3 flex h-3 overflow-hidden rounded-full">
            <div className="bg-muted" style={{ width: `${(freeUsers / totalUsers) * 100}%` }} />
            <div className="bg-blue-500" style={{ width: `${(proUsers / totalUsers) * 100}%` }} />
            <div
              className="bg-amber-500"
              style={{ width: `${(premiumUsers / totalUsers) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Per-course stats */}
      {courseStats.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">Course Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Course
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    Enrolled
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    Chapters
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    Completion
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
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
  );
}
