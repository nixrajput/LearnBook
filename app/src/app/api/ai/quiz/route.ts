import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { readableCourseWhere } from "@/lib/content/parser";
import { requireApiSession } from "@/lib/auth/session";
import { getAiModel } from "@/lib/ai/router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "@/lib/ai/credits";
import { z } from "zod";

const generateQuizSchema = z.object({
  chapterId: z.string().min(1),
  questionCount: z.number().int().min(3).max(20).default(5),
  forceRegenerate: z.boolean().default(false),
});

const QUIZ_PROMPT = `You are a study assistant. Generate a quiz from the provided chapter content.

Rules:
- Generate exactly {COUNT} questions
- Mix question types: multiple_choice, true_false, short_answer
- Multiple choice must have exactly 4 options with one correct answer
- Questions must be grounded in the chapter content
- Return ONLY a valid JSON array of question objects

Question format:
[
  { "type": "multiple_choice", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" },
  { "type": "true_false", "question": "...", "correctAnswer": true },
  { "type": "short_answer", "question": "...", "correctAnswer": "..." }
]

Chapter content:
`;

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = generateQuizSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { chapterId, questionCount, forceRegenerate } = parsed.data;

  // Check for cached quiz (unless force regenerate)
  if (!forceRegenerate) {
    const cached = await db.quiz.findFirst({
      where: { userId: user.id, chapterId },
      orderBy: { createdAt: "desc" },
    });
    if (cached) {
      // Verify cached quiz has the right question count
      let cachedQuestions: unknown[] = [];
      try {
        cachedQuestions = JSON.parse(cached.questions);
      } catch {
        /* */
      }
      if (cachedQuestions.length === questionCount) {
        return NextResponse.json(cached);
      }
    }
  }

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, part: { course: readableCourseWhere(user.id) } },
    select: { title: true, rawContent: true, courseId: true },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  await getOrCreateBalance(user.id, user.plan ?? "FREE");
  const reserved = await reserveCredits(user.id);
  if (!reserved) {
    return NextResponse.json({ error: "Insufficient AI credits" }, { status: 402 });
  }

  try {
    const { model, def } = await getAiModel(user.id, user.plan ?? "FREE", "quiz");

    const prompt =
      QUIZ_PROMPT.replace("{COUNT}", String(questionCount)) + chapter.rawContent.slice(0, 6000);
    const result = await generateText({ model, prompt });

    // Reconcile credits
    await reconcileCredits(
      user.id,
      "quiz",
      def.provider,
      def.id,
      result.usage?.inputTokens ?? 0,
      result.usage?.outputTokens ?? 0,
      def.multiplier,
      2,
      chapter.courseId,
      chapterId,
    );

    // Parse questions
    let questions: unknown[] = [];
    try {
      const jsonMatch = result.text.trim().match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
    } catch {
      /* invalid JSON */
    }

    if (questions.length === 0) {
      throw new Error("Failed to parse quiz questions from AI response");
    }

    // Save quiz
    const quiz = await db.quiz.create({
      data: {
        userId: user.id,
        courseId: chapter.courseId,
        chapterId,
        questions: JSON.stringify(questions),
      },
    });

    return NextResponse.json(quiz, { status: 201 });
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
