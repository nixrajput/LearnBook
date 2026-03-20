import type { Metadata } from "next";
import { ReviewSession } from "@/components/flashcards/review-session";

export const metadata: Metadata = { title: "Daily Review" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Daily Review</h1>
        <p className="mt-1 text-muted-foreground">Review your due flashcards</p>
      </div>
      <ReviewSession />
    </div>
  );
}
