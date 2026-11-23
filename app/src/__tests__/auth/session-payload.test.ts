import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../helpers/test-db";

describe("/api/auth/session payload", () => {
  let GET: typeof import("@/app/api/auth/[...nextauth]/route").GET;

  beforeAll(async () => {
    useTestDatabase();
    process.env.AUTH_SECRET = "zz-test-secret-zz-test-secret-zz-test";
    process.env.AUTH_TRUST_HOST = "true";
    const { db } = await import("@/lib/db");
    ({ GET } = await import("@/app/api/auth/[...nextauth]/route"));
    await db.user.create({
      data: {
        id: "zz-session-user",
        email: "zz-session@example.test",
        plan: "PRO",
        stripeCustomerId: "cus_zz_private",
      },
    });
    await db.session.create({
      data: {
        sessionToken: "zz-session-token",
        userId: "zz-session-user",
        expires: new Date(Date.now() + 86_400_000),
      },
    });
  }, 60_000);

  it("returns the user fields the app reads and no session token or Stripe ids", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/auth/session", {
        headers: { cookie: "authjs.session-token=zz-session-token" },
      }),
    );
    const body = await res.json();

    expect(body.user).toMatchObject({ id: "zz-session-user", plan: "PRO", role: "USER" });
    expect(JSON.stringify(body)).not.toContain("zz-session-token");
    expect(JSON.stringify(body)).not.toContain("cus_zz_private");
  });
});
