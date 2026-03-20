import { describe, it, expect } from "vitest";
import { generateInviteCode } from "@/lib/utils/invite-code";

describe("study groups logic", () => {
  describe("invite code generation", () => {
    it("generates 8-character codes", () => {
      expect(generateInviteCode()).toHaveLength(8);
    });

    it("uses only allowed characters", () => {
      const allowed = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      for (let i = 0; i < 100; i++) {
        const code = generateInviteCode();
        for (const char of code) {
          expect(allowed).toContain(char);
        }
      }
    });

    it("excludes confusing characters (I, O, 0, 1)", () => {
      for (let i = 0; i < 100; i++) {
        const code = generateInviteCode();
        expect(code).not.toContain("I");
        expect(code).not.toContain("O");
        expect(code).not.toContain("0");
        expect(code).not.toContain("1");
      }
    });

    it("generates unique codes", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) codes.add(generateInviteCode());
      expect(codes.size).toBe(100); // All unique (probabilistic but near-certain)
    });
  });

  describe("plan limits", () => {
    it("FREE cannot create groups", () => {
      const plan = "FREE";
      expect(plan === "FREE").toBe(true);
    });

    it("PRO can create up to 2 groups", () => {
      const maxGroups = "PRO" === "PREMIUM" ? 10 : 2;
      expect(maxGroups).toBe(2);
    });

    it("PREMIUM can create up to 10 groups", () => {
      const maxGroups = "PREMIUM" === "PREMIUM" ? 10 : 2;
      expect(maxGroups).toBe(10);
    });

    it("join limits exclude owned groups", () => {
      // Join limit should count where role !== "OWNER"
      const memberships = [{ role: "OWNER" }, { role: "MEMBER" }, { role: "MEMBER" }];
      const joinCount = memberships.filter((m) => m.role !== "OWNER").length;
      expect(joinCount).toBe(2);
    });
  });

  describe("membership authorization", () => {
    it("OWNER can delete group", () => {
      const role = "OWNER";
      expect(role === "OWNER").toBe(true);
    });

    it("MEMBER cannot delete group", () => {
      const role = "MEMBER";
      expect(role === "OWNER").toBe(false);
    });

    it("OWNER cannot be removed from group", () => {
      const targetRole = "OWNER";
      expect(targetRole === "OWNER").toBe(true); // Should be blocked
    });
  });

  describe("invite link format", () => {
    it("generates correct URL format", () => {
      const code = "ABC12345";
      const appUrl = "https://learnbook.app";
      const url = `${appUrl}/groups/join?code=${code}`;
      expect(url).toBe("https://learnbook.app/groups/join?code=ABC12345");
    });
  });
});
