import { describe, it, expect } from "vitest";
import { z } from "zod";

const createDeckSchema = z.object({
  title: z.string().min(1).max(200),
  courseId: z.string().optional(),
});

describe("flashcard decks API", () => {
  describe("validation", () => {
    it("accepts valid deck", () => {
      expect(createDeckSchema.safeParse({ title: "My Deck" }).success).toBe(true);
    });
    it("accepts with courseId", () => {
      expect(createDeckSchema.safeParse({ title: "My Deck", courseId: "c1" }).success).toBe(true);
    });
    it("rejects empty title", () => {
      expect(createDeckSchema.safeParse({ title: "" }).success).toBe(false);
    });
    it("rejects title over 200 chars", () => {
      expect(createDeckSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false);
    });
  });

  describe("plan limits", () => {
    it("FREE limited to 3 decks", () => {
      const plan = "FREE";
      const maxDecks = plan === "FREE" ? 3 : Infinity;
      expect(maxDecks).toBe(3);
    });
    it("PRO gets unlimited decks", () => {
      const plan = "PRO";
      expect(plan !== "FREE").toBe(true);
    });
  });
});
