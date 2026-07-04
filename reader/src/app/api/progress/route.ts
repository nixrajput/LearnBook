import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET() {
  try {
    const courseId = await getActiveCourseId();
    const progress = await db.readingProgress.findMany({
      where: { courseId },
      include: { chapter: { select: { slug: true, title: true, number: true } } },
      orderBy: { lastReadAt: "desc" },
    });
    return NextResponse.json(progress);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
