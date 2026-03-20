import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const members = await db.groupMember.findMany({
    where: { groupId: id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const targetUserId = (body as { userId?: string }).userId;
  if (!targetUserId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const myMember = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (
    !myMember ||
    (myMember.role !== "OWNER" && myMember.role !== "ADMIN" && targetUserId !== user.id)
  ) {
    return NextResponse.json({ error: "Not authorized to remove this member" }, { status: 403 });
  }

  // Cannot remove the owner
  const targetMember = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: targetUserId } },
  });
  if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (targetMember.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove the group owner" }, { status: 400 });
  }

  // Remove member and their shared annotations
  await db.$transaction([
    db.groupMember.delete({ where: { groupId_userId: { groupId: id, userId: targetUserId } } }),
    db.sharedAnnotation.deleteMany({ where: { groupId: id, userId: targetUserId } }),
  ]);

  return NextResponse.json({ success: true });
}
