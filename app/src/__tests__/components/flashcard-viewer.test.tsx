// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
// jest-dom matchers loaded via setup-dom.ts

import { CardViewer } from "@/components/flashcards/card-viewer";

describe("CardViewer", () => {
  it("shows question side initially", () => {
    render(<CardViewer front="What is TCP?" back="Transmission Control Protocol" />);
    expect(screen.getByText("Question")).toBeInTheDocument();
    expect(screen.getByText("What is TCP?")).toBeInTheDocument();
  });

  it("shows 'Click to reveal answer' initially", () => {
    render(<CardViewer front="Q" back="A" />);
    expect(screen.getByText("Click to reveal answer")).toBeInTheDocument();
  });

  it("shows 'Click to see question' after flip", () => {
    render(<CardViewer front="Q" back="A" />);
    fireEvent.click(screen.getByText("Click to reveal answer").closest("div")!);
    expect(screen.getByText("Click to see question")).toBeInTheDocument();
  });
});
