import { z } from "zod";

export const createHighlightSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  text: z.string().min(1).max(2000),
  color: z.enum(["yellow", "green", "blue", "pink"]).default("yellow"),
  note: z.string().max(1000).optional(),
});

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;
