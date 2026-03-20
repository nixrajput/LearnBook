import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const shareSchema = z.object({
  chapterId: z.string().min(1),
  type: z.enum(["highlight", "note"]),
  sourceId: z.string().min(1),
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
  const annotations = await db.sharedAnnotation.findMany({
    where: { groupId: id, ...(chapterId ? { chapterId } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(annotations);
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
  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const annotation = await db.sharedAnnotation.create({
    data: {
      groupId: id,
      userId: user.id,
      chapterId: parsed.data.chapterId,
      type: parsed.data.type,
      sourceId: parsed.data.sourceId,
    },
  });

  return NextResponse.json(annotation, { status: 201 });
}
