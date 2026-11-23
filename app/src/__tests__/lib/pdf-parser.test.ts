import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parsePdf } from "@/lib/content/parsers/pdf-parser";

const sample = readFileSync(join(__dirname, "../fixtures/sample.pdf"));

describe("parsePdf", () => {
  it("extracts text and page count from a real PDF", async () => {
    const result = await parsePdf(sample);

    expect(result.totalPages).toBe(1);
    expect(result.fullText).toContain("Getting Started");
    expect(result.fullText).toContain("Upload another file to continue learning.");
    expect(result.chapters.length).toBeGreaterThan(0);
    expect(result.chapters.map((c) => c.content).join("\n")).toContain(
      "LearnBook turns a PDF into readable chapters.",
    );
  });

  it("does not inject page separator lines into the text", async () => {
    const result = await parsePdf(sample);
    expect(result.fullText).not.toMatch(/--\s*\d+ of \d+\s*--/);
  });

  it("rejects a buffer that is not a PDF", async () => {
    await expect(parsePdf(Buffer.from("%PDF-1.4 not really a pdf"))).rejects.toThrow();
  });
});
