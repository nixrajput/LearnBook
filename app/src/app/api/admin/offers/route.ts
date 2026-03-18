import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const createOfferSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(30)
    .transform((v) => v.toUpperCase().trim()),
  description: z.string().min(1).max(200),
  discountPercent: z.number().int().min(1).max(100),
  applicablePlans: z.array(z.enum(["PRO", "PREMIUM"])).min(1),
  maxRedemptions: z.number().int().min(1).nullable().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const offers = await db.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const body = await req.json().catch(() => ({}));
  const parsed = createOfferSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check for duplicate code
  const existing = await db.offer.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "Offer code already exists" }, { status: 409 });
  }

  const offer = await db.offer.create({
    data: {
      code: parsed.data.code,
      description: parsed.data.description,
      discountPercent: parsed.data.discountPercent,
      applicablePlans: JSON.stringify(parsed.data.applicablePlans),
      maxRedemptions: parsed.data.maxRedemptions ?? null,
      validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : new Date(),
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
    },
  });

  return NextResponse.json(offer, { status: 201 });
}
