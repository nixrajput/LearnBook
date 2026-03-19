import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the DB and plans modules
vi.mock("@/lib/db", () => ({
  db: {
    note: { count: vi.fn() },
    bookmark: { count: vi.fn() },
    highlight: { count: vi.fn() },
    userPreference: { count: vi.fn() },
  },
}));

vi.mock("@/lib/plans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/plans")>();
  return {
    ...original,
    getPlanLimits: vi.fn(),
  };
});

import { checkPlanLimit } from "@/lib/api-guard";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

const mockGetPlanLimits = vi.mocked(getPlanLimits);
const mockNoteCount = vi.mocked(db.note.count);
const mockBookmarkCount = vi.mocked(db.bookmark.count);
const mockHighlightCount = vi.mocked(db.highlight.count);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkPlanLimit", () => {
  it("returns null for unlimited plan (-1)", async () => {
    mockGetPlanLimits.mockResolvedValue({
      maxNotes: -1,
      maxBookmarks: -1,
      maxHighlights: -1,
      maxCourses: -1,
    });

    const result = await checkPlanLimit("user1", "PRO", "notes");
    expect(result).toBeNull();
    // Should not even query the DB for unlimited
    expect(mockNoteCount).not.toHaveBeenCalled();
  });

  it("returns null when under limit", async () => {
    mockGetPlanLimits.mockResolvedValue({
      maxNotes: 50,
      maxBookmarks: 25,
      maxHighlights: 50,
      maxCourses: 3,
    });
    mockNoteCount.mockResolvedValue(10);

    const result = await checkPlanLimit("user1", "FREE", "notes");
    expect(result).toBeNull();
  });

  it("returns 403 when at limit", async () => {
    mockGetPlanLimits.mockResolvedValue({
      maxNotes: 50,
      maxBookmarks: 25,
      maxHighlights: 50,
      maxCourses: 3,
    });
    mockNoteCount.mockResolvedValue(50);

    const result = await checkPlanLimit("user1", "FREE", "notes");
    expect(result).not.toBeNull();
    // It's a NextResponse — check the status
    expect(result!.status).toBe(403);
  });

  it("checks bookmarks correctly", async () => {
    mockGetPlanLimits.mockResolvedValue({
      maxNotes: 50,
      maxBookmarks: 25,
      maxHighlights: 50,
      maxCourses: 3,
    });
    mockBookmarkCount.mockResolvedValue(25);

    const result = await checkPlanLimit("user1", "FREE", "bookmarks");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("checks highlights correctly", async () => {
    mockGetPlanLimits.mockResolvedValue({
      maxNotes: 50,
      maxBookmarks: 25,
      maxHighlights: 50,
      maxCourses: 3,
    });
    mockHighlightCount.mockResolvedValue(49);

    const result = await checkPlanLimit("user1", "FREE", "highlights");
    expect(result).toBeNull(); // 49 < 50
  });

  it("returns error body with limit info", async () => {
    mockGetPlanLimits.mockResolvedValue({
      maxNotes: 50,
      maxBookmarks: 25,
      maxHighlights: 50,
      maxCourses: 3,
    });
    mockNoteCount.mockResolvedValue(50);

    const result = await checkPlanLimit("user1", "FREE", "notes");
    const body = await result!.json();
    expect(body.error).toContain("Plan limit reached");
    expect(body.limit).toBe(50);
    expect(body.current).toBe(50);
    expect(body.upgrade).toBeDefined();
  });
});
