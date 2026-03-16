import { z } from "zod";

export const updateProgressSchema = z.object({
  scrollPosition: z.number().min(0).max(1),
  completed: z.boolean().optional(),
  timeSpentSec: z.number().int().min(0).optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
