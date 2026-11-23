import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.plan === "FREE") {
    return NextResponse.json({ error: "Upgrade to Pro to access concepts" }, { status: 403 });
  }

  const { id } = await params;

  const concept = await db.concept.findFirst({
    where: { id, userId: user.id },
    include: {
      links: {
        select: { sourceType: true, sourceId: true, chapterId: true, courseId: true },
      },
    },
  });

  if (!concept) return NextResponse.json({ error: "Concept not found" }, { status: 404 });

  // Fetch source details for each link
  const sources = await Promise.all(
    concept.links.map(async (link) => {
      const chapter = await db.chapter.findUnique({
        where: { id: link.chapterId },
        select: { title: true, slug: true, number: true },
      });
      const course = await db.course.findUnique({
        where: { id: link.courseId },
        select: { title: true },
      });
      return {
        ...link,
        chapterTitle: chapter?.title ?? "Unknown",
        chapterSlug: chapter?.slug ?? "",
        chapterNumber: chapter?.number ?? 0,
        courseTitle: course?.title ?? "Unknown",
      };
    }),
  );

  return NextResponse.json({ concept: { id: concept.id, name: concept.name }, sources });
}
