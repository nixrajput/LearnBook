import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBookmarkSchema } from "@/lib/validators/bookmark";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";
import { checkPlanLimit } from "@/lib/api-guard";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courseId = await getActiveCourseId(user.id);
    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id, courseId },
      include: {
        chapter: { select: { id: true, title: true, slug: true, number: true } },
        section: { select: { id: true, heading: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookmarks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createBookmarkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const limitError = await checkPlanLimit(user.id, user.plan ?? "FREE", "bookmarks");
  if (limitError) return limitError;

  try {
    const bookmark = await db.bookmark.create({ data: { ...parsed.data, userId: user.id } });
    return NextResponse.json(bookmark, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already bookmarked or invalid" }, { status: 409 });
  }
}
