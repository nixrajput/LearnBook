import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planKey = session.metadata?.planKey;
      const offerCode = session.metadata?.offerCode;

      if (!userId || !planKey) break;

      // Only upgrade if payment is confirmed (not pending bank transfers, etc.)
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        break;
      }

      await db.user.update({
        where: { id: userId },
        data: {
          plan: planKey,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });

      // Record offer redemption (idempotent via upsert to handle duplicate delivery)
      if (offerCode) {
        const offer = await db.offer.findUnique({ where: { code: offerCode } });
        if (offer) {
          const existing = await db.offerRedemption.findUnique({
            where: { userId_offerId: { userId, offerId: offer.id } },
          });
          if (!existing) {
            // Check redemption limit before recording
            if (offer.maxRedemptions === null || offer.currentRedemptions < offer.maxRedemptions) {
              await db.offerRedemption.create({
                data: { userId, offerId: offer.id },
              });
              await db.offer.update({
                where: { id: offer.id },
                data: { currentRedemptions: { increment: 1 } },
              });
            }
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (!user) break;

      if (subscription.status === "active" || subscription.status === "trialing") {
        const periodEnd = subscription.items?.data?.[0]?.current_period_end;
        await db.user.update({
          where: { id: user.id },
          data: {
            ...(periodEnd ? { planExpiresAt: new Date(periodEnd * 1000) } : {}),
            stripeSubscriptionId: subscription.id,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (!user) break;

      await db.user.update({
        where: { id: user.id },
        data: {
          plan: "FREE",
          stripeSubscriptionId: null,
          planExpiresAt: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
