import { describe, it, expect } from "vitest";
import { isWithinLimit, formatPrice } from "@/lib/plans";

describe("isWithinLimit", () => {
  it("returns true when unlimited (-1)", () => {
    expect(isWithinLimit(999, -1)).toBe(true);
  });

  it("returns true when under limit", () => {
    expect(isWithinLimit(10, 50)).toBe(true);
  });

  it("returns false when at limit", () => {
    expect(isWithinLimit(50, 50)).toBe(false);
  });

  it("returns false when over limit", () => {
    expect(isWithinLimit(51, 50)).toBe(false);
  });

  it("returns true when count is 0", () => {
    expect(isWithinLimit(0, 10)).toBe(true);
  });
});

describe("formatPrice", () => {
  it("returns 'Free' for 0", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("formats INR amounts correctly", () => {
    const result = formatPrice(499);
    // Should contain the number 499 in some format
    expect(result).not.toBe("Free");
    expect(result.includes("499")).toBe(true);
  });

  it("formats decimal amounts", () => {
    const result = formatPrice(4.99);
    expect(result).not.toBe("Free");
  });
});
