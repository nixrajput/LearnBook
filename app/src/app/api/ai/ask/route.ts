import { NextRequest, NextResponse } from "next/server";
import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { askPrompt } from "@/lib/ai/prompts";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { question, chapterId } = body as { question?: string; chapterId?: string };
  if (!question || !chapterId) {
    return NextResponse.json({ error: "question and chapterId are required" }, { status: 400 });
  }

  await getOrCreateBalance(user.id, user.plan ?? "FREE");
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { title: true, rawContent: true, courseId: true },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  let modelResult;
  try {
    const { model, def } = await getAiModel(user.id, user.plan ?? "FREE", "ask");

    const result = streamText({
      model,
      prompt: askPrompt(question, chapter.title, chapter.rawContent),
    });

    Promise.resolve(result.usage)
      .then((usage) => {
        reconcileCredits(
          user.id,
          "ask",
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
        db.aiCreditBalance
          .update({
            where: { userId: user.id },
            data: { credits: { increment: 2 } },
          })
          .catch(() => {});
      });

    modelResult = result;
  } catch {
    await db.aiCreditBalance
      .update({
        where: { userId: user.id },
        data: { credits: { increment: 2 } },
      })
      .catch(() => {});
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }

  return createTextStreamResponse({ stream: toTextStream({ stream: modelResult.stream }) });
}
