import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { ExportImport } from "@/components/settings/export-import";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const prefs = await db.userPreference.findUnique({ where: { id: "default" } });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">Reader preferences</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Adjust font size, line width, and font family for a comfortable reading experience.
        </p>
        <PreferencesForm
          initialPrefs={{
            theme: (prefs?.theme ?? "system") as "light" | "dark" | "system",
            fontSize: prefs?.fontSize ?? 16,
            lineWidth: (prefs?.lineWidth ?? "md") as "sm" | "md" | "lg" | "xl",
            fontFamily: (prefs?.fontFamily ?? "sans") as "sans" | "serif" | "mono",
            showLineNumbers: prefs?.showLineNumbers ?? true,
          }}
        />
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="mb-1 text-lg font-semibold">Export / Import</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Export your notes, bookmarks, and progress as JSON. Import them back anytime.
        </p>
        <ExportImport />
      </section>
    </div>
  );
}
