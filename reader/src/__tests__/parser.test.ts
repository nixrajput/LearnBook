import { describe, it, expect, beforeAll } from "vitest";
import {
  parseMarkdownFile,
  getCourseDescription,
  resolveNotesFilePath,
} from "@/lib/content/parser";
import { resolve } from "path";

// Point at the notes collection inside the monorepo
const notesDir = resolve(__dirname, "../../../courses/backend-learning");
const contentPath = resolve(notesDir, "backend_learning_notes.md");

// Also set env so resolveNotesFilePath works via the env path
beforeAll(() => {
  process.env.NOTES_PATH = notesDir;
});

describe("parseMarkdownFile", () => {
  it("parses 9 parts", () => {
    const parts = parseMarkdownFile(contentPath);
    expect(parts).toHaveLength(9);
  });

  it("parses 27 chapters total", () => {
    const parts = parseMarkdownFile(contentPath);
    const total = parts.reduce((sum, p) => sum + p.chapters.length, 0);
    expect(total).toBe(27);
  });

  it("assigns correct roman numerals", () => {
    const parts = parseMarkdownFile(contentPath);
    const numerals = parts.map((p) => p.romanNumeral);
    expect(numerals).toContain("I");
    expect(numerals).toContain("IX");
  });

  it("generates unique slugs for all chapters", () => {
    const parts = parseMarkdownFile(contentPath);
    const slugs = parts.flatMap((p) => p.chapters.map((c) => c.slug));
    expect(new Set(slugs).size).toBe(27);
  });

  it("each chapter has sections", () => {
    const parts = parseMarkdownFile(contentPath);
    for (const part of parts) {
      for (const chapter of part.chapters) {
        expect(chapter.sections.length).toBeGreaterThan(0);
      }
    }
  });

  it("chapter 1 has expected sections", () => {
    const parts = parseMarkdownFile(contentPath);
    const ch1 = parts[0].chapters[0];
    expect(ch1.number).toBe(1);
    const headings = ch1.sections.map((s) => s.heading);
    expect(headings).toContain("Why this matters");
    expect(headings).toContain("Core ideas");
  });

  it("calculates reading time > 0", () => {
    const parts = parseMarkdownFile(contentPath);
    for (const part of parts)
      for (const chapter of part.chapters) expect(chapter.readingTimeMin).toBeGreaterThan(0);
  });

  it("word counts are positive", () => {
    const parts = parseMarkdownFile(contentPath);
    for (const part of parts)
      for (const chapter of part.chapters) expect(chapter.wordCount).toBeGreaterThan(0);
  });
});

describe("getCourseDescription", () => {
  it("returns a non-empty description", () => {
    expect(getCourseDescription(contentPath).length).toBeGreaterThan(0);
  });
});

describe("resolveNotesFilePath via NOTES_PATH env", () => {
  it("resolves to the correct file when NOTES_PATH is set", () => {
    const resolved = resolveNotesFilePath();
    expect(resolved).toContain("backend_learning_notes.md");
  });
});
