import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Knowledge graph: PRO gets view-only, PREMIUM gets full
  if (user.plan === "FREE") {
    return NextResponse.json(
      { error: "Upgrade to Pro to access the Knowledge Graph" },
      { status: 403 },
    );
  }

  const concepts = await db.concept.findMany({
    where: { userId: user.id },
    include: {
      links: {
        select: { sourceType: true, sourceId: true, chapterId: true, courseId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build graph structure: nodes = concepts, edges = shared chapter/course connections
  const nodes = concepts.map((c) => ({
    id: c.id,
    name: c.name,
    linkCount: c.links.length,
    chapters: [...new Set(c.links.map((l) => l.chapterId))],
    courses: [...new Set(c.links.map((l) => l.courseId))],
  }));

  // Build edges: two concepts are connected if they share a chapter
  const edges: { source: string; target: string; sharedChapters: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].chapters.filter((ch) => nodes[j].chapters.includes(ch));
      if (shared.length > 0) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          sharedChapters: shared.length,
        });
      }
    }
  }

  return NextResponse.json({ nodes, edges, totalConcepts: nodes.length });
}
