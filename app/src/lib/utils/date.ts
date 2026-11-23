import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: Date | string, locale: string = "en-US"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
