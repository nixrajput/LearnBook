import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

vi.mock("@/lib/auth/session", () => ({
  requireApiSession: async () => ({ id: "zz-uploader", plan: "PRO" }),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: async () => ({ user: { id: "zz-admin", role: "ADMIN", plan: "PRO" } }),
}));

const { POST } = await import("@/app/api/content/upload/route");
const { POST: adminPost } = await import("@/app/api/admin/courses/route");
const { config } = await import("@/proxy");

function upload(headers: Record<string, string>) {
  const body = new ReadableStream({
    pull() {
      throw new Error("the route read the body");
    },
  });
  return new NextRequest("http://localhost/api/content/upload", {
    method: "POST",
    body,
    headers,
    duplex: "half",
  } as ConstructorParameters<typeof NextRequest>[1]);
}

describe("upload size limit", () => {
  it("rejects a body larger than the limit before reading it", async () => {
    const res = await POST(
      upload({
        "content-type": "multipart/form-data; boundary=x",
        "content-length": String(500 * 1024 * 1024),
      }),
    );
    expect(res.status).toBe(413);
  });

  it("requires a Content-Length header", async () => {
    const res = await POST(upload({ "content-type": "multipart/form-data; boundary=x" }));
    expect(res.status).toBe(411);
  });
});

describe("proxy matcher", () => {
  it("skips the upload routes, so the proxy does not buffer their bodies before auth", () => {
    for (const url of ["/api/content/upload", "/api/admin/courses"]) {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    }
  });

  it("still runs on other routes", () => {
    for (const url of [
      "/dashboard",
      "/api/courses",
      "/api/admin/courses/x",
      "/api/content/import-url",
    ]) {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
    }
  });
});

describe("admin course upload size limit", () => {
  it("rejects a body larger than the limit before reading it", async () => {
    const res = await adminPost(
      upload({
        "content-type": "multipart/form-data; boundary=x",
        "content-length": String(500 * 1024 * 1024),
      }),
    );
    expect(res.status).toBe(413);
  });

  it("requires a Content-Length header", async () => {
    const res = await adminPost(upload({ "content-type": "multipart/form-data; boundary=x" }));
    expect(res.status).toBe(411);
  });
});
