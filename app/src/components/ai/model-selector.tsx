"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ModelOption {
  id: string;
  name: string;
  tier?: string;
  multiplier?: number;
}

export function ModelSelector() {
  const [selected, setSelected] = useState("auto");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/preferences")
      .then((r) => r.json())
      .then((d) => {
        setSelected(d.selectedModel ?? "auto");
        setModels(d.availableModels ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(modelId: string) {
    setSelected(modelId);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModel: modelId }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading AI preferences...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">AI Model</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSave(m.id)}
            disabled={saving}
            className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-all duration-200 ${
              selected === m.id
                ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                : "hover:border-muted-foreground/30 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {m.id === "auto" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              <span className="font-medium">{m.name}</span>
            </div>
            {m.multiplier && m.multiplier > 1 && (
              <span className="text-[10px] text-muted-foreground">{m.multiplier}x credits</span>
            )}
          </button>
        ))}
      </div>
      {saved && <p className="text-xs text-emerald-600 dark:text-emerald-400">Preference saved</p>}
    </div>
  );
}
