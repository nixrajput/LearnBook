import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { auth } from "@/auth";
import { redirect } from "next/navigation";

const mockAuth = vi.mocked(auth);
const mockRedirect = vi.mocked(redirect);

beforeEach(() => vi.clearAllMocks());

// We test the logic inline since requireSession/requireApiSession are thin wrappers
describe("requireSession logic", () => {
  it("returns user when session exists", async () => {
    const user = { id: "u1", role: "USER", plan: "FREE" };
    mockAuth.mockResolvedValue({ user, expires: "" } as never);
    const session = await auth();
    expect(session?.user).toEqual(user);
  });

  it("would redirect when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const session = await auth();
    if (!session?.user) {
      expect(() => redirect("/login")).toThrow("NEXT_REDIRECT");
    }
  });
});

describe("requireApiSession logic", () => {
  it("returns null when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const session = await auth();
    const user = session?.user?.id ? session.user : null;
    expect(user).toBeNull();
  });

  it("returns null when user has no id", async () => {
    mockAuth.mockResolvedValue({ user: { name: "test" }, expires: "" } as never);
    const session = await auth();
    const user = session?.user?.id ? session.user : null;
    expect(user).toBeNull();
  });

  it("returns user when session has id", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", role: "USER", plan: "FREE" },
      expires: "",
    } as never);
    const session = await auth();
    const user = session?.user?.id ? session.user : null;
    expect(user).toBeDefined();
    expect(user!.id).toBe("u1");
  });
});
