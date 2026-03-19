"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LOCALES, SUPPORTED_LANGUAGES } from "@/config/locales";

interface LocaleFormProps {
  initialLocale: string;
  initialLanguage: string;
}

export function LocaleForm({ initialLocale, initialLanguage }: LocaleFormProps) {
  const [locale, setLocale] = useState(initialLocale);
  const [language, setLanguage] = useState(initialLanguage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = locale !== initialLocale || language !== initialLanguage;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/user/locale", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, primaryLanguage: language }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="locale" className="mb-1.5 block text-sm font-medium">
            Locale
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Controls date, number, and currency formatting.
          </p>
          <select
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="language" className="mb-1.5 block text-sm font-medium">
            Language
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Primary UI language (translations coming soon).
          </p>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? "Saving..." : "Save"}
        </Button>
        {saved && <span className="text-xs text-emerald-600">Saved</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
