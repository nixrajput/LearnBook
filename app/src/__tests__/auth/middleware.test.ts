import { describe, it, expect } from "vitest";

// Test the proxy/middleware logic as pure functions
const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/login",
  "/terms",
  "/privacy",
  "/api/auth",
  "/api/stripe/webhook",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

describe("proxy path matching", () => {
  describe("public paths", () => {
    it("allows root /", () => expect(isPublicPath("/")).toBe(true));
    it("allows /pricing", () => expect(isPublicPath("/pricing")).toBe(true));
    it("allows /login", () => expect(isPublicPath("/login")).toBe(true));
    it("allows /terms", () => expect(isPublicPath("/terms")).toBe(true));
    it("allows /privacy", () => expect(isPublicPath("/privacy")).toBe(true));
    it("allows /api/auth subpaths", () =>
      expect(isPublicPath("/api/auth/callback/google")).toBe(true));
    it("allows /api/stripe/webhook", () => expect(isPublicPath("/api/stripe/webhook")).toBe(true));
  });

  describe("protected paths", () => {
    it("blocks /dashboard", () => expect(isPublicPath("/dashboard")).toBe(false));
    it("blocks /notes", () => expect(isPublicPath("/notes")).toBe(false));
    it("blocks /api/notes", () => expect(isPublicPath("/api/notes")).toBe(false));
    it("blocks /profile", () => expect(isPublicPath("/profile")).toBe(false));
    it("blocks /admin", () => expect(isPublicPath("/admin")).toBe(false));
    it("blocks /api/admin/users", () => expect(isPublicPath("/api/admin/users")).toBe(false));
    it("blocks /settings", () => expect(isPublicPath("/settings")).toBe(false));
    it("blocks /api/stripe/checkout", () =>
      expect(isPublicPath("/api/stripe/checkout")).toBe(false));
  });

  describe("admin paths", () => {
    it("detects /admin", () => expect(isAdminPath("/admin")).toBe(true));
    it("detects /admin/users", () => expect(isAdminPath("/admin/users")).toBe(true));
    it("detects /api/admin/courses", () => expect(isAdminPath("/api/admin/courses")).toBe(true));
    it("does not flag /dashboard", () => expect(isAdminPath("/dashboard")).toBe(false));
    it("does not flag /api/notes", () => expect(isAdminPath("/api/notes")).toBe(false));
  });
});
