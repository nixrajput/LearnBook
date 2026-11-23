import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { readableCourseWhere } from "@/lib/content/parser";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const course = await db.course.findFirst({
    where: { id, ...readableCourseWhere(user.id) },
    select: { id: true, title: true },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await db.userPreference.upsert({
    where: { userId: user.id },
    update: { activeCourseId: id },
    create: { userId: user.id, activeCourseId: id },
  });

  return NextResponse.json({ success: true, activeCourseId: id });
}
