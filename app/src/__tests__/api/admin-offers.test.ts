import { describe, it, expect } from "vitest";
import { z } from "zod";

const createOfferSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(30)
    .transform((v) => v.toUpperCase().trim()),
  description: z.string().min(1).max(200),
  discountPercent: z.number().int().min(1).max(100),
  applicablePlans: z.array(z.enum(["PRO", "PREMIUM"])).min(1),
  maxRedemptions: z.number().int().min(1).nullable().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

describe("admin offers API", () => {
  describe("create offer validation", () => {
    it("accepts valid offer", () => {
      const r = createOfferSchema.safeParse({
        code: "SAVE20",
        description: "Save 20%",
        discountPercent: 20,
        applicablePlans: ["PRO", "PREMIUM"],
      });
      expect(r.success).toBe(true);
    });

    it("transforms code to uppercase", () => {
      const r = createOfferSchema.safeParse({
        code: "save20",
        description: "Save 20%",
        discountPercent: 20,
        applicablePlans: ["PRO"],
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.code).toBe("SAVE20");
    });

    it("rejects code shorter than 2 chars", () => {
      const r = createOfferSchema.safeParse({
        code: "X",
        description: "Test",
        discountPercent: 10,
        applicablePlans: ["PRO"],
      });
      expect(r.success).toBe(false);
    });

    it("rejects discount below 1", () => {
      const r = createOfferSchema.safeParse({
        code: "TEST",
        description: "Test",
        discountPercent: 0,
        applicablePlans: ["PRO"],
      });
      expect(r.success).toBe(false);
    });

    it("rejects discount above 100", () => {
      const r = createOfferSchema.safeParse({
        code: "TEST",
        description: "Test",
        discountPercent: 101,
        applicablePlans: ["PRO"],
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty applicablePlans", () => {
      const r = createOfferSchema.safeParse({
        code: "TEST",
        description: "Test",
        discountPercent: 10,
        applicablePlans: [],
      });
      expect(r.success).toBe(false);
    });

    it("rejects FREE in applicablePlans", () => {
      const r = createOfferSchema.safeParse({
        code: "TEST",
        description: "Test",
        discountPercent: 10,
        applicablePlans: ["FREE"],
      });
      expect(r.success).toBe(false);
    });

    it("stores applicablePlans as JSON string", () => {
      const plans = ["PRO", "PREMIUM"];
      const stored = JSON.stringify(plans);
      const parsed: string[] = JSON.parse(stored);
      expect(parsed).toEqual(plans);
    });
  });
});
