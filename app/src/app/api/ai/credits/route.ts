import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { getOrCreateBalance } from "@/lib/ai/credits";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const credits = await getOrCreateBalance(user.id, user.plan ?? "FREE");

  // Recent usage
  const recentUsage = await db.aiUsageLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      action: true,
      credits: true,
      model: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ credits, usage: recentUsage });
}
