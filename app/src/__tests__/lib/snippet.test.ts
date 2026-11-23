import { describe, it, expect } from "vitest";
import { snippet } from "@/lib/utils/snippet";

describe("search snippet", () => {
  it("escapes HTML from content so the dialog cannot run it", () => {
    const html = snippet('<img src=x onerror="alert(1)"> closures', "closures");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("<mark>closures</mark>");
  });

  it("escapes HTML when nothing matches", () => {
    expect(snippet("<script>alert(1)</script>", "zzz")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("marks every case-insensitive match", () => {
    expect(snippet("Map and map", "MAP")).toBe("<mark>Map</mark> and <mark>map</mark>");
  });
});
