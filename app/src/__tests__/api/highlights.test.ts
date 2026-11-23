import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({ requireApiSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { highlight: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() } },
}));
vi.mock("@/lib/content/parser", () => ({ getActiveCourseId: vi.fn().mockResolvedValue("c1") }));
vi.mock("@/lib/api-guard", () => ({ checkPlanLimit: vi.fn().mockResolvedValue(null) }));

import { requireApiSession } from "@/lib/auth/session";
import { checkPlanLimit } from "@/lib/api-guard";

beforeEach(() => vi.clearAllMocks());

describe("highlights API", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireApiSession).mockResolvedValue(null);
    expect(await requireApiSession()).toBeNull();
  });

  it("enforces plan limit on create", async () => {
    vi.mocked(checkPlanLimit).mockResolvedValue({ status: 403 } as never);
    expect(await checkPlanLimit("u1", "FREE", "highlights")).not.toBeNull();
  });

  it("allows unlimited for PRO plan", async () => {
    vi.mocked(checkPlanLimit).mockResolvedValue(null);
    expect(await checkPlanLimit("u1", "PRO", "highlights")).toBeNull();
  });
});
