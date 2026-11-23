import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";

export async function DELETE(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Require the user to type "delete" as confirmation
  if (body.confirm !== "delete") {
    return NextResponse.json(
      { error: 'Must confirm by sending { confirm: "delete" }' },
      { status: 400 },
    );
  }

  // Cascade delete handles all related records (sessions, accounts, notes, etc.)
  await db.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true, message: "Account deleted" });
}
