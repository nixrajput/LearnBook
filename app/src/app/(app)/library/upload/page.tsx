"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LibraryUploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: `"${data.title}" uploaded — ${data.chapters} chapters created`,
        });
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setResult({ success: false, message: data.error ?? "Upload failed" });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Upload Content</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Upload a PDF or EPUB file to add it to your personal library.
      </p>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Select file</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Supported formats: PDF, EPUB (max 50MB)
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.epub"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
        {file && (
          <p className="mt-2 text-xs text-muted-foreground">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <Button className="mt-6 w-full gap-2" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload & Import
          </>
        )}
      </Button>

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 ${
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
            <span className="text-sm">{result.message}</span>
          </div>
          {result.success && (
            <Button
              variant="link"
              size="sm"
              className="mt-2 h-auto p-0 text-xs"
              onClick={() => router.push("/library")}
            >
              Go to Library →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
