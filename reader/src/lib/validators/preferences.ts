import { z } from "zod";

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  fontSize: z.number().int().min(12).max(24).optional(),
  lineWidth: z.enum(["sm", "md", "lg", "xl"]).optional(),
  fontFamily: z.enum(["sans", "serif", "mono"]).optional(),
  showLineNumbers: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
