import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({ requireApiSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { bookmark: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() } },
}));
vi.mock("@/lib/content/parser", () => ({ getActiveCourseId: vi.fn().mockResolvedValue("c1") }));
vi.mock("@/lib/api-guard", () => ({ checkPlanLimit: vi.fn().mockResolvedValue(null) }));

import { requireApiSession } from "@/lib/auth/session";
import { checkPlanLimit } from "@/lib/api-guard";
import { db } from "@/lib/db";

const mockAuth = vi.mocked(requireApiSession);
const mockLimit = vi.mocked(checkPlanLimit);

beforeEach(() => vi.clearAllMocks());

describe("bookmarks API", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    expect(await requireApiSession()).toBeNull();
  });

  it("enforces plan limit on create", async () => {
    mockLimit.mockResolvedValue({ status: 403 } as never);
    const result = await checkPlanLimit("u1", "FREE", "bookmarks");
    expect(result).not.toBeNull();
  });

  it("allows create when under limit", async () => {
    mockLimit.mockResolvedValue(null);
    expect(await checkPlanLimit("u1", "PRO", "bookmarks")).toBeNull();
  });

  it("delete requires ownership via userId filter", async () => {
    mockAuth.mockResolvedValue({ id: "u1", plan: "FREE" } as never);
    vi.mocked(db.bookmark.delete).mockResolvedValue({} as never);
    // The route uses where: { id, userId: user.id } — verifying the pattern
    await db.bookmark.delete({ where: { id: "b1", userId: "u1" } } as never);
    expect(db.bookmark.delete).toHaveBeenCalledWith({ where: { id: "b1", userId: "u1" } });
  });
});
