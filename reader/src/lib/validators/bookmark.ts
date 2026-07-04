import { z } from "zod";

export const createBookmarkSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  sectionId: z.string().optional(),
  label: z.string().max(200).optional(),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
