import { type LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";
import { type ModelDef, resolveModel } from "./models";
import { db } from "@/lib/db";

/** Get the user's selected model preference from DB */
export async function getUserModelPreference(userId: string): Promise<string> {
  const pref = await db.aiPreference.findUnique({ where: { userId } });
  return pref?.selectedModel ?? "auto";
}

/** Create a language model instance from a model definition */
function createModel(def: ModelDef): LanguageModel {
  switch (def.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai(def.id);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      return anthropic(def.id);
    }
    case "google": {
      const google = createGoogle({ apiKey: process.env.GOOGLE_AI_API_KEY });
      return google(def.id);
    }
  }
}

export interface ResolvedModel {
  model: LanguageModel;
  def: ModelDef;
}

/**
 * Resolve and create the AI model for a given user + action.
 * Reads user preference from DB, validates against plan, creates provider client.
 */
export async function getAiModel(
  userId: string,
  plan: string,
  action: string,
): Promise<ResolvedModel> {
  const selectedModel = await getUserModelPreference(userId);
  const def = resolveModel(selectedModel, action, plan);
  const model = createModel(def);
  return { model, def };
}
