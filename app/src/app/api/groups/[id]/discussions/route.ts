import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const createDiscussionSchema = z.object({
  chapterId: z.string().min(1),
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const chapterId = req.nextUrl.searchParams.get("chapterId");

  const discussions = await db.groupDiscussion.findMany({
    where: { groupId: id, ...(chapterId ? { chapterId } : {}), parentId: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get replies for each top-level discussion
  const withReplies = await Promise.all(
    discussions.map(async (d) => {
      const replies = await db.groupDiscussion.findMany({
        where: { parentId: d.id, groupId: id },
        orderBy: { createdAt: "asc" },
      });
      return { ...d, replies };
    }),
  );

  return NextResponse.json(withReplies);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = createDiscussionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // If replying, verify parent exists in same group
  if (parsed.data.parentId) {
    const parent = await db.groupDiscussion.findFirst({
      where: { id: parsed.data.parentId, groupId: id },
    });
    if (!parent)
      return NextResponse.json({ error: "Parent discussion not found" }, { status: 404 });
  }

  const discussion = await db.groupDiscussion.create({
    data: {
      groupId: id,
      userId: user.id,
      chapterId: parsed.data.chapterId,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    },
  });

  return NextResponse.json(discussion, { status: 201 });
}
