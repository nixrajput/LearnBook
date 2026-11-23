// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
// jest-dom matchers loaded via setup-dom.ts

import { QuizCard } from "@/components/quiz/quiz-card";

describe("QuizCard", () => {
  const mcQuestion = {
    type: "multiple_choice",
    question: "What does HTTP stand for?",
    options: ["HyperText Transfer Protocol", "High Tech Processing", "Home Tool Pack", "None"],
    correctAnswer: "HyperText Transfer Protocol",
  };

  it("renders question text", () => {
    render(
      <QuizCard question={mcQuestion} index={0} total={5} answer={undefined} onAnswer={() => {}} />,
    );
    expect(screen.getByText("What does HTTP stand for?")).toBeInTheDocument();
  });

  it("renders all options for multiple choice", () => {
    render(
      <QuizCard question={mcQuestion} index={0} total={5} answer={undefined} onAnswer={() => {}} />,
    );
    expect(screen.getByText("HyperText Transfer Protocol")).toBeInTheDocument();
    expect(screen.getByText("High Tech Processing")).toBeInTheDocument();
  });

  it("calls onAnswer when option clicked", () => {
    const onAnswer = vi.fn();
    render(
      <QuizCard question={mcQuestion} index={0} total={5} answer={undefined} onAnswer={onAnswer} />,
    );
    fireEvent.click(screen.getByText("HyperText Transfer Protocol"));
    expect(onAnswer).toHaveBeenCalledWith("HyperText Transfer Protocol");
  });

  it("shows question number", () => {
    render(
      <QuizCard question={mcQuestion} index={2} total={5} answer={undefined} onAnswer={() => {}} />,
    );
    expect(screen.getByText("Question 3 of 5")).toBeInTheDocument();
  });

  it("renders True/False buttons for true_false type", () => {
    const tfQuestion = {
      type: "true_false",
      question: "TCP is connection-oriented?",
      correctAnswer: true,
    };
    render(
      <QuizCard question={tfQuestion} index={0} total={1} answer={undefined} onAnswer={() => {}} />,
    );
    expect(screen.getByText("True")).toBeInTheDocument();
    expect(screen.getByText("False")).toBeInTheDocument();
  });
});
