"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Eye, EyeOff, FileText, BookOpen, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface CourseRow {
  id: string;
  title: string;
  collectionId: string;
  totalChapters: number;
  totalParts: number;
  isPublished: boolean;
  createdAt: string;
  sourceType: string;
  fileSize: number | null;
  enrolledUsers: number;
  notesCount: number;
}

const SOURCE_CONFIG: Record<string, { icon: typeof BookOpen; label: string; color: string }> = {
  markdown: {
    icon: BookOpen,
    label: "MD",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  pdf: { icon: FileText, label: "PDF", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  epub: {
    icon: FileText,
    label: "EPUB",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  web: { icon: Globe, label: "WEB", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminCourseTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseRow | null>(null);
  const [publishTarget, setPublishTarget] = useState<CourseRow | null>(null);

  async function handlePublishConfirm() {
    if (!publishTarget) return;
    setLoading(publishTarget.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${publishTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !publishTarget.isPublished }),
      });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Failed to update");
    } finally {
      setLoading(null);
      setPublishTarget(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setLoading(deleteTarget.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Failed to delete");
    } finally {
      setLoading(null);
      setDeleteTarget(null);
    }
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-muted-foreground">No courses yet. Upload one to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        {error && (
          <div className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Course
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Format
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Content
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Enrolled
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const source = SOURCE_CONFIG[course.sourceType] ?? SOURCE_CONFIG.markdown;
                const SourceIcon = source.icon;
                return (
                  <tr
                    key={course.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{course.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono">{course.collectionId}</span>
                        {course.fileSize && <span>· {formatFileSize(course.fileSize)}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${source.color}`}
                      >
                        <SourceIcon className="h-3 w-3" />
                        {source.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-xs tabular-nums text-muted-foreground">
                        {course.totalParts}p · {course.totalChapters}ch · {course.notesCount}n
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums">
                      {course.enrolledUsers}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPublishTarget(course)}
                          disabled={loading === course.id}
                          title={course.isPublished ? "Unpublish" : "Publish"}
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
                          onClick={() => setDeleteTarget(course)}
                          disabled={loading === course.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!publishTarget}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        title={publishTarget?.isPublished ? "Unpublish Course" : "Publish Course"}
        description={
          publishTarget?.isPublished
            ? `Unpublish "${publishTarget?.title}"? Users will no longer be able to access it.`
            : `Publish "${publishTarget?.title}"? It will become visible to all users.`
        }
        confirmLabel={publishTarget?.isPublished ? "Unpublish" : "Publish"}
        variant={publishTarget?.isPublished ? "warning" : "default"}
        onConfirm={handlePublishConfirm}
        loading={loading === publishTarget?.id}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Course"
        description={`Permanently delete "${deleteTarget?.title}" and all its content, notes, bookmarks, and progress? This cannot be undone.`}
        confirmLabel="Delete Course"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={loading === deleteTarget?.id}
      />
    </>
  );
}
