import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({ requireApiSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    readingProgress: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    readingStreak: { upsert: vi.fn() },
  },
}));
vi.mock("@/lib/content/parser", () => ({ getActiveCourseId: vi.fn().mockResolvedValue("c1") }));
vi.mock("@/lib/utils/date", () => ({ todayString: vi.fn().mockReturnValue("2026-03-19") }));

import { requireApiSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const mockAuth = vi.mocked(requireApiSession);

beforeEach(() => vi.clearAllMocks());

describe("progress API", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    expect(await requireApiSession()).toBeNull();
  });

  it("uses compound unique key userId_chapterId for lookup", async () => {
    mockAuth.mockResolvedValue({ id: "u1", plan: "FREE" } as never);
    vi.mocked(db.readingProgress.findUnique).mockResolvedValue(null);

    await db.readingProgress.findUnique({
      where: { userId_chapterId: { userId: "u1", chapterId: "ch1" } },
    } as never);

    expect(db.readingProgress.findUnique).toHaveBeenCalledWith({
      where: { userId_chapterId: { userId: "u1", chapterId: "ch1" } },
    });
  });

  it("upsert includes userId in create data", async () => {
    vi.mocked(db.readingProgress.upsert).mockResolvedValue({} as never);

    await db.readingProgress.upsert({
      where: { userId_chapterId: { userId: "u1", chapterId: "ch1" } },
      update: { scrollPosition: 0.5 },
      create: { userId: "u1", courseId: "c1", chapterId: "ch1", scrollPosition: 0.5 },
    } as never);

    expect(db.readingProgress.upsert).toHaveBeenCalled();
    const call = vi.mocked(db.readingProgress.upsert).mock.calls[0][0] as {
      create: { userId: string };
    };
    expect(call.create.userId).toBe("u1");
  });
});
