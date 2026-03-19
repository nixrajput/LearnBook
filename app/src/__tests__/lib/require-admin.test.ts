import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  requireApiSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
  },
}));

import { requireAdmin } from "@/lib/auth/require-admin";
import { requireApiSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const mockRequireApiSession = vi.mocked(requireApiSession);
const mockFindUnique = vi.mocked(db.user.findUnique);

beforeEach(() => vi.clearAllMocks());

describe("requireAdmin", () => {
  it("returns 401 error when not authenticated", async () => {
    mockRequireApiSession.mockResolvedValue(null);
    const result = await requireAdmin();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("returns 403 when user is not ADMIN in DB", async () => {
    mockRequireApiSession.mockResolvedValue({ id: "u1", role: "ADMIN", plan: "FREE" } as never);
    mockFindUnique.mockResolvedValue({ role: "USER" } as never);
    const result = await requireAdmin();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(403);
  });

  it("returns user when DB confirms ADMIN role", async () => {
    mockRequireApiSession.mockResolvedValue({ id: "u1", role: "ADMIN", plan: "FREE" } as never);
    mockFindUnique.mockResolvedValue({ role: "ADMIN" } as never);
    const result = await requireAdmin();
    expect(result.user).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it("returns 403 when user not found in DB", async () => {
    mockRequireApiSession.mockResolvedValue({ id: "u1", role: "ADMIN", plan: "FREE" } as never);
    mockFindUnique.mockResolvedValue(null);
    const result = await requireAdmin();
    expect(result.error!.status).toBe(403);
  });
});
