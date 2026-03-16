"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SetActiveCourseButtonProps {
  courseId: string;
  isActive: boolean;
}

export function SetActiveCourseButton({ courseId, isActive }: SetActiveCourseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isActive) {
    return (
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        Active
      </span>
    );
  }

  async function handleActivate() {
    setLoading(true);
    await fetch(`/api/courses/${courseId}/activate`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleActivate} disabled={loading}>
      {loading ? "Activating…" : "Set active"}
    </Button>
  );
}
