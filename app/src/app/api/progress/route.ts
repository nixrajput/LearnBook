import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getActiveCourseId } from "@/lib/content/parser";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courseId = await getActiveCourseId(user.id);
    const progress = await db.readingProgress.findMany({
      where: { userId: user.id, courseId },
      include: { chapter: { select: { slug: true, title: true, number: true } } },
      orderBy: { lastReadAt: "desc" },
    });
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
