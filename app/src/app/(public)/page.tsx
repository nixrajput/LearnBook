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
} from "lucide-react";
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
    icon: Zap,
    title: "Fast & Offline-Ready",
    desc: "Lightning-fast navigation through chapters, sections, and search.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
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

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-24 text-center md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>The smarter way to study technical content</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Learn Deeper, <span className="text-primary">Read Smarter</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            A distraction-free reading platform with notes, bookmarks, highlights, and analytics —
            built for serious learners.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/login">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              Everything you need to learn effectively
            </h2>
            <p className="text-muted-foreground">
              Purpose-built tools to keep you focused and track your progress.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6">
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${f.bg}`}
                >
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPreview.map((p) => (
              <div
                key={p.plan}
                className={`relative rounded-xl border-2 bg-card p-6 ${p.color} ${p.popular ? "shadow-lg" : ""}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold">{p.plan}</h3>
                <div className="mb-4 text-3xl font-bold text-primary">{p.price}</div>
                <ul className="mb-6 space-y-2">
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
                  <Link href={p.href}>{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/pricing" className="text-sm text-primary hover:underline">
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">Ready to start learning?</h2>
          <p className="mb-8 text-muted-foreground">
            Join and start your first course today. No credit card required.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link href="/login">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
