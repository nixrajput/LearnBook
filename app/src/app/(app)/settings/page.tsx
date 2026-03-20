import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { LocaleForm } from "@/components/settings/locale-form";
import { ExportImport } from "@/components/settings/export-import";
import { Separator } from "@/components/ui/separator";
import { requireSession } from "@/lib/auth/session";
import { ModelSelector } from "@/components/ai/model-selector";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireSession();
  const [prefs, dbUser] = await Promise.all([
    db.userPreference.findUnique({ where: { userId: user.id } }),
    db.user.findUnique({
      where: { id: user.id },
      select: { locale: true, primaryLanguage: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">Language & Region</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Set your preferred locale for formatting and language for the UI.
        </p>
        <LocaleForm
          initialLocale={dbUser?.locale ?? "en-US"}
          initialLanguage={dbUser?.primaryLanguage ?? "en"}
        />
      </section>

      <Separator className="my-8" />

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">AI Preferences</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose your preferred AI model. Higher-tier models use more credits per action.
        </p>
        <ModelSelector />
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
