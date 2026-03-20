import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { LocaleForm } from "@/components/settings/locale-form";
import { ExportImport } from "@/components/settings/export-import";
import { Separator } from "@/components/ui/separator";
import { requireSession } from "@/lib/auth/session";
import { ModelSelector } from "@/components/ai/model-selector";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireSession();
  const t = await getTranslations("settings");
  const [prefs, dbUser] = await Promise.all([
    db.userPreference.findUnique({ where: { userId: user.id } }),
    db.user.findUnique({
      where: { id: user.id },
      select: { locale: true, primaryLanguage: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">{t("readerPreferences")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("readerDescription")}</p>
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
        <h2 className="mb-1 text-lg font-semibold">{t("languageRegion")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("languageDescription")}</p>
        <LocaleForm
          initialLocale={dbUser?.locale ?? "en-US"}
          initialLanguage={dbUser?.primaryLanguage ?? "en"}
        />
      </section>

      <Separator className="my-8" />

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">{t("aiPreferences")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("aiDescription")}</p>
        <ModelSelector />
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="mb-1 text-lg font-semibold">{t("exportImport")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("exportDescription")}</p>
        <ExportImport />
      </section>
    </div>
  );
}
