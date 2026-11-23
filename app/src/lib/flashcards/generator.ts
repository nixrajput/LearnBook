import { generateText } from "ai";
import { type ResolvedModel } from "@/lib/ai/router";

const FLASHCARD_PROMPT = `You are a study assistant. Generate flashcards from the provided content.

Rules:
- Each flashcard has a "front" (question/prompt) and "back" (answer)
- Questions should test understanding, not just recall
- Keep answers concise but complete
- Generate 5-10 flashcards depending on content density
- Return ONLY a valid JSON array of objects with "front" and "back" fields
- No markdown, no explanation — just the JSON array

Content:
`;

export interface GeneratedCard {
  front: string;
  back: string;
}

/** Generate flashcards from text content using AI */
export async function generateFlashcards(
  content: string,
  resolvedModel: ResolvedModel,
): Promise<{ cards: GeneratedCard[]; inputTokens: number; outputTokens: number }> {
  const result = await generateText({
    model: resolvedModel.model,
    prompt: FLASHCARD_PROMPT + content.slice(0, 6000),
  });

  let cards: GeneratedCard[] = [];
  try {
    // Extract JSON array from response (handle potential markdown wrapping)
    const text = result.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cards = JSON.parse(jsonMatch[0]);
    }
  } catch {
    cards = [];
  }

  // Validate structure
  cards = cards.filter(
    (c): c is GeneratedCard =>
      typeof c === "object" &&
      c !== null &&
      typeof c.front === "string" &&
      typeof c.back === "string" &&
      c.front.length > 0 &&
      c.back.length > 0,
  );

  return {
    cards,
    inputTokens: result.usage?.inputTokens ?? 0,
    outputTokens: result.usage?.outputTokens ?? 0,
  };
}
