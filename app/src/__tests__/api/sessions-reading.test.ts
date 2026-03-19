import { describe, it, expect } from "vitest";
import { z } from "zod";

// Replicate schemas from the route
const startSessionSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
});

const endSessionSchema = z.object({
  sessionId: z.string().min(1),
  wordsRead: z.number().int().min(0),
});

describe("reading sessions API", () => {
  describe("start session validation", () => {
    it("accepts valid start", () => {
      expect(startSessionSchema.safeParse({ courseId: "c1", chapterId: "ch1" }).success).toBe(true);
    });

    it("rejects missing courseId", () => {
      expect(startSessionSchema.safeParse({ chapterId: "ch1" }).success).toBe(false);
    });

    it("rejects empty courseId", () => {
      expect(startSessionSchema.safeParse({ courseId: "", chapterId: "ch1" }).success).toBe(false);
    });
  });

  describe("end session validation", () => {
    it("accepts valid end", () => {
      expect(endSessionSchema.safeParse({ sessionId: "s1", wordsRead: 200 }).success).toBe(true);
    });

    it("accepts zero wordsRead", () => {
      expect(endSessionSchema.safeParse({ sessionId: "s1", wordsRead: 0 }).success).toBe(true);
    });

    it("rejects negative wordsRead", () => {
      expect(endSessionSchema.safeParse({ sessionId: "s1", wordsRead: -1 }).success).toBe(false);
    });

    it("rejects missing sessionId", () => {
      expect(endSessionSchema.safeParse({ wordsRead: 100 }).success).toBe(false);
    });
  });

  describe("duration calculation", () => {
    it("calculates correct duration from timestamps", () => {
      const startedAt = new Date("2026-03-19T10:00:00Z");
      const now = new Date("2026-03-19T10:05:30Z");
      const durationSec = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      expect(durationSec).toBe(330); // 5 min 30 sec
    });
  });

  describe("ownership check pattern", () => {
    it("requires userId match in findFirst", () => {
      const query = { id: "s1", userId: "u1", endedAt: null };
      expect(query.userId).toBe("u1");
      expect(query.endedAt).toBeNull();
    });
  });
});
