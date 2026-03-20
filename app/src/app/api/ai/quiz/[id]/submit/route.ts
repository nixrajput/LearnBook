import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.array(z.unknown()),
});

interface QuizQuestion {
  type: string;
  question: string;
  correctAnswer: unknown;
  options?: string[];
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const quiz = await db.quiz.findFirst({
    where: { id, userId: user.id },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  let questions: QuizQuestion[] = [];
  try {
    questions = JSON.parse(quiz.questions);
  } catch {
    /* */
  }

  const { answers } = parsed.data;
  let correct = 0;
  const results = questions.map((q, i) => {
    const userAnswer = answers[i];
    let isCorrect = false;

    if (q.type === "true_false") {
      isCorrect = userAnswer === q.correctAnswer;
    } else if (q.type === "multiple_choice") {
      isCorrect =
        String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    } else if (q.type === "short_answer") {
      // Lenient matching — require the answer to be at least 40% of the expected length
      const expected = String(q.correctAnswer).trim().toLowerCase();
      const given = String(userAnswer ?? "")
        .trim()
        .toLowerCase();
      const minLen = Math.max(3, Math.floor(expected.length * 0.4));
      isCorrect = given.length >= minLen && (expected.includes(given) || given.includes(expected));
    }

    if (isCorrect) correct++;

    return {
      question: q.question,
      type: q.type,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
    };
  });

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  // Update quiz with score
  await db.quiz.update({
    where: { id },
    data: { score },
  });

  return NextResponse.json({
    score,
    correct,
    total: questions.length,
    results,
  });
}
