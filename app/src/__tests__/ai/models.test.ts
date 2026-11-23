import { describe, it, expect } from "vitest";
import {
  getModelDef,
  getModelsForPlan,
  resolveModel,
  AUTO_ROUTE,
  MODEL_REGISTRY,
} from "@/lib/ai/models";

describe("MODEL_REGISTRY", () => {
  it("has budget, standard, and premium tiers", () => {
    expect(MODEL_REGISTRY.some((m) => m.tier === "budget")).toBe(true);
    expect(MODEL_REGISTRY.some((m) => m.tier === "standard")).toBe(true);
    expect(MODEL_REGISTRY.some((m) => m.tier === "premium")).toBe(true);
  });

  it("budget models have multiplier 1", () => {
    MODEL_REGISTRY.filter((m) => m.tier === "budget").forEach((m) => expect(m.multiplier).toBe(1));
  });

  it("standard models have multiplier 2", () => {
    MODEL_REGISTRY.filter((m) => m.tier === "standard").forEach((m) =>
      expect(m.multiplier).toBe(2),
    );
  });

  it("premium models have multiplier 3", () => {
    MODEL_REGISTRY.filter((m) => m.tier === "premium").forEach((m) => expect(m.multiplier).toBe(3));
  });
});

describe("getModelDef", () => {
  it("finds existing model", () => {
    expect(getModelDef("gpt-4o-mini")?.name).toBe("GPT-4o Mini");
  });

  it("returns undefined for unknown model", () => {
    expect(getModelDef("nonexistent")).toBeUndefined();
  });
});

describe("getModelsForPlan", () => {
  it("FREE gets only budget models", () => {
    const models = getModelsForPlan("FREE");
    expect(models.every((m) => m.tier === "budget")).toBe(true);
    expect(models.length).toBeGreaterThan(0);
  });

  it("PRO gets budget + standard", () => {
    const models = getModelsForPlan("PRO");
    expect(models.some((m) => m.tier === "budget")).toBe(true);
    expect(models.some((m) => m.tier === "standard")).toBe(true);
    expect(models.every((m) => m.tier !== "premium")).toBe(true);
  });

  it("PREMIUM gets all models", () => {
    const models = getModelsForPlan("PREMIUM");
    expect(models.length).toBe(MODEL_REGISTRY.length);
  });
});

describe("resolveModel", () => {
  it("auto mode uses budget model for FREE plan", () => {
    const def = resolveModel("auto", "summarize", "FREE");
    expect(def.tier).toBe("budget");
  });

  it("auto mode returns correct default per action", () => {
    Object.entries(AUTO_ROUTE).forEach(([action, modelId]) => {
      const def = resolveModel("auto", action, "PREMIUM");
      expect(def.id).toBe(modelId);
    });
  });

  it("selected model is used when available for plan", () => {
    const def = resolveModel("gpt-4o", "ask", "PRO");
    expect(def.id).toBe("gpt-4o");
  });

  it("falls back to auto when selected model not available for plan", () => {
    const def = resolveModel("claude-sonnet-4-6", "ask", "FREE");
    expect(def.tier).toBe("budget"); // Falls back, not premium
  });
});
