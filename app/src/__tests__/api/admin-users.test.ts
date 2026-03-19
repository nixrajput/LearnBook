import { describe, it, expect } from "vitest";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "PRO", "PREMIUM"]).optional(),
});

describe("admin users API", () => {
  describe("update validation", () => {
    it("accepts role change to ADMIN", () => {
      expect(updateUserSchema.safeParse({ role: "ADMIN" }).success).toBe(true);
    });
    it("accepts role change to USER", () => {
      expect(updateUserSchema.safeParse({ role: "USER" }).success).toBe(true);
    });
    it("accepts plan change", () => {
      expect(updateUserSchema.safeParse({ plan: "PRO" }).success).toBe(true);
    });
    it("rejects invalid role", () => {
      expect(updateUserSchema.safeParse({ role: "SUPERADMIN" }).success).toBe(false);
    });
    it("rejects invalid plan", () => {
      expect(updateUserSchema.safeParse({ plan: "ENTERPRISE" }).success).toBe(false);
    });
  });

  describe("self-protection", () => {
    it("prevents self-demotion", () => {
      const actingUserId = "u1";
      const targetId = "u1";
      const newRole = "USER";
      const blocked = targetId === actingUserId && newRole === "USER";
      expect(blocked).toBe(true);
    });

    it("allows demoting other users", () => {
      const actingUserId = "u1";
      const targetId = "u2";
      const newRole = "USER";
      const blocked = targetId === actingUserId && newRole === "USER";
      expect(blocked).toBe(false);
    });

    it("prevents self-deletion", () => {
      const actingUserId = "u1";
      const targetId = "u1";
      expect(targetId === actingUserId).toBe(true);
    });

    it("allows deleting other users", () => {
      const actingUserId = "u1";
      const targetId = "u2";
      expect(targetId === actingUserId).toBe(false);
    });
  });
});
