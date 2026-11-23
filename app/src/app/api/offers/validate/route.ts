import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { code, planKey } = body as { code?: string; planKey?: string };

  if (!code || !planKey) {
    return NextResponse.json({ error: "code and planKey are required" }, { status: 400 });
  }

  const offer = await db.offer.findUnique({ where: { code } });

  if (!offer || !offer.isActive) {
    return NextResponse.json({ valid: false, reason: "Invalid or inactive code" });
  }

  if (offer.validFrom > new Date()) {
    return NextResponse.json({ valid: false, reason: "Offer is not active yet" });
  }

  if (offer.validUntil && offer.validUntil < new Date()) {
    return NextResponse.json({ valid: false, reason: "Offer has expired" });
  }

  if (offer.maxRedemptions !== null && offer.currentRedemptions >= offer.maxRedemptions) {
    return NextResponse.json({ valid: false, reason: "Offer has reached maximum redemptions" });
  }

  const applicable: string[] = JSON.parse(offer.applicablePlans);
  if (!applicable.includes(planKey)) {
    return NextResponse.json({ valid: false, reason: "Offer not applicable to this plan" });
  }

  // Check if user already redeemed this offer
  const existing = await db.offerRedemption.findUnique({
    where: { userId_offerId: { userId: user.id, offerId: offer.id } },
  });
  if (existing) {
    return NextResponse.json({ valid: false, reason: "You have already used this offer" });
  }

  return NextResponse.json({
    valid: true,
    discountPercent: offer.discountPercent,
    description: offer.description,
  });
}
