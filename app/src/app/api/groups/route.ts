import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { generateInviteCode } from "@/lib/utils/invite-code";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  courseId: z.string().min(1),
});

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await db.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: { _count: { select: { members: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const groups = memberships.map((m) => ({
    ...m.group,
    memberCount: m.group._count.members,
    myRole: m.role,
  }));

  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Plan limit: FREE cannot create groups
  if (user.plan === "FREE") {
    return NextResponse.json({ error: "Upgrade to Pro to create study groups" }, { status: 403 });
  }

  // PRO: 2 groups max, PREMIUM: 10
  const maxGroups = user.plan === "PREMIUM" ? 10 : 2;
  const existingCount = await db.studyGroup.count({ where: { createdBy: user.id } });
  if (existingCount >= maxGroups) {
    return NextResponse.json(
      { error: `You can create up to ${maxGroups} groups on your plan` },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify course exists
  const course = await db.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const inviteCode = generateInviteCode();

  const group = await db.studyGroup.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      courseId: parsed.data.courseId,
      createdBy: user.id,
      inviteCode,
    },
  });

  // Add creator as OWNER
  await db.groupMember.create({
    data: { groupId: group.id, userId: user.id, role: "OWNER" },
  });

  return NextResponse.json(group, { status: 201 });
}
