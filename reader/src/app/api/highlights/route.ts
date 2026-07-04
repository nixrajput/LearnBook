import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHighlightSchema } from "@/lib/validators/highlight";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET(req: NextRequest) {
  const chapterId = req.nextUrl.searchParams.get("chapterId");
  const courseId = await getActiveCourseId();
  const highlights = await db.highlight.findMany({
    where: { courseId, ...(chapterId ? { chapterId } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(highlights);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = createHighlightSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const highlight = await db.highlight.create({ data: parsed.data });
  return NextResponse.json(highlight, { status: 201 });
}
