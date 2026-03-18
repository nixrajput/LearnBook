"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseRow {
  id: string;
  title: string;
  collectionId: string;
  totalChapters: number;
  totalParts: number;
  isPublished: boolean;
  createdAt: string;
}

export function AdminCourseTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function togglePublish(id: string, isPublished: boolean) {
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update course");
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteCourse(id: string, title: string) {
    if (
      !confirm(`Delete "${title}"? This removes all content, notes, and progress for this course.`)
    ) {
      return;
    }
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete course");
      }
    } finally {
      setLoading(null);
    }
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-muted-foreground">No courses yet. Upload one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {error && (
        <div className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">{error}</div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Parts
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Chapters
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-b transition-colors last:border-0 hover:bg-muted/20"
            >
              <td className="px-4 py-3">
                <div className="text-sm font-medium">{course.title}</div>
                <div className="font-mono text-xs text-muted-foreground">{course.collectionId}</div>
              </td>
              <td className="px-4 py-3 text-center text-sm">{course.totalParts}</td>
              <td className="px-4 py-3 text-center text-sm">{course.totalChapters}</td>
              <td className="px-4 py-3 text-center">
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublish(course.id, course.isPublished)}
                    disabled={loading === course.id}
                  >
                    {loading === course.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : course.isPublished ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteCourse(course.id, course.title)}
                    disabled={loading === course.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
