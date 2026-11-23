import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const updatePlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50).optional(),
  priceMonthly: z.number().int().min(0).optional(),
  priceYearly: z.number().int().min(0).optional(),
  stripePriceIdMonthly: z.string().nullable().optional(),
  stripePriceIdYearly: z.string().nullable().optional(),
  features: z.string().optional(),
  maxNotes: z.number().int().optional(),
  maxBookmarks: z.number().int().optional(),
  maxHighlights: z.number().int().optional(),
  maxCourses: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const plans = await db.planConfig.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

export async function PATCH(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const body = await req.json().catch(() => ({}));
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id, ...data } = parsed.data;

  const plan = await db.planConfig.findUnique({ where: { id } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const updated = await db.planConfig.update({ where: { id }, data });
  return NextResponse.json(updated);
}
