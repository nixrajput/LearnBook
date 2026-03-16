import { describe, it, expect } from "vitest";
import { createNoteSchema, updateNoteSchema } from "@/lib/validators/note";
import { updateProgressSchema } from "@/lib/validators/progress";
import { createBookmarkSchema } from "@/lib/validators/bookmark";
import { exportPayloadSchema } from "@/lib/validators/import-export";

describe("createNoteSchema", () => {
  it("accepts valid note", () => {
    const r = createNoteSchema.safeParse({ chapterId: "abc", content: "my note" });
    expect(r.success).toBe(true);
  });
  it("rejects empty content", () => {
    const r = createNoteSchema.safeParse({ chapterId: "abc", content: "" });
    expect(r.success).toBe(false);
  });
  it("rejects missing chapterId", () => {
    const r = createNoteSchema.safeParse({ content: "note" });
    expect(r.success).toBe(false);
  });
});

describe("updateProgressSchema", () => {
  it("accepts valid progress", () => {
    const r = updateProgressSchema.safeParse({ scrollPosition: 0.5 });
    expect(r.success).toBe(true);
  });
  it("rejects scroll > 1", () => {
    const r = updateProgressSchema.safeParse({ scrollPosition: 1.5 });
    expect(r.success).toBe(false);
  });
  it("rejects scroll < 0", () => {
    const r = updateProgressSchema.safeParse({ scrollPosition: -0.1 });
    expect(r.success).toBe(false);
  });
  it("accepts optional completed flag", () => {
    const r = updateProgressSchema.safeParse({ scrollPosition: 0.9, completed: true });
    expect(r.success).toBe(true);
  });
});

describe("createBookmarkSchema", () => {
  it("accepts valid bookmark", () => {
    const r = createBookmarkSchema.safeParse({ chapterId: "ch1" });
    expect(r.success).toBe(true);
  });
  it("accepts with optional sectionId", () => {
    const r = createBookmarkSchema.safeParse({ chapterId: "ch1", sectionId: "s1" });
    expect(r.success).toBe(true);
  });
});

describe("exportPayloadSchema", () => {
  const valid = {
    version: 1 as const,
    exportedAt: "2026-01-01T00:00:00Z",
    notes: [],
    bookmarks: [],
    highlights: [],
    progress: [],
    preferences: {
      theme: "system",
      fontSize: 16,
      lineWidth: "md",
      fontFamily: "sans",
      showLineNumbers: true,
    },
  };

  it("accepts valid payload", () => {
    expect(exportPayloadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects wrong version", () => {
    expect(exportPayloadSchema.safeParse({ ...valid, version: 2 }).success).toBe(false);
  });
});
