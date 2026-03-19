"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateCardModalProps {
  deckId: string;
  onCreated: () => void;
}

export function CreateCardModal({ deckId, onCreated }: CreateCardModalProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, front, back }),
      });
      if (res.ok) {
        setFront("");
        setBack("");
        setOpen(false);
        onCreated();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create card");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Add Card
      </Button>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">New Flashcard</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Front (Question)</Label>
          <Textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="What is..."
          />
        </div>
        <div>
          <Label className="text-xs">Back (Answer)</Label>
          <Textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="The answer is..."
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button size="sm" onClick={handleCreate} disabled={saving || !front.trim() || !back.trim()}>
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Create Card
        </Button>
      </div>
    </div>
  );
}
