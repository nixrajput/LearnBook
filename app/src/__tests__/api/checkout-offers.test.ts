import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../helpers/test-db";

vi.mock("@/lib/auth/session", () => ({
  requireApiSession: async () => ({ id: "zz-buyer", plan: "FREE" }),
}));
const stripeMock = vi.hoisted(() => ({
  checkout: { sessions: { create: vi.fn(async () => ({ url: "https://checkout.test/s" })) } },
  coupons: {
    list: vi.fn(async () => ({ data: [] })),
    create: vi.fn(async () => ({ id: "coupon_zz" })),
  },
}));
vi.mock("@/lib/stripe", () => ({ stripe: stripeMock }));

describe("checkout offer codes", () => {
  let db: typeof import("@/lib/db").db;
  let POST: typeof import("@/app/api/stripe/checkout/route").POST;

  beforeAll(async () => {
    useTestDatabase();
    ({ db } = await import("@/lib/db"));
    ({ POST } = await import("@/app/api/stripe/checkout/route"));
    await db.user.create({
      data: { id: "zz-buyer", email: "zz-buyer@example.test", stripeCustomerId: "cus_zz" },
    });
    await db.planConfig.create({
      data: {
        planKey: "PRO",
        name: "Pro",
        priceMonthly: 499,
        priceYearly: 4999,
        stripePriceIdMonthly: "price_zz",
        features: "[]",
      },
    });
    const day = 24 * 60 * 60 * 1000;
    await db.offer.createMany({
      data: [
        {
          id: "zz-used",
          code: "ZZUSED",
          description: "",
          discountPercent: 50,
          applicablePlans: '["PRO"]',
          validFrom: new Date(Date.now() - day),
        },
        {
          id: "zz-future",
          code: "ZZLATER",
          description: "",
          discountPercent: 50,
          applicablePlans: '["PRO"]',
          validFrom: new Date(Date.now() + day),
        },
        {
          id: "zz-open",
          code: "ZZOPEN",
          description: "",
          discountPercent: 50,
          applicablePlans: '["PRO"]',
          validFrom: new Date(Date.now() - day),
        },
      ],
    });
    await db.offerRedemption.create({ data: { userId: "zz-buyer", offerId: "zz-used" } });
  }, 60_000);

  beforeEach(() => stripeMock.checkout.sessions.create.mockClear());

  async function checkout(offerCode: string) {
    await POST(
      new NextRequest("http://localhost/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ planKey: "PRO", offerCode }),
      }),
    );
    const [params] = stripeMock.checkout.sessions.create.mock.calls[0] as unknown as [
      { discounts?: unknown[] },
    ];
    return params;
  }

  it("does not discount an offer the user already redeemed", async () => {
    expect((await checkout("ZZUSED")).discounts).toBeUndefined();
  });

  it("does not discount an offer before it starts", async () => {
    expect((await checkout("ZZLATER")).discounts).toBeUndefined();
  });

  it("discounts a valid offer", async () => {
    expect((await checkout("ZZOPEN")).discounts).toEqual([{ coupon: "coupon_zz" }]);
  });
});
