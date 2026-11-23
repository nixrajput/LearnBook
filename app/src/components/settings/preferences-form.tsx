"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
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
        <Label>{t("theme")}</Label>
        <Select
          value={prefs.theme}
          onValueChange={(v) => updatePref("theme", v as "light" | "dark" | "system")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t("themeLight")}</SelectItem>
            <SelectItem value="dark">{t("themeDark")}</SelectItem>
            <SelectItem value="system">{t("themeSystem")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("fontSize")}</Label>
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
          <span>{t("fontSizeSmall")}</span>
          <span>{t("fontSizeLarge")}</span>
        </div>
      </div>

      {/* Line width */}
      <div className="space-y-2">
        <Label>{t("readingWidth")}</Label>
        <Select
          value={prefs.lineWidth}
          onValueChange={(v) => updatePref("lineWidth", v as "sm" | "md" | "lg" | "xl")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">{t("widthNarrow")}</SelectItem>
            <SelectItem value="md">{t("widthMedium")}</SelectItem>
            <SelectItem value="lg">{t("widthWide")}</SelectItem>
            <SelectItem value="xl">{t("widthFull")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font family */}
      <div className="space-y-2">
        <Label>{t("fontFamily")}</Label>
        <Select
          value={prefs.fontFamily}
          onValueChange={(v) => updatePref("fontFamily", v as "sans" | "serif" | "mono")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans">{t("fontSans")}</SelectItem>
            <SelectItem value="serif">{t("fontSerif")}</SelectItem>
            <SelectItem value="mono">{t("fontMono")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show line numbers */}
      <div className="flex items-center justify-between">
        <div>
          <Label>{t("showLineNumbers")}</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("showLineNumbersDesc")}</p>
        </div>
        <Switch
          checked={prefs.showLineNumbers}
          onCheckedChange={(v) => updatePref("showLineNumbers", v)}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? tCommon("saving") : saved ? t("savedBang") : t("savePreferences")}
      </Button>
    </div>
  );
}
