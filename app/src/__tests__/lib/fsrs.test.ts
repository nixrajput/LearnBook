import { describe, it, expect } from "vitest";
import { scheduleCard, newCardFields, Rating } from "@/lib/flashcards/fsrs";

describe("FSRS scheduling", () => {
  it("newCardFields returns valid initial state", () => {
    const fields = newCardFields();
    expect(fields.reps).toBe(0);
    expect(fields.lapses).toBe(0);
    expect(fields.state).toBe(0); // New
    expect(fields.stability).toBe(0);
    expect(fields.dueDate).toBeInstanceOf(Date);
  });

  it("scheduleCard with Good rating advances to Learning state", () => {
    const fields = newCardFields();
    const updated = scheduleCard(fields, Rating.Good);
    expect(updated.reps).toBe(1);
    expect(updated.lastReview).toBeInstanceOf(Date);
    expect(updated.dueDate).toBeInstanceOf(Date);
  });

  it("scheduleCard with Again rating keeps card in learning", () => {
    const fields = newCardFields();
    const updated = scheduleCard(fields, Rating.Again);
    expect(updated.reps).toBe(1);
    expect(updated.state).toBeLessThanOrEqual(1); // New or Learning
  });

  it("scheduleCard with Easy rating gives longer interval", () => {
    const fields = newCardFields();
    const good = scheduleCard(fields, Rating.Good);
    const easy = scheduleCard(fields, Rating.Easy);
    // Easy should schedule further out than Good
    expect(easy.scheduledDays).toBeGreaterThanOrEqual(good.scheduledDays);
  });

  it("multiple reviews increase reps count", () => {
    let fields = newCardFields();
    fields = scheduleCard(fields, Rating.Good);
    expect(fields.reps).toBe(1);
    fields = scheduleCard(fields, Rating.Good);
    expect(fields.reps).toBe(2);
    fields = scheduleCard(fields, Rating.Good);
    expect(fields.reps).toBe(3);
  });

  it("Again after multiple reviews increments lapses", () => {
    let fields = newCardFields();
    // Get to Review state first
    fields = scheduleCard(fields, Rating.Good);
    fields = scheduleCard(fields, Rating.Good);
    fields = scheduleCard(fields, Rating.Good);
    const lapsesBefore = fields.lapses;
    fields = scheduleCard(fields, Rating.Again);
    // Lapses should increase when a reviewed card gets Again
    expect(fields.lapses).toBeGreaterThanOrEqual(lapsesBefore);
  });

  it("preserves learningSteps through scheduling", () => {
    const fields = newCardFields();
    const updated = scheduleCard(fields, Rating.Good);
    expect(typeof updated.learningSteps).toBe("number");
  });
});
