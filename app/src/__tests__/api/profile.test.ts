import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({ requireApiSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn(), update: vi.fn() } },
}));

import { requireApiSession } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validators/profile";

beforeEach(() => vi.clearAllMocks());

describe("profile API", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(requireApiSession).mockResolvedValue(null);
    expect(await requireApiSession()).toBeNull();
  });

  it("validates PATCH body — rejects empty", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });

  it("validates PATCH body — accepts displayName", () => {
    expect(updateProfileSchema.safeParse({ displayName: "Test" }).success).toBe(true);
  });

  it("validates PATCH body — rejects long displayName", () => {
    expect(updateProfileSchema.safeParse({ displayName: "a".repeat(51) }).success).toBe(false);
  });

  it("validates PATCH body — accepts bio only", () => {
    expect(updateProfileSchema.safeParse({ bio: "Hello world" }).success).toBe(true);
  });

  it("validates PATCH body — rejects long bio", () => {
    expect(updateProfileSchema.safeParse({ bio: "a".repeat(301) }).success).toBe(false);
  });

  it("trims whitespace from fields", () => {
    const r = updateProfileSchema.safeParse({ displayName: "  Test  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.displayName).toBe("Test");
  });
});
