"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ReaderPreferences } from "@/types/preferences";

interface PreferencesFormProps {
  initialPrefs: ReaderPreferences;
}

export function PreferencesForm({ initialPrefs }: PreferencesFormProps) {
  const { setTheme } = useTheme();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updatePref = <K extends keyof ReaderPreferences>(key: K, value: ReaderPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      setTheme(prefs.theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-2">
        <Label>Theme</Label>
        <Select
          value={prefs.theme}
          onValueChange={(v) => updatePref("theme", v as "light" | "dark" | "system")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Font size</Label>
          <span className="text-sm text-muted-foreground">{prefs.fontSize}px</span>
        </div>
        <Slider
          min={13}
          max={22}
          step={1}
          value={[prefs.fontSize]}
          onValueChange={([v]) => updatePref("fontSize", v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Small</span>
          <span>Large</span>
        </div>
      </div>

      {/* Line width */}
      <div className="space-y-2">
        <Label>Reading width</Label>
        <Select
          value={prefs.lineWidth}
          onValueChange={(v) => updatePref("lineWidth", v as "sm" | "md" | "lg" | "xl")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Narrow (600px)</SelectItem>
            <SelectItem value="md">Medium (720px)</SelectItem>
            <SelectItem value="lg">Wide (860px)</SelectItem>
            <SelectItem value="xl">Full (1000px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font family */}
      <div className="space-y-2">
        <Label>Font family</Label>
        <Select
          value={prefs.fontFamily}
          onValueChange={(v) => updatePref("fontFamily", v as "sans" | "serif" | "mono")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans">Sans-serif</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="mono">Monospace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show line numbers */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Show line numbers in code</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Display line numbers in code blocks
          </p>
        </div>
        <Switch
          checked={prefs.showLineNumbers}
          onCheckedChange={(v) => updatePref("showLineNumbers", v)}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved!" : "Save preferences"}
      </Button>
    </div>
  );
}
