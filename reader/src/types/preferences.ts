export interface ReaderPreferences {
  theme: "light" | "dark" | "system";
  fontSize: number;
  lineWidth: "sm" | "md" | "lg" | "xl";
  fontFamily: "sans" | "serif" | "mono";
  showLineNumbers: boolean;
}

export const LINE_WIDTH_MAP: Record<string, string> = {
  sm: "max-w-[600px]",
  md: "max-w-[720px]",
  lg: "max-w-[860px]",
  xl: "max-w-[1000px]",
};

export const FONT_FAMILY_MAP: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: "system",
  fontSize: 16,
  lineWidth: "md",
  fontFamily: "sans",
  showLineNumbers: true,
};
