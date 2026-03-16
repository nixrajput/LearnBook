import { z } from "zod";

export const NOTE_SCOPES = ["selection", "section", "chapter", "course"] as const;
export type NoteScope = (typeof NOTE_SCOPES)[number];

export const createNoteSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  sectionSlug: z.string().optional(),
  scope: z.enum(NOTE_SCOPES).default("chapter"),
  selectedText: z.string().optional(),
  content: z.string().min(1, "Note cannot be empty").max(10000),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(10000),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
