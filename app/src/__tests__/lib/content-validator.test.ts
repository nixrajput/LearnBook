import { describe, it, expect } from "vitest";
import { validateManifest, validateMarkdown, validateCourseUpload } from "@/lib/content/validator";

describe("validateManifest", () => {
  it("accepts valid manifest", () => {
    const r = validateManifest(
      JSON.stringify({ id: "test-course", title: "Test", description: "A test" }),
    );
    expect(r.valid).toBe(true);
    expect(r.manifest?.id).toBe("test-course");
  });

  it("rejects invalid JSON", () => {
    const r = validateManifest("not json");
    expect(r.valid).toBe(false);
    expect(r.errors[0].field).toBe("manifest");
  });

  it("rejects missing id", () => {
    const r = validateManifest(JSON.stringify({ title: "Test", description: "A test" }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === "id")).toBe(true);
  });

  it("rejects missing title", () => {
    const r = validateManifest(JSON.stringify({ id: "test", description: "A test" }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === "title")).toBe(true);
  });

  it("rejects missing description", () => {
    const r = validateManifest(JSON.stringify({ id: "test", title: "Test" }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === "description")).toBe(true);
  });

  it("rejects id with path traversal characters", () => {
    const r = validateManifest(
      JSON.stringify({ id: "../../etc", title: "Test", description: "A" }),
    );
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === "id")).toBe(true);
  });

  it("rejects id with slashes", () => {
    const r = validateManifest(JSON.stringify({ id: "a/b/c", title: "Test", description: "A" }));
    expect(r.valid).toBe(false);
  });

  it("accepts id with dashes and underscores", () => {
    const r = validateManifest(
      JSON.stringify({ id: "my-course_v2", title: "Test", description: "A" }),
    );
    expect(r.valid).toBe(true);
  });

  it("rejects array as manifest", () => {
    const r = validateManifest(JSON.stringify([1, 2, 3]));
    expect(r.valid).toBe(false);
  });

  it("trims whitespace from fields", () => {
    const r = validateManifest(
      JSON.stringify({ id: " test ", title: " Test ", description: " Desc " }),
    );
    expect(r.valid).toBe(true);
    expect(r.manifest?.id).toBe("test");
    expect(r.manifest?.title).toBe("Test");
  });
});

describe("validateMarkdown", () => {
  it("accepts markdown with parts and chapters", () => {
    const md = "# Part I – Intro\n## Chapter 1 – Hello\nContent here.";
    const r = validateMarkdown(md);
    expect(r.valid).toBe(true);
    expect(r.partsCount).toBe(1);
    expect(r.chaptersCount).toBe(1);
  });

  it("rejects empty content", () => {
    const r = validateMarkdown("");
    expect(r.valid).toBe(false);
  });

  it("rejects markdown without parts", () => {
    const r = validateMarkdown("## Chapter 1 – Hello\nJust chapters.");
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes("no parts found"))).toBe(true);
  });

  it("rejects markdown without chapters", () => {
    const r = validateMarkdown("# Part I – Intro\nNo chapters here.");
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes("no chapters found"))).toBe(true);
  });

  it("counts multiple parts and chapters", () => {
    const md = [
      "# Part I – Intro",
      "## Chapter 1 – First",
      "## Chapter 2 – Second",
      "# Part II – Advanced",
      "## Chapter 3 – Third",
    ].join("\n");
    const r = validateMarkdown(md);
    expect(r.valid).toBe(true);
    expect(r.partsCount).toBe(2);
    expect(r.chaptersCount).toBe(3);
  });

  it("accepts en-dash separator", () => {
    const md = "# Part I \u2013 Intro\n## Chapter 1 \u2013 Hello";
    const r = validateMarkdown(md);
    expect(r.valid).toBe(true);
  });
});

describe("validateCourseUpload", () => {
  it("returns combined validation result", () => {
    const manifest = JSON.stringify({ id: "test", title: "Test", description: "Desc" });
    const md = "# Part I – Intro\n## Chapter 1 – Hello\nContent.";
    const r = validateCourseUpload(manifest, md);
    expect(r.valid).toBe(true);
    expect(r.manifest?.id).toBe("test");
    expect(r.partsCount).toBe(1);
  });

  it("fails if manifest is invalid", () => {
    const r = validateCourseUpload("bad json", "# Part I – X\n## Chapter 1 – Y");
    expect(r.valid).toBe(false);
  });

  it("fails if markdown is invalid", () => {
    const manifest = JSON.stringify({ id: "test", title: "Test", description: "Desc" });
    const r = validateCourseUpload(manifest, "no structure here");
    expect(r.valid).toBe(false);
  });
});
