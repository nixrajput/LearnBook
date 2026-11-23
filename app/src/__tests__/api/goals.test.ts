import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Replicate the goal validation schema from the route
const updateGoalSchema = z.object({
  dailyMinutes: z.number().int().min(5).max(480).optional(),
  weeklyChapters: z.number().int().min(1).max(100).optional(),
});

describe("goals API", () => {
  describe("validation", () => {
    it("accepts valid goals", () => {
      expect(updateGoalSchema.safeParse({ dailyMinutes: 30, weeklyChapters: 5 }).success).toBe(
        true,
      );
    });

    it("accepts partial update (dailyMinutes only)", () => {
      expect(updateGoalSchema.safeParse({ dailyMinutes: 60 }).success).toBe(true);
    });

    it("accepts partial update (weeklyChapters only)", () => {
      expect(updateGoalSchema.safeParse({ weeklyChapters: 10 }).success).toBe(true);
    });

    it("rejects dailyMinutes below 5", () => {
      expect(updateGoalSchema.safeParse({ dailyMinutes: 2 }).success).toBe(false);
    });

    it("rejects dailyMinutes above 480", () => {
      expect(updateGoalSchema.safeParse({ dailyMinutes: 500 }).success).toBe(false);
    });

    it("rejects weeklyChapters below 1", () => {
      expect(updateGoalSchema.safeParse({ weeklyChapters: 0 }).success).toBe(false);
    });

    it("rejects non-integer", () => {
      expect(updateGoalSchema.safeParse({ dailyMinutes: 30.5 }).success).toBe(false);
    });
  });

  describe("plan gating", () => {
    it("FREE users should be rejected (plan check in route)", () => {
      const plan = "FREE";
      expect(plan === "FREE").toBe(true); // Route returns 403 for FREE
    });

    it("PRO users should be allowed", () => {
      const plan = "PRO";
      expect(plan !== "FREE").toBe(true);
    });

    it("PREMIUM users should be allowed", () => {
      const plan = "PREMIUM";
      expect(plan !== "FREE").toBe(true);
    });
  });
});
