import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const updateOfferSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  maxRedemptions: z.number().int().min(1).nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateOfferSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const offer = await db.offer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.discountPercent !== undefined) data.discountPercent = parsed.data.discountPercent;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.maxRedemptions !== undefined) data.maxRedemptions = parsed.data.maxRedemptions;
  if (parsed.data.validUntil !== undefined) {
    data.validUntil = parsed.data.validUntil ? new Date(parsed.data.validUntil) : null;
  }

  const updated = await db.offer.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  const offer = await db.offer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  await db.offer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
