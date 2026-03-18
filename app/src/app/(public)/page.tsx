import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  StickyNote,
  Bookmark,
  BarChart3,
  Flame,
  CheckCircle2,
  ArrowRight,
  Zap,
  Upload,
  Search,
  Sparkles,
  Users,
  Globe,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LearnBook — Learn Deeper, Read Smarter",
  description:
    "A distraction-free reading platform with notes, bookmarks, highlights, and analytics to supercharge your learning.",
};

const features = [
  {
    icon: BookOpen,
    title: "Distraction-Free Reader",
    desc: "Beautiful, focused reading experience with customizable fonts, sizes, and themes.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: StickyNote,
    title: "Smart Notes",
    desc: "Take contextual notes tied to chapters and sections. Never lose a thought.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & Highlights",
    desc: "Mark important passages and save your place across all your courses.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Reading Analytics",
    desc: "Track your progress, streaks, and reading velocity with detailed dashboards.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Flame,
    title: "Streak Tracking",
    desc: "Build consistent study habits with daily streak tracking and heatmaps.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Find anything across chapters, notes, and sections in milliseconds.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Your Course",
    desc: "Import structured markdown content or pick from the course library.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    num: "02",
    icon: BookOpen,
    title: "Read & Annotate",
    desc: "Enjoy a distraction-free reader with notes, bookmarks, and highlights.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Track Progress",
    desc: "Watch your streaks grow, hit reading goals, and see completion stats.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const stats = [
  { value: "10K+", label: "Active Readers", icon: Users },
  { value: "500+", label: "Courses Available", icon: BookOpen },
  { value: "98%", label: "Completion Rate", icon: TrendingUp },
  { value: "150+", label: "Countries", icon: Globe },
];

const pricingPreview = [
  {
    plan: "Starter",
    price: "Free",
    color: "border-border",
    features: ["3 courses", "50 notes", "25 bookmarks", "Basic analytics"],
    cta: "Get Started",
    href: "/login",
    variant: "outline" as const,
  },
  {
    plan: "Pro",
    price: "$7.99/mo",
    color: "border-primary",
    popular: true,
    features: ["Unlimited courses", "Unlimited notes", "Full analytics", "Reading goals"],
    cta: "Start Pro",
    href: "/login",
    variant: "default" as const,
  },
  {
    plan: "Premium",
    price: "$14.99/mo",
    color: "border-border",
    features: ["Everything in Pro", "Speed trends", "Completion forecasts", "Priority support"],
    cta: "Go Premium",
    href: "/login",
    variant: "outline" as const,
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 md:pb-32 md:pt-28">
        {/* Background decoration */}
        <div className="from-primary/8 absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-background to-background" />
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>The smarter way to study technical content</span>
          </div>
          <h1 className="mb-6 animate-slide-up text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Learn Deeper,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Read Smarter
            </span>
          </h1>
          <p className="stagger-1 mx-auto mb-10 max-w-2xl animate-slide-up text-lg text-muted-foreground md:text-xl">
            A distraction-free reading platform with notes, bookmarks, highlights, and analytics —
            built for serious learners who want to retain more.
          </p>
          <div className="stagger-2 flex animate-slide-up flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isLoggedIn ? (
              <Button size="lg" asChild className="gap-2 px-8 shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2 px-8 shadow-lg shadow-primary/20">
                  <Link href="/login">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Feature preview mockup */}
        <div className="stagger-3 mx-auto mt-16 max-w-5xl animate-slide-up md:mt-20">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/5 dark:shadow-black/20">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-green-400/70" />
              </div>
              <div className="mx-auto rounded-md bg-background/60 px-12 py-1 text-xs text-muted-foreground">
                learnbook.app/dashboard
              </div>
            </div>
            {/* Mockup content */}
            <div className="grid grid-cols-12 gap-0">
              {/* Sidebar */}
              <div className="col-span-3 hidden border-r bg-muted/20 p-4 md:block">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Backend Engineering</span>
                </div>
                <div className="space-y-1">
                  {[
                    "Networking Basics",
                    "HTTP Deep Dive",
                    "API Design",
                    "Databases",
                    "Caching",
                  ].map((ch, i) => (
                    <div
                      key={ch}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${i === 2 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
                    >
                      {i < 2 ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                      )}
                      <span>
                        Ch. {i + 1} — {ch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Main content */}
              <div className="col-span-12 p-6 md:col-span-9">
                <div className="mb-4">
                  <div className="mb-1 text-xs text-muted-foreground">Part I · Foundations</div>
                  <h3 className="text-lg font-bold">Ch. 3 — API Design</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>12 min read</span>
                    <span>2,400 words</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted/60" />
                  <div className="h-3 w-11/12 rounded bg-muted/60" />
                  <div className="h-3 w-10/12 rounded bg-muted/60" />
                  <div className="h-3 w-full rounded bg-muted/60" />
                  <div className="my-3 rounded-lg border-l-2 border-primary/40 bg-primary/5 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <StickyNote className="h-3 w-3" />
                      Note
                    </div>
                    <div className="h-2.5 w-3/4 rounded bg-primary/20" />
                  </div>
                  <div className="h-3 w-full rounded bg-muted/60" />
                  <div className="h-3 w-9/12 rounded bg-muted/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/30 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`animate-slide-up text-center stagger-${i + 1}`}>
              <s.icon className="mx-auto mb-2 h-5 w-5 text-primary/60" />
              <div className="text-2xl font-bold tracking-tight md:text-3xl">{s.value}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 animate-slide-up text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to learn effectively
            </h2>
            <p className="stagger-1 animate-slide-up text-muted-foreground md:text-lg">
              Purpose-built tools to keep you focused and track your progress.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`stagger-${(i % 6) + 1} group animate-slide-up rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5`}
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${f.bg} transition-transform duration-200 group-hover:scale-110`}
                >
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 animate-slide-up text-3xl font-bold tracking-tight md:text-4xl">
              Get started in three steps
            </h2>
            <p className="stagger-1 animate-slide-up text-muted-foreground md:text-lg">
              From upload to insights in minutes — no setup required.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`stagger-${i + 1} relative animate-slide-up text-center`}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-border md:block" />
                )}
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg}`}
                >
                  <step.icon className={`h-7 w-7 ${step.color}`} />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Step {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 animate-slide-up text-3xl font-bold tracking-tight md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="stagger-1 animate-slide-up text-muted-foreground md:text-lg">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPreview.map((p, i) => (
              <div
                key={p.plan}
                className={`stagger-${i + 1} relative animate-slide-up rounded-xl border-2 bg-card p-6 transition-all duration-200 hover:shadow-lg ${p.color} ${p.popular ? "shadow-lg shadow-primary/10 dark:shadow-primary/5" : ""}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold">{p.plan}</h3>
                <div className="mb-4 text-3xl font-bold text-primary">{p.price}</div>
                <ul className="mb-6 space-y-2.5">
                  {p.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={p.variant} asChild>
                  <Link href={isLoggedIn ? "/pricing" : p.href}>
                    {isLoggedIn ? "View Plans" : p.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:underline"
            >
              See full feature comparison <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-24 pt-4 sm:px-6">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card p-10 text-center shadow-lg md:p-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <Zap className="mx-auto mb-4 h-8 w-8 animate-fade-in text-primary" />
          <h2 className="mb-3 animate-slide-up text-3xl font-bold tracking-tight md:text-4xl">
            Ready to start learning?
          </h2>
          <p className="stagger-1 mb-8 animate-slide-up text-muted-foreground md:text-lg">
            Join thousands of readers and start your first course today. No credit card required.
          </p>
          <div className="stagger-2 animate-slide-up">
            <Button size="lg" asChild className="gap-2 px-8 shadow-lg shadow-primary/20">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
