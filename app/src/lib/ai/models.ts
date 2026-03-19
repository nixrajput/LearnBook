export type ModelTier = "budget" | "standard" | "premium";

export interface ModelDef {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google";
  tier: ModelTier;
  multiplier: number;
  /** Minimum plan required to select this model */
  minPlan: "FREE" | "PRO" | "PREMIUM";
}

export const MODEL_REGISTRY: ModelDef[] = [
  // Budget tier (1x) — available to all plans
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    tier: "budget",
    multiplier: 1,
    minPlan: "FREE",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini Flash",
    provider: "google",
    tier: "budget",
    multiplier: 1,
    minPlan: "FREE",
  },

  // Standard tier (2x) — PRO and above
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku",
    provider: "anthropic",
    tier: "standard",
    multiplier: 2,
    minPlan: "PRO",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    tier: "standard",
    multiplier: 2,
    minPlan: "PRO",
  },

  // Premium tier (3x) — PREMIUM only
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet",
    provider: "anthropic",
    tier: "premium",
    multiplier: 3,
    minPlan: "PREMIUM",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    tier: "premium",
    multiplier: 3,
    minPlan: "PREMIUM",
  },
];

/**
 * Default model per AI action type (used in "auto" mode).
 * All defaults MUST be budget-tier (FREE-accessible) to avoid silent fallback.
 * PRO/PREMIUM users who want better models should select them explicitly.
 */
export const AUTO_ROUTE: Record<string, string> = {
  summarize: "gemini-2.0-flash",
  flashcard: "gpt-4o-mini",
  explain: "gpt-4o-mini",
  ask: "gpt-4o-mini",
  quiz: "gpt-4o-mini",
  study_session: "gpt-4o-mini",
};

export function getModelDef(modelId: string): ModelDef | undefined {
  return MODEL_REGISTRY.find((m) => m.id === modelId);
}

export function getModelsForPlan(plan: string): ModelDef[] {
  const planOrder: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
  const userLevel = planOrder[plan] ?? 0;
  return MODEL_REGISTRY.filter((m) => (planOrder[m.minPlan] ?? 0) <= userLevel);
}

export function resolveModel(selectedModel: string, action: string, plan: string): ModelDef {
  if (selectedModel !== "auto") {
    const def = getModelDef(selectedModel);
    if (def) {
      const available = getModelsForPlan(plan);
      if (available.some((m) => m.id === def.id)) return def;
    }
    // Fallback to auto if selected model not available for plan
  }

  // Auto mode: route by action type
  const autoModelId = AUTO_ROUTE[action] ?? "gpt-4o-mini";
  const def = getModelDef(autoModelId);
  if (def) {
    // Check if auto-routed model is available for plan, downgrade if not
    const available = getModelsForPlan(plan);
    if (available.some((m) => m.id === def.id)) return def;
    // Fallback to cheapest available
    return available[0] ?? MODEL_REGISTRY[0];
  }

  return MODEL_REGISTRY[0];
}
