import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { explainPrompt } from "@/lib/ai/prompts";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { text, chapterId } = body as { text?: string; chapterId?: string };
  if (!text || !chapterId) {
    return NextResponse.json({ error: "text and chapterId are required" }, { status: 400 });
  }

  await getOrCreateBalance(user.id, user.plan ?? "FREE");
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { rawContent: true, courseId: true },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  let modelResult;
  try {
    const { model, def } = await getAiModel(user.id, user.plan ?? "FREE", "explain");

    const result = streamText({
      model,
      prompt: explainPrompt(text, chapter.rawContent),
    });

    // Reconcile credits after stream completes (or refund on failure)
    Promise.resolve(result.usage)
      .then((usage) => {
        reconcileCredits(
          user.id,
          "explain",
          def.provider,
          def.id,
          usage.inputTokens ?? 0,
          usage.outputTokens ?? 0,
          def.multiplier,
          2,
          chapter.courseId,
          chapterId,
        ).catch(() => {});
      })
      .catch(() => {
        // Stream failed — refund reserved credits
        db.aiCreditBalance
          .update({
            where: { userId: user.id },
            data: { credits: { increment: 2 } },
          })
          .catch(() => {});
      });

    modelResult = result;
  } catch {
    // Model initialization failed — refund reserved credits
    await db.aiCreditBalance
      .update({
        where: { userId: user.id },
        data: { credits: { increment: 2 } },
      })
      .catch(() => {});
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }

  return modelResult.toTextStreamResponse();
}
