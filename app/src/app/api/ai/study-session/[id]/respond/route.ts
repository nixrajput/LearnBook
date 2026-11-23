import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { z } from "zod";

const respondSchema = z.object({
  answer: z.string().min(1).max(2000),
});

interface Exchange {
  question: string;
  userAnswer: string | null;
  feedback: string | null;
  score: number | null;
}

const EVALUATE_PROMPT = `You are a Socratic study tutor evaluating a student's answer.

Chapter content (source of truth):
{CHAPTER_CONTENT}

Previous exchanges:
{HISTORY}

Current question: {QUESTION}
Student's answer: {ANSWER}

Evaluate the answer against the chapter content. Return a JSON object:
{
  "feedback": "What was correct, what was missing, key points to review (2-3 sentences)",
  "score": <0-100>,
  "nextQuestion": "Your next question testing a different concept from the chapter (or null if this was the last question)",
  "weakArea": "The topic area where the student struggled (or null if they did well)"
}
`;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const session = await db.studySession.findFirst({
    where: { id, userId: user.id, completedAt: null },
  });
  if (!session)
    return NextResponse.json({ error: "Session not found or already completed" }, { status: 404 });

  const chapter = await db.chapter.findUnique({
    where: { id: session.chapterId },
    select: { rawContent: true },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  let exchanges: Exchange[] = [];
  try {
    exchanges = JSON.parse(session.exchanges);
  } catch {
    /* */
  }

  // Find the current unanswered exchange
  const currentIdx = exchanges.findIndex((e) => e.userAnswer === null);
  if (currentIdx === -1) {
    return NextResponse.json({ error: "No pending question" }, { status: 400 });
  }

  await getOrCreateBalance(user.id, user.plan ?? "FREE");
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  try {
    const { model, def } = await getAiModel(user.id, user.plan ?? "FREE", "study_session");

    const history = exchanges
      .filter((e) => e.userAnswer !== null)
      .map((e) => `Q: ${e.question}\nA: ${e.userAnswer}\nFeedback: ${e.feedback}`)
      .join("\n\n");

    const prompt = EVALUATE_PROMPT.replace("{CHAPTER_CONTENT}", chapter.rawContent.slice(0, 4000))
      .replace("{HISTORY}", history || "None yet")
      .replace("{QUESTION}", exchanges[currentIdx].question)
      .replace("{ANSWER}", parsed.data.answer);

    const result = await generateText({ model, prompt });

    await reconcileCredits(
      user.id,
      "study_session",
      def.provider,
      def.id,
      result.usage?.inputTokens ?? 0,
      result.usage?.outputTokens ?? 0,
      def.multiplier,
      2,
      session.courseId,
      session.chapterId,
    );

    let evaluation = {
      feedback: "",
      score: null as number | null,
      nextQuestion: null as string | null,
      weakArea: null as string | null,
    };
    try {
      const jsonMatch = result.text.trim().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        evaluation.feedback = parsed.feedback ?? "";
        evaluation.score = typeof parsed.score === "number" ? parsed.score : null;
        evaluation.nextQuestion = parsed.nextQuestion ?? null;
        evaluation.weakArea = parsed.weakArea ?? null;
      }
    } catch {
      evaluation.feedback = result.text.trim();
      // score stays null on parse failure — not penalized
    }

    // Update current exchange
    exchanges[currentIdx].userAnswer = parsed.data.answer;
    exchanges[currentIdx].feedback = evaluation.feedback;
    exchanges[currentIdx].score = evaluation.score;

    // Collect weak areas
    const weakAreas: string[] = session.weakAreas ? JSON.parse(session.weakAreas) : [];
    if (evaluation.weakArea) weakAreas.push(evaluation.weakArea);

    // Add next question or complete session
    const isComplete = !evaluation.nextQuestion || exchanges.length >= 15;

    if (!isComplete && evaluation.nextQuestion) {
      exchanges.push({
        question: evaluation.nextQuestion,
        userAnswer: null,
        feedback: null,
        score: null,
      });
    }

    const scored = exchanges.filter((e) => e.score !== null);
    const overallScore =
      isComplete && scored.length > 0
        ? Math.round(scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length)
        : isComplete
          ? 0
          : null;

    await db.studySession.update({
      where: { id },
      data: {
        exchanges: JSON.stringify(exchanges),
        weakAreas: JSON.stringify([...new Set(weakAreas)]),
        ...(isComplete ? { completedAt: new Date(), overallScore } : {}),
      },
    });

    return NextResponse.json({
      feedback: evaluation.feedback,
      score: evaluation.score,
      weakArea: evaluation.weakArea,
      nextQuestion: isComplete ? null : evaluation.nextQuestion,
      isComplete,
      overallScore,
      exchangeCount: exchanges.length,
    });
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
