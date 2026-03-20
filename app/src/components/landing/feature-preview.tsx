"use client";

import { useState } from "react";
import {
  BookOpen,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
  StickyNote,
  Flame,
  Brain,
  MessageSquare,
  LayoutDashboard,
  BookMarked,
  Users,
  Settings,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "reader", label: "Reader", icon: BookOpen },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "ai", label: "AI Tools", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function FeaturePreview() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="mx-auto mt-16 max-w-5xl md:mt-20">
      {/* Tab selector */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex items-center rounded-lg border bg-muted/40 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mockup window */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/5 dark:shadow-black/20">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <div className="mx-auto rounded-md bg-background/60 px-12 py-1 text-xs text-muted-foreground">
            {activeTab === "reader" && "learnbook.app/course/api-design"}
            {activeTab === "dashboard" && "learnbook.app/dashboard"}
            {activeTab === "flashcards" && "learnbook.app/review"}
            {activeTab === "ai" && "learnbook.app/course/api-design"}
          </div>
        </div>

        {/* Content area — left sidebar + main */}
        <div className="flex min-h-[340px]">
          {/* Mock App Sidebar */}
          <MockAppSidebar activeTab={activeTab} />

          {/* Main content */}
          <div className="min-w-0 flex-1 transition-all duration-300">
            {activeTab === "reader" && <ReaderMockup />}
            {activeTab === "dashboard" && <DashboardMockup />}
            {activeTab === "flashcards" && <FlashcardMockup />}
            {activeTab === "ai" && <AiToolsMockup />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mock App Sidebar (mirrors the real AppSidebar) ──────────── */
function MockAppSidebar({ activeTab }: { activeTab: TabId }) {
  const mainNav = [
    { icon: LayoutDashboard, label: "Dashboard", active: activeTab === "dashboard" },
    { icon: BookOpen, label: "Courses", active: activeTab === "reader" },
    { icon: Library, label: "Library", active: false },
  ];
  const studyNav = [
    { icon: StickyNote, label: "Notes", active: false },
    { icon: BookMarked, label: "Bookmarks", active: false },
    { icon: Layers, label: "Flashcards", active: activeTab === "flashcards" },
  ];
  const exploreNav = [
    { icon: Users, label: "Groups", active: false },
    { icon: Brain, label: "Knowledge", active: false },
    { icon: Sparkles, label: "AI Credits", active: activeTab === "ai" },
  ];

  return (
    <div className="hidden w-40 shrink-0 border-r bg-card md:block">
      {/* Logo area */}
      <div className="flex h-10 items-center gap-1.5 border-b px-3">
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold">LearnBook</span>
      </div>

      <div className="p-2">
        {/* Main group */}
        <div className="mb-2 px-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Main
        </div>
        {mainNav.map((item) => (
          <div
            key={item.label}
            className={cn(
              "mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px]",
              item.active
                ? "bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </div>
        ))}

        {/* Study group */}
        <div className="mb-2 mt-3 px-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Study
        </div>
        {studyNav.map((item) => (
          <div
            key={item.label}
            className={cn(
              "mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px]",
              item.active
                ? "bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </div>
        ))}

        {/* Explore group */}
        <div className="mb-2 mt-3 px-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Explore
        </div>
        {exploreNav.map((item) => (
          <div
            key={item.label}
            className={cn(
              "mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px]",
              item.active
                ? "bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </div>
        ))}

        {/* Bottom — settings */}
        <div className="mt-4 border-t pt-2">
          <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-muted-foreground">
            <Settings className="h-3 w-3" />
            Settings
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reader Mockup ──────────────────────────────────────────── */
function ReaderMockup() {
  return (
    <div className="flex">
      {/* Chapter sidebar (TOC) */}
      <div className="hidden w-44 shrink-0 border-r bg-muted/10 p-3 lg:block">
        <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold">
          <BookOpen className="h-3 w-3 text-primary" />
          <span>Backend Engineering</span>
        </div>
        <div className="space-y-0.5">
          {["Networking Basics", "HTTP Deep Dive", "API Design", "Databases", "Caching"].map(
            (ch, i) => (
              <div
                key={ch}
                className={cn(
                  "flex items-center gap-1.5 rounded px-1.5 py-1 text-[9px]",
                  i === 2
                    ? "bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground",
                )}
              >
                {i < 2 ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                ) : i === 2 ? (
                  <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-indigo-500" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full border border-muted-foreground/30" />
                )}
                <span className="truncate">
                  Ch. {i + 1} — {ch}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="mb-4">
          <div className="mb-1 text-xs text-muted-foreground">Part I · Foundations</div>
          <h3 className="text-lg font-bold">Ch. 3 — API Design</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>12 min read</span>
            <span>2,400 words</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <Flame className="h-3 w-3" /> 5 day streak
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-11/12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-10/12 rounded bg-zinc-200 dark:bg-zinc-700" />
          {/* Note + AI inline */}
          <div className="my-3 flex gap-3">
            <div className="flex-1 rounded-lg border-l-2 border-amber-400 bg-amber-500/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <StickyNote className="h-3 w-3" />
                My Note
              </div>
              <div className="text-[10px] text-muted-foreground">
                REST uses standard HTTP verbs for CRUD operations...
              </div>
            </div>
            <div className="flex-1 rounded-lg border bg-indigo-500/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3 w-3" />
                AI Explanation
              </div>
              <div className="text-[10px] text-muted-foreground">
                REST (Representational State Transfer) is an architectural style...
              </div>
            </div>
          </div>
          <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-9/12 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Mockup ───────────────────────────────────────── */
function DashboardMockup() {
  const heatmapData = [
    3, 0, 2, 1, 3, 2, 0, 1, 3, 2, 2, 0, 1, 3, 0, 2, 1, 3, 2, 1, 0, 1, 2, 3, 1, 0, 2, 1,
  ];

  return (
    <div className="p-6">
      {/* Stats row */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: "Completed", value: "12/27", color: "text-emerald-500" },
          { label: "In Progress", value: "3", color: "text-blue-500" },
          { label: "Streak", value: "5d", color: "text-orange-500" },
          { label: "Notes", value: "24", color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-muted/20 p-3">
            <div className={cn("text-lg font-bold tabular-nums", s.color)}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Progress bar */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">44%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[44%] rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </div>
          <div className="mt-3 space-y-1.5">
            {["Foundations", "Core Concepts", "Advanced"].map((part, i) => (
              <div key={part} className="flex items-center gap-2 text-[10px]">
                <span className="w-20 text-muted-foreground">{part}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      i === 0
                        ? "w-full bg-emerald-500"
                        : i === 1
                          ? "w-[60%] bg-indigo-500"
                          : "w-[10%] bg-indigo-300 dark:bg-indigo-700",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium">Reading Activity</span>
            <span className="text-muted-foreground">Last 28 days</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((level, i) => (
              <div
                key={i}
                className={cn(
                  "h-4 rounded-sm",
                  level === 0
                    ? "bg-secondary"
                    : level === 1
                      ? "bg-indigo-200 dark:bg-indigo-900"
                      : level === 2
                        ? "bg-indigo-400 dark:bg-indigo-600"
                        : "bg-indigo-600 dark:bg-indigo-400",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Flashcard Mockup ───────────────────────────────────────── */
function FlashcardMockup() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Progress */}
      <div className="mb-4 flex w-full max-w-sm items-center justify-between text-xs text-muted-foreground">
        <span>Backend Engineering</span>
        <span>3 / 12</span>
      </div>
      <div className="mb-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/4 rounded-full bg-indigo-600 dark:bg-indigo-400" />
      </div>

      {/* Card */}
      <div className="mb-6 w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-lg">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Question
        </div>
        <p className="text-base font-medium leading-relaxed">
          What are the key differences between REST and GraphQL API architectures?
        </p>
      </div>

      {/* Rating buttons */}
      <div className="grid w-full max-w-sm grid-cols-4 gap-2">
        {[
          { label: "Again", color: "border-red-200 text-red-500 dark:border-red-900" },
          { label: "Hard", color: "border-amber-200 text-amber-500 dark:border-amber-900" },
          { label: "Good", color: "border-emerald-200 text-emerald-500 dark:border-emerald-900" },
          { label: "Easy", color: "border-blue-200 text-blue-500 dark:border-blue-900" },
        ].map((r) => (
          <div
            key={r.label}
            className={cn("rounded-lg border py-2 text-center text-xs font-semibold", r.color)}
          >
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── AI Tools Mockup ────────────────────────────────────────── */
function AiToolsMockup() {
  return (
    <div className="grid grid-cols-12 gap-0">
      {/* Reader content (left) */}
      <div className="col-span-12 border-r p-6 md:col-span-7">
        <div className="mb-3">
          <h3 className="text-sm font-bold">Ch. 3 — API Design</h3>
          <div className="mt-1 text-xs text-muted-foreground">12 min read · 2,400 words</div>
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-2.5 w-11/12 rounded bg-zinc-200 dark:bg-zinc-700" />
          {/* Highlighted text with AI popover */}
          <div className="relative my-2 rounded-md bg-amber-100/50 p-2 dark:bg-amber-900/20">
            <div className="text-xs leading-relaxed">
              <span className="bg-amber-200/70 dark:bg-amber-800/50">
                REST uses standard HTTP methods (GET, POST, PUT, DELETE) while GraphQL provides a
                single endpoint with a query language.
              </span>
            </div>
            {/* AI popover */}
            <div className="absolute -right-2 top-full z-10 mt-1 w-48 rounded-lg border bg-card p-2.5 shadow-lg">
              <div className="flex gap-1.5">
                <div className="flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-2.5 w-2.5" /> Explain
                </div>
                <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Layers className="h-2.5 w-2.5" /> Flashcard
                </div>
              </div>
            </div>
          </div>
          <div className="h-2.5 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-2.5 w-10/12 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* AI Chat panel (right) */}
      <div className="col-span-12 flex flex-col md:col-span-5">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            Ask about API Design
          </div>
        </div>
        <div className="flex-1 space-y-3 p-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-indigo-600 px-3 py-2 text-[10px] text-white dark:bg-indigo-500">
              When should I use GraphQL over REST?
            </div>
          </div>
          {/* AI response */}
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-[10px] leading-relaxed">
              Based on Chapter 3, GraphQL excels when you need to fetch data from multiple related
              resources in a single request, avoiding the N+1 problem common in REST APIs...
            </div>
          </div>
          {/* Knowledge graph hint */}
          <div className="rounded-lg border bg-card p-2">
            <div className="mb-1 flex items-center gap-1 text-[9px] font-medium text-violet-600 dark:text-violet-400">
              <Brain className="h-2.5 w-2.5" /> Related Concepts
            </div>
            <div className="flex flex-wrap gap-1">
              {["REST API", "GraphQL", "HTTP Methods", "Query Language"].map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[8px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
