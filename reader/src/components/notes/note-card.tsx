"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteEditor } from "./note-editor";
import { formatRelative } from "@/lib/utils/date";
import type { Note } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

const SCOPE_LABELS: Record<string, string> = {
  selection: "Selection",
  section: "Section",
  chapter: "Chapter",
  course: "Course",
};

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false);

  const handleSave = async (content: string) => {
    await onUpdate(note.id, content);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <NoteEditor
          noteId={note.id}
          initialContent={note.content}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          autoFocus
        />
      </div>
    );
  }

  const scope = (note as Note & { scope?: string }).scope ?? "chapter";
  const selectedText = (note as Note & { selectedText?: string | null }).selectedText;

  return (
    <div className="group space-y-1.5">
      {/* Scope badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            scope === "course"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : scope === "section"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : scope === "selection"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-muted text-muted-foreground",
          )}
        >
          {SCOPE_LABELS[scope] ?? scope}
        </span>
        {note.sectionSlug && scope === "section" && (
          <span className="truncate text-[10px] text-muted-foreground">#{note.sectionSlug}</span>
        )}
      </div>

      {/* Selected text quote */}
      {selectedText && (
        <blockquote className="line-clamp-2 border-l-2 border-muted-foreground/30 pl-2 text-xs italic text-muted-foreground">
          {selectedText}
        </blockquote>
      )}

      <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatRelative(note.updatedAt)}</span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
