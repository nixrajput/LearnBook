import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNoteSchema } from "@/lib/validators/note";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chapterId = req.nextUrl.searchParams.get("chapterId");
  const scope = req.nextUrl.searchParams.get("scope");
  const courseId = await getActiveCourseId(user.id);

  try {
    const notes = await db.note.findMany({
      where: {
        userId: user.id,
        courseId,
        ...(chapterId ? { chapterId } : {}),
        ...(scope ? { scope } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const note = await db.note.create({ data: { ...parsed.data, userId: user.id } });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
