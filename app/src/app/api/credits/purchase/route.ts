import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { toSmallestUnit } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { packId } = body as { packId?: string };

  if (!packId) {
    return NextResponse.json({ error: "packId is required" }, { status: 400 });
  }

  const pack = await db.creditPack.findUnique({ where: { id: packId } });
  if (!pack || !pack.isActive) {
    return NextResponse.json({ error: "Invalid or inactive credit pack" }, { status: 400 });
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY ?? "inr",
            product_data: {
              name: `${pack.credits} AI Credits (${pack.name})`,
              description: `One-time purchase of ${pack.credits} AI credits for LearnBook`,
            },
            unit_amount: toSmallestUnit(pack.price),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        type: "credit_purchase",
        packId: pack.id,
        credits: String(pack.credits),
      },
      success_url: `${appUrl}/credits?purchase=success`,
      cancel_url: `${appUrl}/credits?purchase=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Checkout creation failed" }, { status: 500 });
  }
}
