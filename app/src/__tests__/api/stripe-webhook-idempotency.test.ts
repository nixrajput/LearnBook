import { describe, it, expect, beforeAll } from "vitest";
import Stripe from "stripe";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../helpers/test-db";

const SECRET = "whsec_test_secret";

describe("stripe webhook idempotency", () => {
  let db: typeof import("@/lib/db").db;
  let POST: typeof import("@/app/api/stripe/webhook/route").POST;

  beforeAll(async () => {
    useTestDatabase();
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    ({ db } = await import("@/lib/db"));
    ({ POST } = await import("@/app/api/stripe/webhook/route"));
    await db.user.create({ data: { id: "zz-dummy-user", email: "zz-dummy@example.test" } });
  }, 60_000);

  function signedRequest(event: object) {
    const payload = JSON.stringify(event);
    const header = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({
      payload,
      secret: SECRET,
    });
    return new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: payload,
      headers: { "stripe-signature": header },
    });
  }

  it("grants purchased credits once when Stripe delivers the same event twice", async () => {
    const event = {
      id: "evt_zz_credit_purchase",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_zz",
          object: "checkout.session",
          payment_status: "paid",
          metadata: { userId: "zz-dummy-user", type: "credit_purchase", credits: "500" },
        },
      },
    };

    const first = await POST(signedRequest(event));
    const second = await POST(signedRequest(event));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const balance = await db.aiCreditBalance.findUnique({ where: { userId: "zz-dummy-user" } });
    expect(balance?.credits).toBe(500);
    expect(await second.json()).toEqual({ received: true, duplicate: true });
  });

  it("rejects an event with a bad signature", async () => {
    const req = new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "t=1,v1=bad" },
    });
    expect((await POST(req)).status).toBe(400);
  });
});
