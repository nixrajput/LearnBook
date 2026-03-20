import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const adjustCreditsSchema = z.object({
  userId: z.string(),
  credits: z.number().int().min(0).max(100000),
  reason: z.string().optional(),
});

/** Set a user's AI credit balance to an exact value */
export async function POST(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const body = await req.json().catch(() => ({}));
  const parsed = adjustCreditsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { userId, credits } = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const balance = await db.aiCreditBalance.upsert({
    where: { userId },
    update: { credits },
    create: { userId, credits },
  });

  return NextResponse.json({ userId, credits: balance.credits });
}
