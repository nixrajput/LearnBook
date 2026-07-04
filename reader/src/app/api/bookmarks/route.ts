import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBookmarkSchema } from "@/lib/validators/bookmark";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET() {
  const courseId = await getActiveCourseId();
  const bookmarks = await db.bookmark.findMany({
    where: { courseId },
    include: {
      chapter: { select: { id: true, title: true, slug: true, number: true } },
      section: { select: { id: true, heading: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookmarks);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = createBookmarkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const bookmark = await db.bookmark.create({ data: parsed.data });
    return NextResponse.json(bookmark, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already bookmarked or invalid" }, { status: 409 });
  }
}
