import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";

const f = fsrs();

export interface CardSchedulingFields {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  learningSteps: number;
  lastReview: Date | null;
  dueDate: Date | null;
}

/** Convert DB fields to ts-fsrs Card object */
export function dbToFsrsCard(fields: CardSchedulingFields): Card {
  if (fields.reps === 0) {
    return createEmptyCard(new Date());
  }
  return {
    due: fields.dueDate ?? new Date(),
    stability: fields.stability,
    difficulty: fields.difficulty,
    elapsed_days: fields.elapsedDays,
    scheduled_days: fields.scheduledDays,
    reps: fields.reps,
    lapses: fields.lapses,
    state: fields.state as State,
    last_review: fields.lastReview ?? undefined,
    learning_steps: fields.learningSteps,
  };
}

/** Schedule a card after a review rating. Returns updated scheduling fields. */
export function scheduleCard(fields: CardSchedulingFields, rating: number): CardSchedulingFields {
  const card = dbToFsrsCard(fields);
  const now = new Date();
  const grade = rating as Grade;
  const result = f.repeat(card, now);
  const scheduled = result[grade].card;

  return {
    stability: scheduled.stability,
    difficulty: scheduled.difficulty,
    elapsedDays: scheduled.elapsed_days,
    scheduledDays: scheduled.scheduled_days,
    reps: scheduled.reps,
    lapses: scheduled.lapses,
    state: scheduled.state as number,
    learningSteps: scheduled.learning_steps,
    lastReview: now,
    dueDate: scheduled.due,
  };
}

/** Get a new empty card's scheduling fields */
export function newCardFields(): CardSchedulingFields {
  const card = createEmptyCard(new Date());
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as number,
    learningSteps: card.learning_steps,
    lastReview: null,
    dueDate: card.due,
  };
}

export { Rating, State };
