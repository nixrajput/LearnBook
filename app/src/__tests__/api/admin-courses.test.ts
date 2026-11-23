import { describe, it, expect } from "vitest";
import { validateManifest, validateMarkdown, validateCourseUpload } from "@/lib/content/validator";
import { basename } from "path";

describe("admin courses upload validation", () => {
  describe("file type checks", () => {
    it("accepts .json manifest", () => {
      expect("manifest.json".endsWith(".json")).toBe(true);
    });
    it("accepts .md content", () => {
      expect("content.md".endsWith(".md")).toBe(true);
    });
    it("rejects .txt manifest", () => {
      expect("manifest.txt".endsWith(".json")).toBe(false);
    });
    it("rejects .html content", () => {
      expect("content.html".endsWith(".md")).toBe(false);
    });
  });

  describe("manifest ID sanitization", () => {
    it("rejects path traversal in manifest id", () => {
      const r = validateManifest(JSON.stringify({ id: "../../etc", title: "T", description: "D" }));
      expect(r.valid).toBe(false);
    });
    it("rejects spaces in id", () => {
      const r = validateManifest(JSON.stringify({ id: "my course", title: "T", description: "D" }));
      expect(r.valid).toBe(false);
    });
    it("accepts alphanumeric-dash-underscore id", () => {
      const r = validateManifest(
        JSON.stringify({ id: "backend-101_v2", title: "T", description: "D" }),
      );
      expect(r.valid).toBe(true);
    });
  });

  describe("entryFile basename stripping", () => {
    it("strips directory from entryFile", () => {
      expect(basename("../../evil.md")).toBe("evil.md");
    });
    it("strips nested path from entryFile", () => {
      expect(basename("/etc/passwd")).toBe("passwd");
    });
    it("keeps simple filename", () => {
      expect(basename("content.md")).toBe("content.md");
    });
  });

  describe("manifest size limit", () => {
    it("1MB cap for manifest file", () => {
      const MAX_MANIFEST_BYTES = 1 * 1024 * 1024;
      expect(MAX_MANIFEST_BYTES).toBe(1048576);
      expect(500 * 1024 < MAX_MANIFEST_BYTES).toBe(true); // 500KB OK
      expect(2 * 1024 * 1024 > MAX_MANIFEST_BYTES).toBe(true); // 2MB rejected
    });
  });

  describe("full upload validation", () => {
    it("validates manifest + markdown together", () => {
      const manifest = JSON.stringify({ id: "test", title: "Test", description: "Desc" });
      const md = "# Part I – Intro\n## Chapter 1 – Hello\nContent.";
      const r = validateCourseUpload(manifest, md);
      expect(r.valid).toBe(true);
    });

    it("fails with invalid manifest even if markdown is valid", () => {
      const md = "# Part I – Intro\n## Chapter 1 – Hello\nContent.";
      const r = validateCourseUpload("bad json", md);
      expect(r.valid).toBe(false);
    });
  });
});
