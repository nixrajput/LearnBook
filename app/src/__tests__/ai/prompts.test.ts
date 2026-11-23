import { describe, it, expect } from "vitest";
import { summarizePrompt, explainPrompt, askPrompt } from "@/lib/ai/prompts";

describe("summarizePrompt", () => {
  it("includes chapter title", () => {
    const prompt = summarizePrompt("API Design", "Content here");
    expect(prompt).toContain("API Design");
  });

  it("includes chapter content", () => {
    const prompt = summarizePrompt("Title", "Some chapter content about databases");
    expect(prompt).toContain("Some chapter content about databases");
  });

  it("requests markdown format", () => {
    const prompt = summarizePrompt("T", "C");
    expect(prompt.toLowerCase()).toContain("markdown");
  });
});

describe("explainPrompt", () => {
  it("includes selected text", () => {
    const prompt = explainPrompt("TCP handshake", "Chapter about networking");
    expect(prompt).toContain("TCP handshake");
  });

  it("includes chapter context", () => {
    const prompt = explainPrompt("text", "Full chapter content here");
    expect(prompt).toContain("Full chapter content here");
  });

  it("truncates long context to 3000 chars", () => {
    const longContent = "a".repeat(5000);
    const prompt = explainPrompt("text", longContent);
    expect(prompt.length).toBeLessThan(longContent.length + 500);
  });
});

describe("askPrompt", () => {
  it("includes the question", () => {
    const prompt = askPrompt("What is REST?", "API Design", "Content");
    expect(prompt).toContain("What is REST?");
  });

  it("includes chapter title and content", () => {
    const prompt = askPrompt("Q", "API Design", "Full content");
    expect(prompt).toContain("API Design");
    expect(prompt).toContain("Full content");
  });

  it("instructs to answer from source only", () => {
    const prompt = askPrompt("Q", "T", "C");
    expect(prompt.toLowerCase()).toContain("only");
  });
});

describe("prompt input caps", () => {
  it("caps the selected text, the question and the summary source", () => {
    const long = "x".repeat(100_000);
    expect(explainPrompt(long, "ctx").length).toBeLessThan(3_000);
    expect(askPrompt(long, "Title", "content").length).toBeLessThan(3_000);
    expect(summarizePrompt("Title", long).length).toBeLessThan(61_000);
  });
});
