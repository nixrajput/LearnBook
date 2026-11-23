import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const joinSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase().trim()),
});

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Plan limit: FREE can join 1 group, PRO 5, PREMIUM 50 (excludes owned groups)
  const maxJoins = user.plan === "FREE" ? 1 : user.plan === "PRO" ? 5 : 50;
  const currentMemberships = await db.groupMember.count({
    where: { userId: user.id, role: { not: "OWNER" } },
  });
  if (currentMemberships >= maxJoins) {
    return NextResponse.json(
      { error: `You can join up to ${maxJoins} groups on your plan` },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const group = await db.studyGroup.findUnique({
    where: { inviteCode: parsed.data.code },
    include: { _count: { select: { members: true } } },
  });

  if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  // Check if already a member
  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  // Check capacity
  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ error: "Group is full" }, { status: 403 });
  }

  await db.groupMember.create({
    data: { groupId: group.id, userId: user.id, role: "MEMBER" },
  });

  return NextResponse.json({ success: true, groupId: group.id, name: group.name });
}
