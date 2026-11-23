import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  // Stripe can deliver one event more than once. The event id row and the event's writes commit
  // together, so a redelivery hits the unique id and changes nothing.
  try {
    await db.$transaction(async (tx) => {
      await tx.stripeEvent.create({ data: { id: event.id, type: event.type } });
      await applyEvent(tx, event);
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw e;
  }

  return NextResponse.json({ received: true });
}

async function applyEvent(tx: Prisma.TransactionClient, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) break;

      // Only process if payment is confirmed
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        break;
      }

      // Handle credit purchase (one-time payment)
      if (session.metadata?.type === "credit_purchase") {
        const credits = parseInt(session.metadata?.credits ?? "0", 10);
        if (credits > 0) {
          await tx.aiCreditBalance.upsert({
            where: { userId },
            update: { credits: { increment: credits } },
            create: { userId, credits },
          });
        }
        break;
      }

      // Handle subscription checkout
      const planKey = session.metadata?.planKey;
      const offerCode = session.metadata?.offerCode;

      if (!planKey) break;

      await tx.user.update({
        where: { id: userId },
        data: {
          plan: planKey,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });

      // Record offer redemption (idempotent via upsert)
      if (offerCode) {
        const offer = await tx.offer.findUnique({ where: { code: offerCode } });
        if (offer) {
          const existing = await tx.offerRedemption.findUnique({
            where: { userId_offerId: { userId, offerId: offer.id } },
          });
          if (!existing) {
            if (offer.maxRedemptions === null || offer.currentRedemptions < offer.maxRedemptions) {
              await tx.offerRedemption.create({
                data: { userId, offerId: offer.id },
              });
              await tx.offer.update({
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

      const user = await tx.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (!user) break;

      if (subscription.status === "active" || subscription.status === "trialing") {
        const periodEnd = subscription.items?.data?.[0]?.current_period_end;
        await tx.user.update({
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

      const user = await tx.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (!user) break;

      await tx.user.update({
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
}
