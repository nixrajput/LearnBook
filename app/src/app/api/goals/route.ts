import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const updateGoalSchema = z.object({
  dailyMinutes: z.number().int().min(5).max(480).optional(),
  weeklyChapters: z.number().int().min(1).max(100).optional(),
});

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goal = await db.readingGoal.findUnique({ where: { userId: user.id } });
  return NextResponse.json(goal ?? { dailyMinutes: 30, weeklyChapters: 5 });
}

export async function PUT(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Goals are PRO+ only
  if (user.plan === "FREE") {
    return NextResponse.json({ error: "Upgrade to Pro to set reading goals" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const goal = await db.readingGoal.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
  });

  return NextResponse.json(goal);
}
