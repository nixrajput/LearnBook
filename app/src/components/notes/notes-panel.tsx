"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useReaderStore } from "@/stores/reader-store";
import { NoteEditor } from "./note-editor";
import { NoteCard } from "./note-card";
import { NOTE_SCOPES, type NoteScope } from "@/lib/validators/note";
import type { Note } from "@prisma/client";

const SCOPE_OPTIONS: { value: NoteScope; label: string }[] = [
  { value: "chapter", label: "Chapter" },
  { value: "course", label: "Whole course" },
  { value: "section", label: "Section" },
  { value: "selection", label: "Selection" },
];

interface NotesPanelProps {
  courseId: string;
  chapterId: string;
  chapterTitle: string;
}

export function NotesPanel({ courseId, chapterId, chapterTitle }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [creating, setCreating] = useState(false);
  const [newScope, setNewScope] = useState<NoteScope>("chapter");
  const [filterScope, setFilterScope] = useState<NoteScope | "all">("all");
  const setNotesPanelOpen = useReaderStore((s) => s.setNotesPanelOpen);

  const loadNotes = useCallback(async () => {
    const params = new URLSearchParams({ chapterId });
    const res = await fetch(`/api/notes?${params}`);
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
      body: JSON.stringify({
        courseId,
        chapterId,
        scope: newScope,
        content,
      }),
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

  const visibleNotes =
    filterScope === "all"
      ? notes
      : notes.filter((n) => (n as Note & { scope?: string }).scope === filterScope);

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

      {/* Filter tabs */}
      <div className="flex gap-1 border-b px-3 py-2">
        {(["all", "chapter", "section", "selection", "course"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterScope(s)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize transition-colors ${
              filterScope === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {/* New note editor */}
          {creating && (
            <div className="animate-scale-in rounded-lg border bg-accent/30 p-3">
              {/* Scope selector */}
              <div className="mb-2 flex flex-wrap gap-1">
                {SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewScope(opt.value)}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      newScope === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <NoteEditor
                initialContent=""
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
                autoFocus
              />
            </div>
          )}

          {/* Empty state */}
          {visibleNotes.length === 0 && !creating && (
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

          {visibleNotes.map((note, i) => (
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
