import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/session", () => ({
  requireApiSession: async () => ({ id: "zz-uploader", plan: "PRO" }),
}));

const { POST } = await import("@/app/api/content/upload/route");

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
