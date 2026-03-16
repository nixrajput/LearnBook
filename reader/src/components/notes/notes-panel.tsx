"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useReaderStore } from "@/stores/reader-store";
import { NoteEditor } from "./note-editor";
import { NoteCard } from "./note-card";
import type { Note } from "@prisma/client";

interface NotesPanelProps {
  courseId: string;
  chapterId: string;
  chapterTitle: string;
}

export function NotesPanel({ courseId, chapterId, chapterTitle }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [creating, setCreating] = useState(false);
  const setNotesPanelOpen = useReaderStore((s) => s.setNotesPanelOpen);

  const loadNotes = useCallback(async () => {
    const res = await fetch(`/api/notes?chapterId=${chapterId}`);
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  }, [chapterId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreate = async (content: string) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, chapterId, content }),
    });
    if (res.ok) {
      setCreating(false);
      loadNotes();
    }
  };

  const handleUpdate = async (id: string, content: string) => {
    await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    loadNotes();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <aside className="hidden w-80 shrink-0 animate-slide-in-right flex-col border-l bg-background lg:flex">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">My Notes</h3>
          <p className="max-w-[180px] truncate text-xs text-muted-foreground">{chapterTitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCreating(true)}
            title="Add note"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setNotesPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {/* New note editor */}
          {creating && (
            <div className="animate-scale-in rounded-lg border bg-accent/30 p-3">
              <NoteEditor
                initialContent=""
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
                autoFocus
              />
            </div>
          )}

          {/* Existing notes */}
          {notes.length === 0 && !creating && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No notes yet.</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setCreating(true)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add a note
              </Button>
            </div>
          )}

          {notes.map((note, i) => (
            <div
              key={note.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {i > 0 && <Separator className="mb-3" />}
              <NoteCard note={note} onUpdate={handleUpdate} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
