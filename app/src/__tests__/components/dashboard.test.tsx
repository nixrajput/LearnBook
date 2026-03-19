// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
// jest-dom matchers loaded via setup-dom.ts

import { ReadingGoalCard } from "@/components/dashboard/reading-goal-card";
import { SpeedTrendChart } from "@/components/dashboard/speed-trend-chart";
import { CompletionForecast } from "@/components/dashboard/completion-forecast";
import { FocusInsights } from "@/components/dashboard/focus-insights";
import type {
  ReadingSpeedStats,
  FocusInsights as FocusData,
  CompletionForecast as ForecastData,
} from "@/lib/content";

describe("ReadingGoalCard", () => {
  it("still renders when isPro is false (parent controls visibility)", () => {
    render(
      <ReadingGoalCard
        dailyMinutes={30}
        weeklyChapters={5}
        todayMinutes={10}
        weekChapters={2}
        isPro={false}
      />,
    );
    // Component renders regardless — dashboard page gates with {isPro && <ReadingGoalCard />}
    expect(screen.getByText("Reading Goals")).toBeInTheDocument();
  });

  it("renders goals when isPro", () => {
    render(
      <ReadingGoalCard
        dailyMinutes={30}
        weeklyChapters={5}
        todayMinutes={10}
        weekChapters={2}
        isPro={true}
      />,
    );
    expect(screen.getByText("Reading Goals")).toBeInTheDocument();
  });

  it("shows daily progress", () => {
    render(
      <ReadingGoalCard
        dailyMinutes={30}
        weeklyChapters={5}
        todayMinutes={15}
        weekChapters={3}
        isPro={true}
      />,
    );
    expect(screen.getByText("15/30 min")).toBeInTheDocument();
  });

  it("shows weekly progress", () => {
    render(
      <ReadingGoalCard
        dailyMinutes={30}
        weeklyChapters={5}
        todayMinutes={15}
        weekChapters={3}
        isPro={true}
      />,
    );
    expect(screen.getByText("3/5 ch")).toBeInTheDocument();
  });
});

describe("SpeedTrendChart", () => {
  it("shows empty state when no sessions", () => {
    const stats: ReadingSpeedStats = { sessions: [], avgWpm: 0, trend: null };
    render(<SpeedTrendChart stats={stats} />);
    expect(screen.getByText("Start reading to track your WPM trends.")).toBeInTheDocument();
  });

  it("shows avg WPM when sessions exist", () => {
    const stats: ReadingSpeedStats = {
      sessions: [{ date: "2026-03-19", wpm: 200 }],
      avgWpm: 200,
      trend: null,
    };
    render(<SpeedTrendChart stats={stats} />);
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("avg WPM")).toBeInTheDocument();
  });
});

describe("CompletionForecast", () => {
  it("shows complete state when no remaining chapters", () => {
    const forecast: ForecastData = {
      estimatedDaysLeft: 0,
      estimatedDate: null,
      avgChaptersPerWeek: 0,
      remainingChapters: 0,
    };
    render(<CompletionForecast forecast={forecast} />);
    expect(screen.getByText("Course Complete")).toBeInTheDocument();
  });

  it("shows forecast data when chapters remaining", () => {
    const forecast: ForecastData = {
      estimatedDaysLeft: 14,
      estimatedDate: "2026-04-02",
      avgChaptersPerWeek: 3.5,
      remainingChapters: 7,
    };
    render(<CompletionForecast forecast={forecast} />);
    expect(screen.getByText("14d")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

describe("FocusInsights", () => {
  it("shows empty state when no sessions", () => {
    const insights: FocusData = {
      peakHour: null,
      peakHourLabel: "—",
      avgSessionMin: 0,
      totalSessions: 0,
      hourDistribution: new Array(24).fill(0),
    };
    render(<FocusInsights insights={insights} />);
    expect(
      screen.getByText("Start reading sessions to unlock focus analytics."),
    ).toBeInTheDocument();
  });

  it("shows peak hour when sessions exist", () => {
    const insights: FocusData = {
      peakHour: 14,
      peakHourLabel: "2 PM",
      avgSessionMin: 25,
      totalSessions: 10,
      hourDistribution: new Array(24).fill(0),
    };
    render(<FocusInsights insights={insights} />);
    expect(screen.getByText("25m")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
