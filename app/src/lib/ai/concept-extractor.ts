import { generateText } from "ai";
import { db } from "@/lib/db";
import { getAiModel } from "./router";
import { reserveCredits, reconcileCredits, getOrCreateBalance } from "./credits";

const RESERVE_AMOUNT = 1;

const EXTRACT_PROMPT = `Extract the key concepts (technical terms, topics, ideas) from the following text.
Return ONLY a JSON array of lowercase concept strings. No explanation.
Example: ["tcp handshake", "three-way handshake", "syn packet", "networking"]

Text:
`;

/**
 * Extract concepts from text and link them to a source.
 * Runs async — intended to be called in the background after creating highlights/notes.
 */
export async function extractAndLinkConcepts(
  userId: string,
  plan: string,
  text: string,
  sourceType: "highlight" | "note" | "flashcard",
  sourceId: string,
  chapterId: string,
  courseId: string,
): Promise<string[]> {
  await getOrCreateBalance(userId, plan);
  const reserved = await reserveCredits(userId, RESERVE_AMOUNT);
  if (!reserved) return [];

  let creditsReconciled = false;

  try {
    const { model, def } = await getAiModel(userId, plan, "explain");

    const result = await generateText({
      model,
      prompt: EXTRACT_PROMPT + text.slice(0, 2000),
    });

    // Pass the actual reserved amount so reconcile calculates correctly
    await reconcileCredits(
      userId,
      "concept_extract",
      def.provider,
      def.id,
      result.usage?.inputTokens ?? 0,
      result.usage?.outputTokens ?? 0,
      def.multiplier,
      RESERVE_AMOUNT,
      courseId,
      chapterId,
    );
    creditsReconciled = true;

    // Parse concepts
    let concepts: string[] = [];
    try {
      const match = result.text.trim().match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        concepts = parsed
          .filter((c: unknown): c is string => typeof c === "string" && c.trim().length > 0)
          .map((c: string) => c.trim().toLowerCase())
          .slice(0, 20);
      }
    } catch {
      /* invalid JSON */
    }

    if (concepts.length === 0) return [];

    // Upsert concepts and create links (DB errors here should NOT refund credits)
    for (const name of concepts) {
      try {
        const concept = await db.concept.upsert({
          where: { userId_name: { userId, name } },
          create: { userId, name },
          update: {},
        });

        await db.conceptLink
          .create({
            data: { conceptId: concept.id, sourceType, sourceId, chapterId, courseId },
          })
          .catch(() => {}); // Ignore duplicate link errors
      } catch {
        // Skip individual concept errors, continue with others
      }
    }

    return concepts;
  } catch {
    // Only refund if credits weren't already reconciled
    if (!creditsReconciled) {
      await db.aiCreditBalance
        .update({
          where: { userId },
          data: { credits: { increment: RESERVE_AMOUNT } },
        })
        .catch(() => {});
    }
    return [];
  }
}
