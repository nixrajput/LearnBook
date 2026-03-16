import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const course = await db.course.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await db.userPreference.upsert({
    where: { id: "default" },
    update: { activeCourseId: id },
    create: { id: "default", activeCourseId: id },
  });

  return NextResponse.json({ success: true, activeCourseId: id });
}
