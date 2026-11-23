import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getAllPlans } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    planKey,
    billingInterval = "monthly",
    offerCode,
  } = body as {
    planKey?: string;
    billingInterval?: "monthly" | "yearly";
    offerCode?: string;
  };

  if (!planKey || planKey === "FREE") {
    return NextResponse.json({ error: "Cannot checkout for free plan" }, { status: 400 });
  }

  const plans = await getAllPlans();
  const plan = plans.find((p) => p.planKey === planKey);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId =
    billingInterval === "yearly" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this plan" },
      { status: 400 },
    );
  }

  // Get or create Stripe customer
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  let customerId = dbUser?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser?.email ?? undefined,
      name: dbUser?.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Handle offer code discount
  const discounts: { coupon: string }[] = [];
  if (offerCode) {
    const offer = await db.offer.findUnique({ where: { code: offerCode } });
    if (offer && offer.isActive) {
      const applicable: string[] = JSON.parse(offer.applicablePlans);
      const alreadyRedeemed = await db.offerRedemption.findUnique({
        where: { userId_offerId: { userId: user.id, offerId: offer.id } },
      });
      if (
        !alreadyRedeemed &&
        offer.validFrom <= new Date() &&
        (!offer.validUntil || offer.validUntil > new Date()) &&
        (offer.maxRedemptions === null || offer.currentRedemptions < offer.maxRedemptions) &&
        applicable.includes(planKey)
      ) {
        // Reuse existing Stripe coupon per offer (keyed by offer ID + discount)
        const existingCoupons = await stripe.coupons.list({ limit: 100 });
        const reusable = existingCoupons.data.find(
          (c) => c.metadata?.offerId === offer.id && c.valid,
        );

        const couponId = reusable
          ? reusable.id
          : (
              await stripe.coupons.create({
                percent_off: offer.discountPercent,
                duration: "once",
                metadata: { offerId: offer.id, offerCode: offer.code },
              })
            ).id;

        discounts.push({ coupon: couponId });
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(discounts.length > 0 ? { discounts } : {}),
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    metadata: {
      userId: user.id,
      planKey,
      ...(offerCode ? { offerCode } : {}),
    },
  });

  return NextResponse.json({ url: session.url });
}
