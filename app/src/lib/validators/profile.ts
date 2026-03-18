import { z } from "zod";

export const updateProfileSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Display name is required")
      .max(50, "Display name must be 50 characters or less")
      .trim()
      .optional(),
    bio: z.string().max(300, "Bio must be 300 characters or less").trim().optional(),
  })
  .refine((data) => data.displayName !== undefined || data.bio !== undefined, {
    message: "At least one field must be provided",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
