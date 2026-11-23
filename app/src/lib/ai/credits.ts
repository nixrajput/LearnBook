import { db } from "@/lib/db";

const PLAN_CREDITS: Record<string, number> = {
  FREE: 100,
  PRO: 1500,
  PREMIUM: 10000,
};

/** Estimated minimum credits for a single AI action (used for reservation) */
const MIN_RESERVE_CREDITS = 2;

/** Calculate credits consumed from token usage */
export function calculateCredits(
  inputTokens: number,
  outputTokens: number,
  multiplier: number,
): number {
  return Math.ceil((inputTokens + outputTokens) / 1000) * multiplier;
}

/** Get or create credit balance for a user */
export async function getOrCreateBalance(userId: string, plan: string): Promise<number> {
  const balance = await db.aiCreditBalance.upsert({
    where: { userId },
    update: {},
    create: { userId, credits: PLAN_CREDITS[plan] ?? 100 },
  });
  return balance.credits;
}

/**
 * Atomically reserve credits before an AI call.
 * Uses updateMany with a gte guard to prevent race conditions.
 * Returns true if reservation succeeded, false if insufficient credits.
 */
export async function reserveCredits(
  userId: string,
  amount: number = MIN_RESERVE_CREDITS,
): Promise<boolean> {
  const result = await db.aiCreditBalance.updateMany({
    where: { userId, credits: { gte: amount } },
    data: { credits: { decrement: amount } },
  });
  return result.count > 0;
}

/**
 * Reconcile credits after an AI call completes.
 * Deducts the actual cost minus the already-reserved amount.
 * If actual cost > reserved, deducts the difference. If less, refunds.
 */
export async function reconcileCredits(
  userId: string,
  action: string,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  multiplier: number,
  reservedAmount: number = MIN_RESERVE_CREDITS,
  courseId?: string,
  chapterId?: string,
): Promise<{ creditsUsed: number; remaining: number }> {
  const actualCost = calculateCredits(inputTokens, outputTokens, multiplier);
  const difference = actualCost - reservedAmount;

  // Adjust balance: positive difference = deduct more (floored at zero), negative = refund
  const updated =
    difference > 0
      ? await db.$executeRaw`UPDATE ai_credit_balances SET credits = MAX(credits - ${difference}, 0) WHERE user_id = ${userId}`.then(
          () => db.aiCreditBalance.findUnique({ where: { userId } }),
        )
      : difference < 0
        ? await db.aiCreditBalance.update({
            where: { userId },
            data: { credits: { increment: -difference } },
          })
        : await db.aiCreditBalance.findUnique({ where: { userId } });

  // Log usage
  await db.aiUsageLog.create({
    data: {
      userId,
      action,
      credits: actualCost,
      provider,
      model,
      inputTokens,
      outputTokens,
      multiplier,
      courseId: courseId ?? null,
      chapterId: chapterId ?? null,
    },
  });

  return { creditsUsed: actualCost, remaining: updated?.credits ?? 0 };
}

/** Monthly credit refill based on plan */
export async function refillCredits(userId: string, plan: string): Promise<number> {
  const credits = PLAN_CREDITS[plan] ?? 100;
  const balance = await db.aiCreditBalance.upsert({
    where: { userId },
    update: { credits, lastRefilledAt: new Date() },
    create: { userId, credits, lastRefilledAt: new Date() },
  });
  return balance.credits;
}
