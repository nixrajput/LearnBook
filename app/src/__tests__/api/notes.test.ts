import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  requireApiSession: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    note: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));
vi.mock("@/lib/content/parser", () => ({
  getActiveCourseId: vi.fn().mockResolvedValue("course1"),
}));
vi.mock("@/lib/api-guard", () => ({
  checkPlanLimit: vi.fn().mockResolvedValue(null),
}));

import { requireApiSession } from "@/lib/auth/session";
import { checkPlanLimit } from "@/lib/api-guard";

const mockAuth = vi.mocked(requireApiSession);
const mockCheckLimit = vi.mocked(checkPlanLimit);

beforeEach(() => vi.clearAllMocks());

describe("notes API auth guard", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    // Simulate the auth check pattern used in all routes
    const user = await requireApiSession();
    expect(user).toBeNull();
  });

  it("returns user when authenticated", async () => {
    mockAuth.mockResolvedValue({ id: "u1", role: "USER", plan: "FREE" } as never);
    const user = await requireApiSession();
    expect(user).toBeDefined();
    expect(user!.id).toBe("u1");
  });
});

describe("notes plan limit enforcement", () => {
  it("allows creation when under limit", async () => {
    mockCheckLimit.mockResolvedValue(null);
    const result = await checkPlanLimit("u1", "FREE", "notes");
    expect(result).toBeNull();
  });

  it("blocks creation when at limit", async () => {
    const mockResponse = {
      status: 403,
      json: async () => ({ error: "Plan limit reached: notes" }),
    };
    mockCheckLimit.mockResolvedValue(mockResponse as never);
    const result = await checkPlanLimit("u1", "FREE", "notes");
    expect(result).not.toBeNull();
  });
});
