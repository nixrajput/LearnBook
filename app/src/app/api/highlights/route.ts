import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHighlightSchema } from "@/lib/validators/highlight";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";
import { checkPlanLimit } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const chapterId = req.nextUrl.searchParams.get("chapterId");
    const courseId = await getActiveCourseId(user.id);
    const highlights = await db.highlight.findMany({
      where: { userId: user.id, courseId, ...(chapterId ? { chapterId } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(highlights);
  } catch {
    return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createHighlightSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const limitError = await checkPlanLimit(user.id, user.plan ?? "FREE", "highlights");
  if (limitError) return limitError;

  try {
    const highlight = await db.highlight.create({ data: { ...parsed.data, userId: user.id } });
    return NextResponse.json(highlight, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create highlight" }, { status: 500 });
  }
}
