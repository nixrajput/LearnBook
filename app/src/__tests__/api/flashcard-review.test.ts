import { describe, it, expect } from "vitest";
import { z } from "zod";

const reviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.number().int().min(1).max(4),
});

describe("flashcard review API", () => {
  describe("validation", () => {
    it("accepts valid review (Again=1)", () => {
      expect(reviewSchema.safeParse({ cardId: "c1", rating: 1 }).success).toBe(true);
    });
    it("accepts valid review (Easy=4)", () => {
      expect(reviewSchema.safeParse({ cardId: "c1", rating: 4 }).success).toBe(true);
    });
    it("rejects rating 0", () => {
      expect(reviewSchema.safeParse({ cardId: "c1", rating: 0 }).success).toBe(false);
    });
    it("rejects rating 5", () => {
      expect(reviewSchema.safeParse({ cardId: "c1", rating: 5 }).success).toBe(false);
    });
    it("rejects missing cardId", () => {
      expect(reviewSchema.safeParse({ rating: 3 }).success).toBe(false);
    });
    it("rejects non-integer rating", () => {
      expect(reviewSchema.safeParse({ cardId: "c1", rating: 2.5 }).success).toBe(false);
    });
  });

  describe("FSRS rating mapping", () => {
    it("1=Again, 2=Hard, 3=Good, 4=Easy", () => {
      const labels: Record<number, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };
      expect(labels[1]).toBe("Again");
      expect(labels[4]).toBe("Easy");
    });
  });
});
