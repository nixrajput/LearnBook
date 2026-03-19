import { describe, it, expect } from "vitest";

// Test the pure logic of analytics calculations
// These don't hit the DB — they test the math

describe("completion forecast rate calculation", () => {
  // Simulates the formula from getCompletionForecast
  function calcAvgPerDay(completions: number, daySpan: number): number {
    return (completions - 1) / daySpan;
  }

  it("calculates correct rate for 2 completions over 1 day", () => {
    // 2 data points, 1 interval → 1 completion per day
    expect(calcAvgPerDay(2, 1)).toBe(1);
  });

  it("calculates correct rate for 10 completions over 9 days", () => {
    // 10 data points, 9 intervals over 9 days → 1/day
    expect(calcAvgPerDay(10, 9)).toBe(1);
  });

  it("calculates correct rate for 5 completions over 10 days", () => {
    // 5 data points, 4 intervals over 10 days → 0.4/day
    expect(calcAvgPerDay(5, 10)).toBe(0.4);
  });

  it("returns 0 when only 1 completion (no intervals)", () => {
    expect(calcAvgPerDay(1, 1)).toBe(0);
  });
});

describe("WPM calculation", () => {
  function calcWpm(wordsRead: number, durationSec: number): number {
    return Math.round((wordsRead / durationSec) * 60);
  }

  it("calculates correct WPM", () => {
    // 200 words in 60 seconds = 200 WPM
    expect(calcWpm(200, 60)).toBe(200);
  });

  it("calculates for partial minute", () => {
    // 100 words in 30 seconds = 200 WPM
    expect(calcWpm(100, 30)).toBe(200);
  });

  it("handles fast reader", () => {
    // 500 words in 60 seconds = 500 WPM
    expect(calcWpm(500, 60)).toBe(500);
  });
});

describe("reading speed trend", () => {
  function calcTrend(sessions: number[]): number | null {
    if (sessions.length < 10) return null;
    const recent = sessions.slice(-5).reduce((s, v) => s + v, 0) / 5;
    const prior = sessions.slice(-10, -5).reduce((s, v) => s + v, 0) / 5;
    return Math.round(recent - prior);
  }

  it("returns null for fewer than 10 sessions", () => {
    expect(calcTrend([100, 120, 130])).toBeNull();
  });

  it("returns positive trend when improving", () => {
    const sessions = [100, 100, 100, 100, 100, 150, 150, 150, 150, 150];
    expect(calcTrend(sessions)).toBe(50);
  });

  it("returns negative trend when slowing", () => {
    const sessions = [200, 200, 200, 200, 200, 150, 150, 150, 150, 150];
    expect(calcTrend(sessions)).toBe(-50);
  });

  it("returns 0 for stable speed", () => {
    const sessions = [150, 150, 150, 150, 150, 150, 150, 150, 150, 150];
    expect(calcTrend(sessions)).toBe(0);
  });
});
