import { describe, it, expect } from "vitest";
import { resolveModel, getModelsForPlan } from "@/lib/ai/models";

describe("AI router logic", () => {
  it("auto mode always resolves to a budget model for FREE", () => {
    const actions = ["summarize", "explain", "ask", "flashcard", "quiz", "study_session"];
    for (const action of actions) {
      const def = resolveModel("auto", action, "FREE");
      expect(def.minPlan).toBe("FREE");
      expect(def.tier).toBe("budget");
    }
  });

  it("PRO user selecting premium model falls back to budget", () => {
    const def = resolveModel("claude-sonnet-4-6", "ask", "PRO");
    expect(def.tier).not.toBe("premium");
  });

  it("PREMIUM user can use any model", () => {
    const def = resolveModel("claude-sonnet-4-6", "ask", "PREMIUM");
    expect(def.id).toBe("claude-sonnet-4-6");
  });

  it("unknown model falls back to auto", () => {
    const def = resolveModel("nonexistent-model", "ask", "FREE");
    expect(def.tier).toBe("budget");
  });

  it("unknown action falls back to gpt-4o-mini", () => {
    const def = resolveModel("auto", "unknown_action", "FREE");
    expect(def.id).toBe("gpt-4o-mini");
  });

  it("plan model availability is monotonically increasing", () => {
    const free = getModelsForPlan("FREE").length;
    const pro = getModelsForPlan("PRO").length;
    const premium = getModelsForPlan("PREMIUM").length;
    expect(free).toBeLessThanOrEqual(pro);
    expect(pro).toBeLessThanOrEqual(premium);
  });
});
