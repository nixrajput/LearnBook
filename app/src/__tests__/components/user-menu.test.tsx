// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntlWrapper } from "../test-intl-wrapper";
// jest-dom matchers loaded via setup-dom.ts

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/dashboard",
}));

import { UserMenu } from "@/components/auth/user-menu";

describe("UserMenu", () => {
  const baseUser = {
    name: "Test User",
    email: "test@example.com",
    image: null,
    role: "USER",
    plan: "FREE",
  };

  it("renders avatar trigger button", () => {
    render(<UserMenu user={baseUser} />, { wrapper: IntlWrapper });
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows user initials as fallback when no image", () => {
    render(<UserMenu user={baseUser} />, { wrapper: IntlWrapper });
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("shows single initial from email when no name", () => {
    render(<UserMenu user={{ ...baseUser, name: null }} />, { wrapper: IntlWrapper });
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
