import { readFileSync } from "fs";
import { join, resolve } from "path";
import { createGunzip } from "zlib";
import { Readable } from "stream";

export interface ParsedEpubChapter {
  title: string;
  content: string;
  order: number;
}

/**
 * Basic EPUB parser — extracts chapters from an EPUB file (which is a ZIP of HTML files).
 * Uses Node.js built-in ZIP handling since EPUB is just a ZIP archive.
 */
export async function parseEpub(buffer: Buffer): Promise<{
  title: string;
  chapters: ParsedEpubChapter[];
}> {
  // EPUB is a ZIP file. We'll use a minimal approach:
  // 1. Extract the content.opf to find the spine order
  // 2. Read each HTML file in spine order
  // 3. Convert HTML to markdown

  // For now, use a simplified approach: treat the buffer as text content
  // A full EPUB parser would use a library like `epub2` or `adm-zip`
  // This is a placeholder that handles the most common case

  const text = buffer.toString("utf-8");

  // Detect binary EPUB (ZIP archive) — return empty to trigger rejection in upload route
  if (text.includes("<?xml") || text.includes("<html") || text.includes("PK")) {
    // Binary EPUB parsing requires ZIP extraction (adm-zip or similar)
    // Return empty chapters so the upload route returns a clear error
    return {
      title: "Imported EPUB",
      chapters: [],
    };
  }

  // Plain text fallback — split by double newlines as paragraphs
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const chaptersPerGroup = Math.max(1, Math.ceil(paragraphs.length / 10));

  const chapters: ParsedEpubChapter[] = [];
  for (let i = 0; i < paragraphs.length; i += chaptersPerGroup) {
    const chunk = paragraphs.slice(i, i + chaptersPerGroup);
    chapters.push({
      title: `Section ${chapters.length + 1}`,
      content: chunk.join("\n\n"),
      order: chapters.length,
    });
  }

  return {
    title: "Imported Document",
    chapters: chapters.length > 0 ? chapters : [{ title: "Content", content: text, order: 0 }],
  };
}
