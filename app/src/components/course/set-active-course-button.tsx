"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SetActiveCourseButtonProps {
  courseId: string;
  isActive: boolean;
}

export function SetActiveCourseButton({ courseId, isActive }: SetActiveCourseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isActive) {
    return <Badge variant="success">Active</Badge>;
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
