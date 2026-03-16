import { readFileSync } from "fs";
import { join, resolve, isAbsolute } from "path";
import type { ParsedPart, ParsedChapter, ParsedSection } from "@/types/content";
import { slugify, chapterSlug } from "@/lib/utils/slug";
import { db } from "@/lib/db";

const ROMAN_TO_NUMBER: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
};

function romanToNumber(roman: string): number {
  return ROMAN_TO_NUMBER[roman.trim()] ?? 0;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * Resolve the path to the active notes markdown file.
 *
 * Resolution order:
 *  1. Explicit `filePath` argument (used by tests and scripts).
 *  2. NOTES_PATH env var (relative to reader/ process.cwd()) +
 *     manifest.json → entryFile.
 *  3. Legacy fallback: content/backend_learning_notes.md relative to cwd.
 */
export function resolveNotesFilePath(filePath?: string): string {
  if (filePath) return filePath;

  const notesPathEnv = process.env.NOTES_PATH;
  if (notesPathEnv) {
    const notesDir = isAbsolute(notesPathEnv) ? notesPathEnv : resolve(process.cwd(), notesPathEnv);

    let entryFile = "backend_learning_notes.md";
    try {
      const manifest = JSON.parse(readFileSync(join(notesDir, "manifest.json"), "utf-8")) as {
        entryFile?: string;
      };
      if (manifest.entryFile) entryFile = manifest.entryFile;
    } catch {
      // manifest missing — use default name
    }
    return join(notesDir, entryFile);
  }

  return join(process.cwd(), "content", "backend_learning_notes.md");
}

function parseSections(chapterContent: string): ParsedSection[] {
  const lines = chapterContent.split("\n");
  const sections: ParsedSection[] = [];
  let currentHeading = "";
  let currentSlug = "";
  let currentLevel = 0;
  let currentLines: string[] = [];
  let sortOrder = 0;

  const flushSection = () => {
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        slug: currentSlug,
        level: currentLevel,
        content: currentLines.join("\n").trim(),
        sortOrder: sortOrder++,
      });
    }
  };

  for (const line of lines) {
    const h3 = line.match(/^### (.+)$/);
    const h4 = line.match(/^#### (.+)$/);

    if (h3 || h4) {
      flushSection();
      const headingText = (h3 ?? h4)![1].trim();
      currentHeading = headingText;
      currentSlug = slugify(headingText);
      currentLevel = h3 ? 3 : 4;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  flushSection();
  return sections;
}

export function parseMarkdownFile(filePath?: string): ParsedPart[] {
  const contentPath = resolveNotesFilePath(filePath);
  const raw = readFileSync(contentPath, "utf-8");
  const parts: ParsedPart[] = [];

  const partSplitRegex = /^# Part ([IVXLC]+)\s*[-–]\s*(.+)$/m;
  const partChunks = raw.split(/(?=^# Part [IVXLC])/m).filter(Boolean);

  for (const partChunk of partChunks) {
    const partMatch = partChunk.match(partSplitRegex);
    if (!partMatch) continue;

    const romanNumeral = partMatch[1].trim();
    const partTitle = partMatch[2].trim();
    const partNumber = romanToNumber(romanNumeral);

    const chapterSplitRegex = /^## Chapter (\d+)\s*[-–]\s*(.+)$/m;
    const chapterChunks = partChunk
      .split(/(?=^## Chapter \d)/m)
      .filter((c) => c.match(chapterSplitRegex));

    const chapters: ParsedChapter[] = [];

    for (const chapterChunk of chapterChunks) {
      const chapterMatch = chapterChunk.match(chapterSplitRegex);
      if (!chapterMatch) continue;

      const chapterNumber = parseInt(chapterMatch[1], 10);
      const chapterTitle = chapterMatch[2].trim();
      const slug = chapterSlug(chapterNumber, chapterTitle);

      const rawContent = chapterChunk.trim();
      const wordCount = countWords(rawContent);
      const readingTimeMin = estimateReadingTime(wordCount);
      const sections = parseSections(rawContent);

      chapters.push({
        number: chapterNumber,
        title: chapterTitle,
        slug,
        rawContent,
        wordCount,
        readingTimeMin,
        sections,
      });
    }

    if (chapters.length > 0) {
      parts.push({ number: partNumber, romanNumeral, title: partTitle, chapters });
    }
  }

  return parts.sort((a, b) => a.number - b.number);
}

export function getCourseDescription(filePath?: string): string {
  const contentPath = resolveNotesFilePath(filePath);
  const raw = readFileSync(contentPath, "utf-8");

  const firstPartIdx = raw.search(/^# Part [IVXLC]/m);
  if (firstPartIdx === -1) return "";

  const frontMatter = raw.slice(0, firstPartIdx).trim();
  const subtitleMatch = frontMatter.match(/^## (.+)$/m);
  return subtitleMatch ? subtitleMatch[1].trim() : "Backend Engineering Study Guide";
}

/** Read the manifest.json for the active notes collection. */
export function getNotesManifest(notesPath?: string): {
  id: string;
  title: string;
  description: string;
} {
  const rawPath = notesPath ?? process.env.NOTES_PATH;
  if (!rawPath) return { id: "unknown", title: "Study Notes", description: "" };

  const notesDir = isAbsolute(rawPath) ? rawPath : resolve(process.cwd(), rawPath);
  try {
    return JSON.parse(readFileSync(join(notesDir, "manifest.json"), "utf-8"));
  } catch {
    return { id: "unknown", title: "Study Notes", description: "" };
  }
}

/**
 * Returns the courseId for the currently active notes collection.
 * Resolution order:
 *  1. UserPreference.activeCourseId from DB (if set and course exists).
 *  2. First course alphabetically in DB.
 */
export async function getActiveCourseId(): Promise<string> {
  try {
    const prefs = await db.userPreference.findUnique({ where: { id: "default" } });
    if (prefs?.activeCourseId) {
      const courseExists = await db.course.findUnique({
        where: { id: prefs.activeCourseId },
        select: { id: true },
      });
      if (courseExists) return prefs.activeCourseId;
    }
  } catch {
    // DB unavailable — fall through
  }

  try {
    const first = await db.course.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
    if (first) return first.id;
  } catch {
    // ignore
  }

  return "unknown";
}
