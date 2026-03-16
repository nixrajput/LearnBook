import { describe, it, expect } from "vitest";
import { slugify, chapterSlug } from "@/lib/utils/slug";

describe("slugify", () => {
  it("lowercases", () => expect(slugify("Hello World")).toBe("hello-world"));
  it("replaces spaces with hyphens", () => expect(slugify("foo bar baz")).toBe("foo-bar-baz"));
  it("strips special chars", () => expect(slugify("Why this matters!")).toBe("why-this-matters"));
  it("collapses multiple spaces", () => expect(slugify("a   b")).toBe("a-b"));
  it("handles already-slugified input", () => expect(slugify("hello-world")).toBe("hello-world"));
});

describe("chapterSlug", () => {
  it("includes chapter number", () => {
    expect(chapterSlug(1, "Backend mental model")).toBe("chapter-1-backend-mental-model");
  });
  it("handles chapter 27", () => {
    expect(chapterSlug(27, "File upload")).toBe("chapter-27-file-upload");
  });
});
