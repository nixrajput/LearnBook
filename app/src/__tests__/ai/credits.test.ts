import { describe, it, expect } from "vitest";
import { calculateCredits } from "@/lib/ai/credits";

describe("calculateCredits", () => {
  it("calculates ceil((input + output) / 1000) * multiplier", () => {
    expect(calculateCredits(500, 500, 1)).toBe(1); // 1000/1000 * 1 = 1
    expect(calculateCredits(501, 500, 1)).toBe(2); // ceil(1001/1000) * 1 = 2
    expect(calculateCredits(1500, 500, 2)).toBe(4); // ceil(2000/1000) * 2 = 4
    expect(calculateCredits(3000, 2000, 3)).toBe(15); // ceil(5000/1000) * 3 = 15
  });

  it("handles zero tokens", () => {
    expect(calculateCredits(0, 0, 1)).toBe(0);
  });

  it("handles very small token counts", () => {
    expect(calculateCredits(1, 0, 1)).toBe(1); // ceil(1/1000) = 1
  });

  it("handles high multipliers", () => {
    expect(calculateCredits(1000, 0, 3)).toBe(3); // 1 * 3 = 3
  });

  it("rounds up partial thousands", () => {
    expect(calculateCredits(999, 0, 1)).toBe(1);
    expect(calculateCredits(1001, 0, 1)).toBe(2);
  });
});
