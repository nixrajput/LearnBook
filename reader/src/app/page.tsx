import Link from "next/link";
import {
  BookOpen,
  StickyNote,
  Bookmark,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Flame,
  Zap,
  BarChart3,
  Timer,
  Target,
  Settings,
  Calendar,
} from "lucide-react";
import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";
import { formatRelative } from "@/lib/utils/date";

async function getActiveCourseData(courseId: string) {
  const [allChapters, allProgress, recentNotes, bookmarksCount, streaks, parts, notesCount] =
    await Promise.all([
      db.chapter.findMany({ where: { courseId }, orderBy: { number: "asc" } }),
      db.readingProgress.findMany({
        where: { courseId },
        include: { chapter: { select: { slug: true, title: true, number: true } } },
      }),
      db.note.findMany({
        where: { courseId },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { chapter: { select: { title: true, slug: true, number: true } } },
      }),
      db.bookmark.count({ where: { courseId } }),
      db.readingStreak.findMany({
        where: { courseId },
        orderBy: { date: "desc" },
        take: 60,
      }),
      db.part.findMany({
        where: { courseId },
        include: { chapters: { where: { courseId }, include: { progress: true } } },
        orderBy: { number: "asc" },
      }),
      db.note.count({ where: { courseId } }),
    ]);

  const completedProgress = allProgress.filter((p) => p.completed);
  const inProgressProgress = allProgress.filter((p) => !p.completed && p.scrollPosition > 0.05);

  // ── Streak ───────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  let currentStreak = 0;
  const sortedDates = streaks
    .map((s) => s.date)
    .sort()
    .reverse();
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const dateStr = expected.toISOString().split("T")[0];
    if (sortedDates.includes(dateStr)) currentStreak++;
    else break;
  }

  const lastProgress = [...allProgress].sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime(),
  )[0];

  const partProgress = parts.map((p) => ({
    partNumber: p.number,
    romanNumeral: p.romanNumeral,
    partTitle: p.title,
    total: p.chapters.length,
    completed: p.chapters.filter((c) => c.progress?.completed).length,
  }));

  // ── Advanced analytics ────────────────────────────────────────────────────────
  const totalReadingSec = allProgress.reduce((s, p) => s + p.timeSpentSec, 0);
  const totalReadingMin = Math.round(totalReadingSec / 60);

  // Activity heatmap: last 28 days aligned to Mon start
  const heatmapDays: { date: string; level: 0 | 1 | 2 | 3; mins: number }[] = [];
  const streakByDate = new Map(streaks.map((s) => [s.date, s.minutesRead]));
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const mins = streakByDate.get(dateStr) ?? 0;
    const level: 0 | 1 | 2 | 3 = mins === 0 ? 0 : mins < 10 ? 1 : mins < 30 ? 2 : 3;
    heatmapDays.push({ date: dateStr, level, mins });
  }

  // Reading velocity: chapters completed last 7 vs prev 7 days
  const completedWithDate = allProgress
    .filter((p) => p.completed && p.completedAt)
    .map((p) => ({ completedAt: new Date(p.completedAt!) }));

  const now = new Date();
  const last7Start = new Date(now);
  last7Start.setDate(last7Start.getDate() - 7);
  const prev7Start = new Date(now);
  prev7Start.setDate(prev7Start.getDate() - 14);

  const last7Chapters = completedWithDate.filter((p) => p.completedAt >= last7Start).length;
  const prev7Chapters = completedWithDate.filter(
    (p) => p.completedAt >= prev7Start && p.completedAt < last7Start,
  ).length;
  const velocityTrend = prev7Chapters === 0 ? null : last7Chapters - prev7Chapters;

  // Most active day of week
  const dayBuckets = [0, 0, 0, 0, 0, 0, 0];
  for (const s of streaks) {
    const day = new Date(s.date + "T12:00:00").getDay();
    dayBuckets[day] += s.minutesRead;
  }
  const maxDayIdx = dayBuckets.indexOf(Math.max(...dayBuckets));
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mostActiveDay = dayBuckets[maxDayIdx] > 0 ? DAY_NAMES[maxDayIdx] : null;

  // Longest streak ever
  let longestStreak = 0;
  let tempStreak = 0;
  const allSortedDates = [...streaks].map((s) => s.date).sort();
  for (let i = 0; i < allSortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allSortedDates[i - 1]);
      const curr = new Date(allSortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Average reading session (minutes per active day)
  const activeDays = streaks.filter((s) => s.minutesRead > 0).length;
  const avgSessionMin = activeDays > 0 ? Math.round(totalReadingMin / activeDays) : 0;

  // This week's reading time (sum of minutesRead from streaks)
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const thisWeekMin = streaks
    .filter((s) => s.date >= weekStartStr)
    .reduce((sum, s) => sum + s.minutesRead, 0);

  return {
    totalChapters: allChapters.length,
    completedCount: completedProgress.length,
    inProgressCount: inProgressProgress.length,
    notesCount,
    bookmarksCount,
    currentStreak,
    longestStreak,
    lastReadChapter: lastProgress?.chapter ?? null,
    recentNotes,
    partProgress,
    completionPct:
      allChapters.length > 0
        ? Math.round((completedProgress.length / allChapters.length) * 100)
        : 0,
    totalReadingMin,
    heatmapDays,
    last7Chapters,
    velocityTrend,
    mostActiveDay,
    dayBuckets,
    avgSessionMin,
    thisWeekMin,
  };
}

export default async function HomePage() {
  const courseId = await getActiveCourseId();
  const [data, activeCourse] = await Promise.all([
    getActiveCourseData(courseId),
    db.course.findUnique({ where: { id: courseId }, select: { title: true } }),
  ]);

  const totalReadingLabel =
    data.totalReadingMin >= 60
      ? `${Math.floor(data.totalReadingMin / 60)}h ${data.totalReadingMin % 60}m`
      : `${data.totalReadingMin}m`;

  const thisWeekLabel =
    data.thisWeekMin >= 60
      ? `${Math.floor(data.thisWeekMin / 60)}h ${data.thisWeekMin % 60}m`
      : `${data.thisWeekMin}m`;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="mb-8 animate-slide-down">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Dashboard</h1>
        {activeCourse && (
          <p className="text-muted-foreground">
            Active course:{" "}
            <Link
              href={`/courses/${courseId}`}
              className="font-medium text-foreground hover:underline"
            >
              {activeCourse.title}
            </Link>
          </p>
        )}
      </div>

      {/* ── Continue reading banner ───────────────────────────────────────────── */}
      {data.lastReadChapter && (
        <Link
          href={`/course/${data.lastReadChapter.slug}`}
          className="stagger-1 group mb-8 flex animate-slide-up items-center justify-between gap-4 rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="mb-0.5 text-xs font-medium text-muted-foreground">Continue reading</p>
              <h2 className="font-semibold leading-snug group-hover:text-primary">
                Ch. {data.lastReadChapter.number} — {data.lastReadChapter.title}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
            Resume{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      )}

      {/* ── Key stats row ─────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
          label="Completed"
          value={`${data.completedCount}/${data.totalChapters}`}
          sub={`${data.completionPct}% done`}
          delay="stagger-1"
        />
        <StatCard
          icon={<Circle className="h-4 w-4 text-blue-500" />}
          iconBg="bg-blue-500/10"
          label="In progress"
          value={String(data.inProgressCount)}
          sub="chapters"
          delay="stagger-2"
        />
        <StatCard
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          iconBg="bg-orange-500/10"
          label="Current streak"
          value={`${data.currentStreak}d`}
          sub={`${data.longestStreak}d best`}
          delay="stagger-3"
        />
        <StatCard
          icon={<StickyNote className="h-4 w-4 text-amber-500" />}
          iconBg="bg-amber-500/10"
          label="Notes"
          value={String(data.notesCount)}
          sub={`${data.bookmarksCount} bookmarks`}
          delay="stagger-4"
        />
      </div>

      {/* ── Course progress ───────────────────────────────────────────────────── */}
      <div className="stagger-3 mb-8 animate-slide-up rounded-xl border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-semibold">Course Progress</h3>
          </div>
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View course <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-6">
          {/* Overall progress */}
          <div className="mb-6 rounded-lg bg-muted/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Overall completion</span>
              <span className="text-2xl font-bold tabular-nums text-primary">
                {data.completionPct}%
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700"
                style={{ width: `${data.completionPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>
                {data.completedCount} of {data.totalChapters} chapters complete
              </span>
              <span>{data.totalChapters - data.completedCount} remaining</span>
            </div>
          </div>

          {/* Per-part breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              By part
            </div>
            {data.partProgress.map((p) => {
              const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
              return (
                <div key={p.partNumber} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">
                    Part {p.romanNumeral}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-foreground">{p.partTitle}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {p.completed}/{p.total}
                      </span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                          pct === 100 ? "bg-emerald-500" : "bg-primary/60"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Analytics stats ───────────────────────────────────────────────────── */}
      <div className="mb-2">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10">
            <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <h3 className="font-semibold">Reading Analytics</h3>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnalyticCard
          icon={<Timer className="h-4 w-4 text-violet-500" />}
          iconBg="bg-violet-500/10"
          label="Total time"
          value={totalReadingLabel || "0m"}
          sub="all time"
          delay="stagger-1"
        />
        <AnalyticCard
          icon={<Calendar className="h-4 w-4 text-sky-500" />}
          iconBg="bg-sky-500/10"
          label="This week"
          value={thisWeekLabel || "0m"}
          sub={`${data.last7Chapters} ch completed`}
          delay="stagger-2"
        />
        <AnalyticCard
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          iconBg="bg-amber-500/10"
          label="Velocity"
          value={`${data.last7Chapters} ch`}
          sub={
            data.velocityTrend === null
              ? "vs last week"
              : data.velocityTrend > 0
                ? `↑ ${data.velocityTrend} vs last week`
                : data.velocityTrend < 0
                  ? `↓ ${Math.abs(data.velocityTrend)} vs last week`
                  : "same as last week"
          }
          subColor={
            data.velocityTrend == null
              ? undefined
              : data.velocityTrend > 0
                ? "text-emerald-500"
                : data.velocityTrend < 0
                  ? "text-red-500"
                  : undefined
          }
          delay="stagger-3"
        />
        <AnalyticCard
          icon={<Target className="h-4 w-4 text-rose-500" />}
          iconBg="bg-rose-500/10"
          label="Avg session"
          value={data.avgSessionMin > 0 ? `${data.avgSessionMin}m` : "—"}
          sub={data.mostActiveDay ? `Best: ${data.mostActiveDay.slice(0, 3)}` : "no data yet"}
          delay="stagger-4"
        />
      </div>

      {/* ── Activity heatmap ──────────────────────────────────────────────────── */}
      <div className="stagger-5 mb-8 animate-slide-up rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-semibold">Reading Activity</h3>
          </div>
          <span className="text-xs text-muted-foreground">Last 28 days</span>
        </div>

        <div className="p-6">
          {/* Day-of-week labels */}
          <div className="mb-2 grid grid-cols-7 gap-1.5 px-0">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {data.heatmapDays.map(({ date, level, mins }) => (
              <div
                key={date}
                title={`${date}${mins > 0 ? ` · ${mins} min` : ""}`}
                className={`h-8 rounded transition-colors ${
                  level === 0
                    ? "bg-muted/60"
                    : level === 1
                      ? "bg-primary/25"
                      : level === 2
                        ? "bg-primary/55"
                        : "bg-primary"
                }`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            {["bg-muted/60", "bg-primary/25", "bg-primary/55", "bg-primary"].map((cls, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
            ))}
            <span>More</span>
          </div>

          {/* Weekly bar chart */}
          {data.dayBuckets.some((v) => v > 0) && (
            <div className="mt-6 border-t pt-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Minutes by day of week
              </p>
              <div className="flex h-20 items-end gap-1.5">
                {data.dayBuckets.map((mins, i) => {
                  const maxMins = Math.max(...data.dayBuckets, 1);
                  const heightPct = Math.max(Math.round((mins / maxMins) * 100), mins > 0 ? 4 : 0);
                  const dayLabel = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][i];
                  const isMax = mins === Math.max(...data.dayBuckets) && mins > 0;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={`w-full rounded-t transition-all duration-500 ${
                            isMax ? "bg-primary" : "bg-primary/40"
                          }`}
                          style={{ height: `${heightPct}%` }}
                          title={`${mins} min`}
                        />
                      </div>
                      <span
                        className={`text-[10px] ${isMax ? "font-semibold text-primary" : "text-muted-foreground"}`}
                      >
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent notes + Quick links ────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent notes */}
        <div className="stagger-4 animate-slide-up rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Recent Notes
            </h3>
            <Link
              href="/notes"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {data.recentNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <StickyNote className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No notes yet.</p>
                <p className="text-xs text-muted-foreground/70">Start reading and take notes!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentNotes.map((note) => (
                  <div key={note.id} className="group">
                    <Link
                      href={`/course/${note.chapter.slug}`}
                      className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary"
                    >
                      Ch. {note.chapter.number} — {note.chapter.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm">{note.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {formatRelative(note.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="stagger-5 animate-slide-up rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h3 className="text-sm font-semibold">Quick Access</h3>
          </div>
          <div className="p-3">
            <QuickLink
              href={`/courses/${courseId}`}
              icon={<BookOpen className="h-4 w-4 text-primary" />}
              iconBg="bg-primary/10"
              label="Active course"
              sub={`${data.totalChapters} chapters · ${data.completionPct}% done`}
            />
            <QuickLink
              href="/notes"
              icon={<StickyNote className="h-4 w-4 text-amber-500" />}
              iconBg="bg-amber-500/10"
              label="My notes"
              sub={`${data.notesCount} total notes`}
            />
            <QuickLink
              href="/bookmarks"
              icon={<Bookmark className="h-4 w-4 text-blue-500" />}
              iconBg="bg-blue-500/10"
              label="Bookmarks"
              sub={`${data.bookmarksCount} saved`}
            />
            <QuickLink
              href="/settings"
              icon={<Settings className="h-4 w-4 text-muted-foreground" />}
              iconBg="bg-muted/60"
              label="Reader settings"
              sub="Font, size, theme"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  delay?: string;
}) {
  return (
    <div className={`animate-slide-up rounded-xl border bg-card p-5 ${delay ?? ""}`}>
      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground/70">{sub}</div>
    </div>
  );
}

function AnalyticCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  subColor,
  delay,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  delay?: string;
}) {
  return (
    <div className={`animate-slide-up rounded-xl border bg-card p-5 ${delay ?? ""}`}>
      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="text-xl font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
      {sub && (
        <div className={`mt-1 text-[11px] ${subColor ?? "text-muted-foreground/70"}`}>{sub}</div>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  iconBg,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
    </Link>
  );
}
