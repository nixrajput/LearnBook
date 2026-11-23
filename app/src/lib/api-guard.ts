import { NextResponse } from "next/server";
import { getPlanLimits, isWithinLimit } from "@/lib/plans";
import { db } from "@/lib/db";

/**
 * Check if the user can create a resource given their plan limits.
 * Returns null if within limit, or a NextResponse 403 if exceeded.
 * -1 in plan limits means unlimited (short-circuits without DB query).
 */
export async function checkPlanLimit(
  userId: string,
  plan: string,
  resource: "notes" | "bookmarks" | "highlights" | "courses",
): Promise<NextResponse | null> {
  const limits = await getPlanLimits(plan);

  const limitKey = {
    notes: limits.maxNotes,
    bookmarks: limits.maxBookmarks,
    highlights: limits.maxHighlights,
    courses: limits.maxCourses,
  }[resource];

  if (limitKey === -1) return null; // unlimited

  let count: number;
  switch (resource) {
    case "notes":
      count = await db.note.count({ where: { userId } });
      break;
    case "bookmarks":
      count = await db.bookmark.count({ where: { userId } });
      break;
    case "highlights":
      count = await db.highlight.count({ where: { userId } });
      break;
    case "courses":
      count = await db.userPreference.count({ where: { userId } });
      break;
  }

  if (!isWithinLimit(count, limitKey)) {
    return NextResponse.json(
      {
        error: `Plan limit reached: ${resource}`,
        limit: limitKey,
        current: count,
        upgrade: "Upgrade your plan for unlimited access.",
      },
      { status: 403 },
    );
  }

  return null;
}
