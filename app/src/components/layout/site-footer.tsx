"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{tCommon("appName")}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              {t("pricing")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {t("terms")}
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href="/status" className="transition-colors hover:text-foreground">
              {t("status")}
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t pt-6 text-center text-xs text-muted-foreground">
          {tCommon("allRightsReserved", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
