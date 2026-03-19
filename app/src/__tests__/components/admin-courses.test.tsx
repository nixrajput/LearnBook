// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  },
  {
    id: "c2",
    title: "Frontend Masters",
    collectionId: "frontend-masters",
    totalChapters: 15,
    totalParts: 5,
    isPublished: false,
    createdAt: "2026-02-01T00:00:00Z",
  },
];

describe("AdminCourseTable", () => {
  it("renders empty state when no courses", () => {
    render(<AdminCourseTable courses={[]} />);
    expect(screen.getByText("No courses yet. Upload one to get started.")).toBeInTheDocument();
  });

  it("renders course rows", () => {
    render(<AdminCourseTable courses={mockCourses} />);
    expect(screen.getByText("Backend Engineering")).toBeInTheDocument();
    expect(screen.getByText("Frontend Masters")).toBeInTheDocument();
  });

  it("shows Published badge for published courses", () => {
    render(<AdminCourseTable courses={mockCourses} />);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("shows Draft badge for unpublished courses", () => {
    render(<AdminCourseTable courses={mockCourses} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows collection ID", () => {
    render(<AdminCourseTable courses={mockCourses} />);
    expect(screen.getByText("backend-eng")).toBeInTheDocument();
  });

  it("shows chapter and part counts", () => {
    render(<AdminCourseTable courses={mockCourses} />);
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });
});
