"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteEditor } from "./note-editor";
import { formatRelative } from "@/lib/utils/date";
import type { Note } from "@prisma/client";

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

  return (
    <div className="group space-y-1.5">
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
