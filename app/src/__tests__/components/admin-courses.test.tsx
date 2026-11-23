// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntlWrapper } from "../test-intl-wrapper";
// jest-dom matchers loaded via setup-dom.ts

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin/courses",
}));

import { AdminCourseTable } from "@/components/admin/course-table";

const mockCourses = [
  {
    id: "c1",
    title: "Backend Engineering",
    collectionId: "backend-eng",
    totalChapters: 27,
    totalParts: 9,
    isPublished: true,
    createdAt: "2026-01-01T00:00:00Z",
    sourceType: "markdown",
    fileSize: null,
    enrolledUsers: 5,
    notesCount: 12,
  },
  {
    id: "c2",
    title: "Frontend Masters",
    collectionId: "frontend-masters",
    totalChapters: 15,
    totalParts: 5,
    isPublished: false,
    createdAt: "2026-02-01T00:00:00Z",
    sourceType: "pdf",
    fileSize: 2500000,
    enrolledUsers: 0,
    notesCount: 0,
  },
];

describe("AdminCourseTable", () => {
  it("renders empty state when no courses", () => {
    render(<AdminCourseTable courses={[]} />, { wrapper: IntlWrapper });
    expect(screen.getByText("No courses yet. Upload one to get started.")).toBeInTheDocument();
  });

  it("renders course rows", () => {
    render(<AdminCourseTable courses={mockCourses} />, { wrapper: IntlWrapper });
    expect(screen.getByText("Backend Engineering")).toBeInTheDocument();
    expect(screen.getByText("Frontend Masters")).toBeInTheDocument();
  });

  it("shows Published badge for published courses", () => {
    render(<AdminCourseTable courses={mockCourses} />, { wrapper: IntlWrapper });
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("shows Draft badge for unpublished courses", () => {
    render(<AdminCourseTable courses={mockCourses} />, { wrapper: IntlWrapper });
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows collection ID", () => {
    render(<AdminCourseTable courses={mockCourses} />, { wrapper: IntlWrapper });
    expect(screen.getByText("backend-eng")).toBeInTheDocument();
  });

  it("shows content stats in compact format", () => {
    render(<AdminCourseTable courses={mockCourses} />, { wrapper: IntlWrapper });
    // Content column shows "9p · 27ch · 12n" format
    expect(screen.getByText("9p · 27ch · 12n")).toBeInTheDocument();
    expect(screen.getByText("5p · 15ch · 0n")).toBeInTheDocument();
  });
});
