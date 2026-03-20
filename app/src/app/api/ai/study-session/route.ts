import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { z } from "zod";

const startSchema = z.object({
  chapterId: z.string().min(1),
  questionCount: z.number().int().min(3).max(15).default(5),
});

const FIRST_QUESTION_PROMPT = `You are a Socratic study tutor. Based on the following chapter content, ask ONE thought-provoking question that tests understanding (not just recall).

Return ONLY a JSON object: { "question": "your question here" }

Chapter content:
`;

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Study sessions are PRO+ only
  if (user.plan === "FREE") {
    return NextResponse.json({ error: "Upgrade to Pro for AI Study Sessions" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const chapter = await db.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { title: true, rawContent: true, courseId: true },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  await getOrCreateBalance(user.id, user.plan ?? "FREE");
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  try {
    const { model, def } = await getAiModel(user.id, user.plan ?? "FREE", "study_session");

    const result = await generateText({
      model,
      prompt: FIRST_QUESTION_PROMPT + chapter.rawContent.slice(0, 5000),
    });

    await reconcileCredits(
      user.id,
      "study_session",
      def.provider,
      def.id,
      result.usage?.inputTokens ?? 0,
      result.usage?.outputTokens ?? 0,
      def.multiplier,
      2,
      chapter.courseId,
      parsed.data.chapterId,
    );

    let question = "";
    try {
      const parsed = JSON.parse(result.text.trim());
      question = parsed.question ?? result.text;
    } catch {
      question = result.text.trim();
    }

    // Create session record
    const session = await db.studySession.create({
      data: {
        userId: user.id,
        courseId: chapter.courseId,
        chapterId: parsed.data.chapterId,
        exchanges: JSON.stringify([{ question, userAnswer: null, feedback: null, score: null }]),
      },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        question,
        exchangeIndex: 0,
      },
      { status: 201 },
    );
  } catch {
    // AI or model init failed — refund reserved credits
    await db.aiCreditBalance
      .update({
        where: { userId: user.id },
        data: { credits: { increment: 2 } },
      })
      .catch(() => {});
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
