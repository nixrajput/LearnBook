"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/use-autosave";

interface NoteEditorProps {
  noteId?: string;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** If true, autosave on change (for existing notes). If false, only save on button click (new notes). */
  autoSaveMode?: boolean;
}

export function NoteEditor({
  noteId,
  initialContent,
  onSave,
  onCancel,
  autoFocus = false,
  autoSaveMode = false,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  useAutosave(
    content,
    async (value) => {
      if (!autoSaveMode || !noteId) return;
      setSaving(true);
      try {
        await onSave(value);
      } finally {
        setSaving(false);
      }
    },
    1500,
  );

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave(content);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a note…"
        className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape" && onCancel) {
            onCancel();
          }
        }}
      />
      {!autoSaveMode && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">⌘↵ to save</span>
        </div>
      )}
      {autoSaveMode && saving && <p className="text-xs text-muted-foreground">Saving…</p>}
    </div>
  );
}
