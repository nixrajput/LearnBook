import { describe, it, expect, beforeAll } from "vitest";
import { useTestDatabase } from "../helpers/test-db";

describe("reconcileCredits against a real database", () => {
  let db: typeof import("@/lib/db").db;
  let credits: typeof import("@/lib/ai/credits");

  beforeAll(async () => {
    useTestDatabase();
    ({ db } = await import("@/lib/db"));
    credits = await import("@/lib/ai/credits");
    await db.user.create({ data: { id: "zz-dummy-ai", email: "zz-dummy-ai@example.test" } });
    await db.aiCreditBalance.create({ data: { userId: "zz-dummy-ai", credits: 3 } });
  }, 60_000);

  it("charges a call that costs more than the balance down to zero", async () => {
    expect(await credits.reserveCredits("zz-dummy-ai", 2)).toBe(true);

    // 100k tokens at multiplier 1 cost 100 credits, far above the 1 credit left.
    const result = await credits.reconcileCredits(
      "zz-dummy-ai",
      "ask",
      "openai",
      "m",
      100_000,
      0,
      1,
      2,
    );

    expect(result.creditsUsed).toBe(100);
    expect(result.remaining).toBe(0);
    expect(await credits.reserveCredits("zz-dummy-ai", 2)).toBe(false);
  });

  it("refunds the unused part of the reservation", async () => {
    await db.aiCreditBalance.update({ where: { userId: "zz-dummy-ai" }, data: { credits: 10 } });
    expect(await credits.reserveCredits("zz-dummy-ai", 2)).toBe(true);

    const result = await credits.reconcileCredits(
      "zz-dummy-ai",
      "ask",
      "openai",
      "m",
      500,
      0,
      1,
      2,
    );

    expect(result.creditsUsed).toBe(1);
    expect(result.remaining).toBe(9);
  });
});
