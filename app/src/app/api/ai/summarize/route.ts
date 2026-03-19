import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { summarizePrompt } from "@/lib/ai/prompts";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { chapterId } = body as { chapterId?: string };
  if (!chapterId) return NextResponse.json({ error: "chapterId is required" }, { status: 400 });

  // Ensure balance exists
  await getOrCreateBalance(user.id, user.plan ?? "FREE");

  // Atomically reserve credits before calling LLM
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { title: true, rawContent: true, courseId: true },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const { model, def } = await getAiModel(user.id, user.plan ?? "FREE", "summarize");

  const result = streamText({
    model,
    prompt: summarizePrompt(chapter.title, chapter.rawContent),
  });

  // Reconcile actual cost after stream completes
  Promise.resolve(result.usage)
    .then((usage) => {
      reconcileCredits(
        user.id,
        "summarize",
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
    .catch(() => {});

  return result.toTextStreamResponse();
}
