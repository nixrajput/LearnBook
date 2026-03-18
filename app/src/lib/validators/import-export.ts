import { z } from "zod";

export const exportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  notes: z.array(
    z.object({
      chapterSlug: z.string(),
      sectionSlug: z.string().nullable().optional(),
      content: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  bookmarks: z.array(
    z.object({
      chapterSlug: z.string(),
      sectionSlug: z.string().nullable().optional(),
      label: z.string().nullable().optional(),
      createdAt: z.string(),
    }),
  ),
  highlights: z.array(
    z.object({
      chapterSlug: z.string(),
      text: z.string(),
      color: z.string(),
      note: z.string().nullable().optional(),
      startOffset: z.number(),
      endOffset: z.number(),
      createdAt: z.string(),
    }),
  ),
  progress: z.array(
    z.object({
      chapterSlug: z.string(),
      scrollPosition: z.number(),
      completed: z.boolean(),
      completedAt: z.string().nullable().optional(),
      timeSpentSec: z.number(),
    }),
  ),
  preferences: z.object({
    theme: z.string(),
    fontSize: z.number(),
    lineWidth: z.string(),
    fontFamily: z.string(),
    showLineNumbers: z.boolean(),
  }),
});

export type ExportPayloadInput = z.infer<typeof exportPayloadSchema>;
