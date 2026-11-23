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
  Brain,
  Layers,
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Shield,
  ChevronDown,
} from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Parallax } from "@/components/shared/parallax";
import { FeaturePreview } from "@/components/landing/feature-preview";

export const metadata: Metadata = {
  title: "LearnBook — Learn Deeper, Read Smarter",
  description:
    "A distraction-free reading platform with notes, bookmarks, highlights, AI-powered study tools, and analytics to supercharge your learning.",
};

/* ── Data ────────────────────────────────────────────────────────────── */

const coreFeatures = [
  {
    icon: BookOpen,
    title: "Distraction-Free Reader",
    desc: "Beautiful reading experience with customizable fonts, themes, and reading width. Your content, your way.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: StickyNote,
    title: "Smart Notes & Highlights",
    desc: "Take contextual notes tied to chapters, sections, or text selections. Highlight and annotate everything.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Reading Analytics",
    desc: "Track progress, streaks, reading speed, and focus time. Set daily and weekly goals.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Study Assistant",
    desc: "Select any text to get AI explanations. Summarize chapters, ask questions — all grounded in your content.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Layers,
    title: "Flashcards & Spaced Repetition",
    desc: "Generate flashcards from highlights with FSRS scheduling. Review smarter, remember longer.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Brain,
    title: "Knowledge Graph",
    desc: "Visualize how concepts connect across chapters and courses. See the big picture of your learning.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

const advancedFeatures = [
  {
    icon: FileText,
    title: "Multi-Format Support",
    desc: "Import Markdown, PDF, EPUB, or web articles. One reader for all your study material.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: Users,
    title: "Study Groups",
    desc: "Create groups, share annotations, discuss per-chapter, and compete on leaderboards.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: MessageSquare,
    title: "AI Quiz & Study Sessions",
    desc: "Interactive Socratic sessions that quiz you, identify weak areas, and auto-create flashcards.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Find anything across chapters, notes, and sections in milliseconds with Cmd+K.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Flame,
    title: "Streak & Goal Tracking",
    desc: "Build consistent study habits with daily streaks, weekly goals, and activity heatmaps.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your data stays yours. No ads, no tracking, no selling your reading habits.",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
  },
];

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Import Your Content",
    desc: "Upload Markdown, PDF, EPUB, or paste a URL. We parse it into a structured, annotatable format.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    num: "02",
    icon: BookOpen,
    title: "Read & Annotate",
    desc: "Enjoy a focused reader with notes, bookmarks, highlights, and AI explanations on any selection.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    num: "03",
    icon: Layers,
    title: "Review & Retain",
    desc: "AI generates flashcards from your highlights. FSRS scheduling ensures you review at the optimal time.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    num: "04",
    icon: TrendingUp,
    title: "Track & Improve",
    desc: "Detailed analytics show your reading speed, streaks, and knowledge gaps. Set goals and hit them.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const pricingPreview = [
  {
    plan: "Starter",
    price: "Free",
    color: "border-border",
    features: [
      "3 courses, 50 notes",
      "100 AI credits/month",
      "3 flashcard decks",
      "Basic analytics",
    ],
    cta: "Get Started",
    href: "/login",
    variant: "outline" as const,
  },
  {
    plan: "Pro",
    price: "₹499/mo",
    color: "border-primary",
    popular: true,
    features: [
      "Unlimited everything",
      "1,500 AI credits/month",
      "AI Study Sessions",
      "Create study groups",
    ],
    cta: "Start Pro",
    href: "/login",
    variant: "default" as const,
  },
  {
    plan: "Premium",
    price: "₹999/mo",
    color: "border-border",
    features: [
      "Everything in Pro",
      "10,000 AI credits (all models)",
      "Full knowledge graph",
      "Priority support",
    ],
    cta: "Go Premium",
    href: "/login",
    variant: "outline" as const,
  },
];

const faqs = [
  {
    q: "What content formats are supported?",
    a: "Markdown, PDF, EPUB, and web articles via URL import. All formats are parsed into our annotatable reader.",
  },
  {
    q: "How does the AI study assistant work?",
    a: "Select any text to get contextual explanations. Ask questions about the chapter, generate flashcards, or start an interactive quiz — all grounded in your actual content, not generic answers.",
  },
  {
    q: "What is FSRS spaced repetition?",
    a: "FSRS (Free Spaced Repetition Scheduler) is a modern algorithm that adapts flashcard review intervals based on your performance — proven superior to Anki's SM-2 algorithm.",
  },
  {
    q: "Can I study with friends?",
    a: "Yes! Create study groups, share highlights and notes, discuss per-chapter, and compete on weekly leaderboards.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. We don't sell your data, show ads, or track your reading habits. Your notes, highlights, and reading data belong to you.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All paid plans include a 14-day money-back guarantee. Cancel anytime from your profile — no questions asked.",
  },
];

/* ── Page ────────────────────────────────────────────────────────────── */

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 md:pb-32 md:pt-28">
        {/* Background decoration with parallax */}
        <Parallax speed={0.15} className="absolute inset-0 -z-10">
          <div className="from-primary/8 absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-background to-background" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="bg-indigo-500/3 absolute right-1/4 top-1/3 h-[300px] w-[400px] rounded-full blur-3xl" />
        </Parallax>

        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal animation="fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Read → Highlight → Flashcard → Review → Remember</span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Learn Deeper,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Read Smarter
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              The only platform that unifies reading, annotation, AI study tools, flashcards, and
              analytics in a single distraction-free experience.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
          </ScrollReveal>
        </div>

        {/* Feature preview — multi-tab mockup */}
        <ScrollReveal animation="fade-up" delay={400}>
          <FeaturePreview />
        </ScrollReveal>
      </section>

      {/* ── The Problem We Solve ──────────────────────────────────────────── */}
      <section className="border-y bg-muted/30 px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Stop juggling 5 apps to study
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-muted-foreground md:text-lg">
              Most students use a reader + note app + flashcard app + analytics tool + AI assistant
              separately. LearnBook unifies everything into one seamless workflow.
            </p>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                label: "Fragmented tools",
                desc: "No more switching between Kindle, Notion, Anki, and ChatGPT",
                icon: Zap,
              },
              {
                label: "Dead-end highlights",
                desc: "Your highlights become flashcards that you actually review",
                icon: Bookmark,
              },
              {
                label: "Passive reading",
                desc: "AI quizzes and study sessions turn reading into active recall",
                icon: Brain,
              },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 100}>
                <div className="rounded-xl border bg-card p-6 text-left">
                  <item.icon className="mb-3 h-5 w-5 text-primary" />
                  <h3 className="mb-1 font-semibold">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Features ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Everything you need to learn effectively
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Purpose-built tools to keep you focused and help you retain more.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="group h-full rounded-xl border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${f.bg} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                From reading to mastery in 4 steps
              </h2>
              <p className="text-muted-foreground md:text-lg">
                A complete study loop — no app switching, no manual exports.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 120}>
                <div className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-border md:block" />
                  )}
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg} transition-transform duration-300 hover:scale-105`}
                  >
                    <step.icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Step {step.num}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Advanced Features ─────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                And much more under the hood
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Advanced features that power-users love.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advancedFeatures.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 60}>
                <div className="group flex h-full items-start gap-4 rounded-xl border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${f.bg} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <f.icon className={`h-4 w-4 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">{f.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ───────────────────────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Start free. Upgrade when you need more.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPreview.map((p, i) => (
              <ScrollReveal key={p.plan} delay={i * 100}>
                <div
                  className={`relative h-full rounded-xl border-2 bg-card p-6 transition-all duration-300 hover:shadow-lg ${p.color} ${p.popular ? "shadow-lg shadow-primary/10 dark:shadow-primary/5" : ""}`}
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
              </ScrollReveal>
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

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Frequently asked questions
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <details className="group rounded-xl border bg-card transition-all duration-300 hover:border-primary/20 [&[open]]:shadow-sm">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="border-t px-6 py-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-24 pt-4 sm:px-6">
        <ScrollReveal animation="scale">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card p-10 text-center shadow-lg md:p-14">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
            <Zap className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Ready to transform your study workflow?
            </h2>
            <p className="mb-8 text-muted-foreground md:text-lg">
              Join learners who&apos;ve replaced 5 apps with one. No credit card required.
            </p>
            <Button size="lg" asChild className="gap-2 px-8 shadow-lg shadow-primary/20">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
