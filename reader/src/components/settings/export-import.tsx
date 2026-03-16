"use client";

import { useState, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportImport() {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importStats, setImportStats] = useState<Record<string, number> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const res = await fetch("/api/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backend-reader-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setImportStats(result.stats);
        setImportStatus("success");
      } else {
        setImportStatus("error");
      }
    } catch {
      setImportStatus("error");
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export data
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import data
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      {importStatus === "success" && importStats && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950">
          <p className="font-medium text-green-700 dark:text-green-300">Import successful!</p>
          <ul className="mt-1 space-y-0.5 text-xs text-green-600 dark:text-green-400">
            <li>{importStats.notes} notes imported</li>
            <li>{importStats.bookmarks} bookmarks imported</li>
            <li>{importStats.highlights} highlights imported</li>
            <li>{importStats.progress} progress records imported</li>
          </ul>
        </div>
      )}
      {importStatus === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Import failed. Please ensure the file is a valid Backend Reader export.
        </div>
      )}
    </div>
  );
}
