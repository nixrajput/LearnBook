import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { SessionChat } from "@/components/study-session/session-chat";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function StudySessionPage({ params }: PageProps) {
  const user = await requireSession();
  const { chapterId } = await params;

  // Server-side plan gate — FREE users see upgrade prompt
  if (user.plan === "FREE") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h2 className="mb-2 text-xl font-bold">AI Study Sessions</h2>
        <p className="mb-6 text-muted-foreground">
          Upgrade to Pro or Premium to unlock interactive AI study sessions.
        </p>
        <Button asChild>
          <Link href="/pricing" className="gap-1.5">
            View Plans <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { title: true, number: true },
  });
  if (!chapter) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <SessionChat
        chapterId={chapterId}
        chapterTitle={`Ch. ${chapter.number} — ${chapter.title}`}
      />
    </div>
  );
}
