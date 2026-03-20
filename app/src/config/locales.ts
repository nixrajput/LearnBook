export interface LocaleConfig {
  code: string;
  label: string;
  language: string;
  region: string;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: "en-US", label: "English (US)", language: "en", region: "US" },
  { code: "en-IN", label: "English (India)", language: "en", region: "IN" },
  { code: "en-GB", label: "English (UK)", language: "en", region: "GB" },
  { code: "hi-IN", label: "Hindi (India)", language: "hi", region: "IN" },
];

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "Hindi", short: "HI" },
];

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_LANGUAGE = "en";
