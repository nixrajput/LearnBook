import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { generateInviteCode } from "@/lib/utils/invite-code";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!member || member.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only the owner can regenerate the invite code" },
      { status: 403 },
    );
  }

  // Retry on collision (unique constraint on inviteCode)
  let newCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    newCode = generateInviteCode();
    try {
      await db.studyGroup.update({ where: { id }, data: { inviteCode: newCode } });
      return NextResponse.json({ inviteCode: newCode });
    } catch (e) {
      const msg = String(e);
      if (msg.includes("P2002") || msg.includes("Unique constraint")) continue;
      throw e;
    }
  }
  return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 });
}
