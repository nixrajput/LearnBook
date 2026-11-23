import { describe, it, expect } from "vitest";

describe("chapter page", () => {
  it("renders per request, not from build-time params", async () => {
    const page = await import("@/app/(app)/course/[slug]/page");
    expect(page).not.toHaveProperty("generateStaticParams");
  }, 30_000);
});
