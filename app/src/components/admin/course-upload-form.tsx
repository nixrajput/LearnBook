"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileJson, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadResult {
  success: boolean;
  courseId?: string;
  partsCount?: number;
  chaptersCount?: number;
  error?: string;
  details?: { field: string; message: string }[];
}

export function CourseUploadForm() {
  const router = useRouter();
  const manifestRef = useRef<HTMLInputElement>(null);
  const markdownRef = useRef<HTMLInputElement>(null);

  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleUpload() {
    if (!manifestFile || !markdownFile) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("manifest", manifestFile);
    formData.append("markdown", markdownFile);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, ...data });
        setManifestFile(null);
        setMarkdownFile(null);
        if (manifestRef.current) manifestRef.current.value = "";
        if (markdownRef.current) markdownRef.current.value = "";
      } else {
        setResult({ success: false, error: data.error, details: data.details });
      }
    } catch {
      setResult({ success: false, error: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Manifest file */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <FileJson className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">manifest.json</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Must contain: id, title, description. Optional: entryFile.
        </p>
        <input
          ref={manifestRef}
          type="file"
          accept=".json"
          onChange={(e) => setManifestFile(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
        {manifestFile && (
          <p className="mt-2 text-xs text-muted-foreground">
            {manifestFile.name} ({(manifestFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Markdown file */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Course content (.md)</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Markdown with &quot;# Part I – Title&quot; and &quot;## Chapter 1 – Title&quot; headings.
        </p>
        <input
          ref={markdownRef}
          type="file"
          accept=".md"
          onChange={(e) => setMarkdownFile(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
        {markdownFile && (
          <p className="mt-2 text-xs text-muted-foreground">
            {markdownFile.name} ({(markdownFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Upload button */}
      <Button
        className="w-full gap-2"
        onClick={handleUpload}
        disabled={!manifestFile || !markdownFile || uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading & Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Course
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">
              {result.success ? "Course uploaded successfully!" : result.error}
            </span>
          </div>
          {result.success && (
            <div className="mt-2 text-xs text-muted-foreground">
              {result.partsCount} parts, {result.chaptersCount} chapters created (unpublished).
              <Button
                variant="link"
                size="sm"
                className="ml-1 h-auto p-0 text-xs"
                onClick={() => router.push("/admin/courses")}
              >
                Go to courses →
              </Button>
            </div>
          )}
          {result.details && (
            <ul className="mt-2 space-y-1">
              {result.details.map((d, i) => (
                <li key={i} className="text-xs text-destructive">
                  {d.field}: {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
