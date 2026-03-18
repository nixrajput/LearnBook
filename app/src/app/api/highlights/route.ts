import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHighlightSchema } from "@/lib/validators/highlight";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chapterId = req.nextUrl.searchParams.get("chapterId");
  const courseId = await getActiveCourseId(user.id);
  const highlights = await db.highlight.findMany({
    where: { userId: user.id, courseId, ...(chapterId ? { chapterId } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(highlights);
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createHighlightSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const highlight = await db.highlight.create({ data: { ...parsed.data, userId: user.id } });
  return NextResponse.json(highlight, { status: 201 });
}
