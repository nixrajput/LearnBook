import { describe, it, expect } from "vitest";
import { z } from "zod";

const updatePlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50).optional(),
  priceMonthly: z.number().int().min(0).optional(),
  priceYearly: z.number().int().min(0).optional(),
  stripePriceIdMonthly: z.string().nullable().optional(),
  stripePriceIdYearly: z.string().nullable().optional(),
  features: z.string().optional(),
  maxNotes: z.number().int().optional(),
  maxBookmarks: z.number().int().optional(),
  maxHighlights: z.number().int().optional(),
  maxCourses: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

describe("admin plans API validation", () => {
  it("accepts valid plan update with id", () => {
    const r = updatePlanSchema.safeParse({ id: "plan1", name: "Pro Plus", priceMonthly: 999 });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = updatePlanSchema.safeParse({ name: "Pro Plus" });
    expect(r.success).toBe(false);
  });

  it("accepts updating limits", () => {
    const r = updatePlanSchema.safeParse({ id: "p1", maxNotes: 100, maxBookmarks: 50 });
    expect(r.success).toBe(true);
  });

  it("accepts -1 for unlimited", () => {
    const r = updatePlanSchema.safeParse({ id: "p1", maxNotes: -1 });
    expect(r.success).toBe(true);
  });

  it("accepts nullable stripe price IDs", () => {
    const r = updatePlanSchema.safeParse({ id: "p1", stripePriceIdMonthly: null });
    expect(r.success).toBe(true);
  });

  it("accepts toggling isActive", () => {
    const r = updatePlanSchema.safeParse({ id: "p1", isActive: false });
    expect(r.success).toBe(true);
  });

  it("rejects negative prices", () => {
    const r = updatePlanSchema.safeParse({ id: "p1", priceMonthly: -100 });
    expect(r.success).toBe(false);
  });
});
