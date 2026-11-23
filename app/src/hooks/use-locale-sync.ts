"use client";

import { useEffect, useRef } from "react";
import {
  SUPPORTED_LOCALES,
  SUPPORTED_LANGUAGES,
  DEFAULT_LOCALE,
  DEFAULT_LANGUAGE,
} from "@/config/locales";

/**
 * On first load after registration, detects the browser's locale and language
 * and syncs to the server if the user has never set them (null).
 * Runs only once per session.
 */
export function useLocaleSync(currentLocale: string | null, currentLanguage: string | null) {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    // Only auto-detect if user has never set locale (null = never configured)
    if (currentLocale !== null || currentLanguage !== null) return;

    synced.current = true;

    const browserLocale = navigator.language; // e.g. "en-IN", "hi-IN", "en-US"
    const browserLang = browserLocale.split("-")[0]; // e.g. "en", "hi"

    // Find best matching supported locale
    const exactMatch = SUPPORTED_LOCALES.find((l) => l.code === browserLocale);
    const langMatch = !exactMatch
      ? SUPPORTED_LOCALES.find((l) => l.language === browserLang)
      : null;
    const detectedLocale = exactMatch?.code ?? langMatch?.code ?? DEFAULT_LOCALE;
    const detectedLang =
      SUPPORTED_LANGUAGES.find((l) => l.code === browserLang)?.code ?? DEFAULT_LANGUAGE;

    fetch("/api/user/locale", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: detectedLocale, primaryLanguage: detectedLang }),
    }).catch(() => {
      // Silent fail — not critical
    });
  }, [currentLocale, currentLanguage]);
}
