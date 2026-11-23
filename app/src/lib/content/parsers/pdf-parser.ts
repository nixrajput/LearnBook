const pdf = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

export interface ParsedPdfChapter {
  title: string;
  content: string;
  pageStart: number;
}

/**
 * Extract text from a PDF buffer and split into chapters by heading detection.
 * Headings are detected as lines that are short, standalone, and often ALL CAPS or title case.
 */
export async function parsePdf(buffer: Buffer): Promise<{
  chapters: ParsedPdfChapter[];
  totalPages: number;
  fullText: string;
}> {
  const data = await pdf(buffer);
  const fullText = data.text;
  const totalPages = data.numpages;

  // Split by likely heading patterns
  const lines = fullText.split("\n");
  const chapters: ParsedPdfChapter[] = [];
  let currentTitle = "Chapter 1";
  let currentContent: string[] = [];
  let chapterCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentContent.push("");
      continue;
    }

    // Detect heading: short line (< 80 chars), not ending with period, preceded by blank
    const isLikelyHeading =
      trimmed.length < 80 &&
      trimmed.length > 2 &&
      !trimmed.endsWith(".") &&
      !trimmed.endsWith(",") &&
      currentContent.length > 0 &&
      (currentContent[currentContent.length - 1]?.trim() === "" || chapterCount === 0);

    if (isLikelyHeading && chapterCount > 0) {
      // Save previous chapter
      chapters.push({
        title: currentTitle,
        content: currentContent.join("\n").trim(),
        pageStart: Math.max(
          1,
          Math.round((chapters.length / Math.max(chapterCount, 1)) * totalPages),
        ),
      });
      currentTitle = trimmed;
      currentContent = [];
      chapterCount++;
    } else if (isLikelyHeading && chapterCount === 0) {
      currentTitle = trimmed;
      chapterCount++;
    } else {
      currentContent.push(trimmed);
    }
  }

  // Push last chapter
  if (currentContent.length > 0 || chapterCount === 0) {
    chapters.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
      pageStart: 1,
    });
  }

  // If no chapters detected, return the whole document as one chapter
  if (chapters.length === 0) {
    chapters.push({
      title: "Document",
      content: fullText,
      pageStart: 1,
    });
  }

  return { chapters, totalPages, fullText };
}
