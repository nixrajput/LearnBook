"use client";

import { useScrollRestoration } from "@/hooks/use-scroll-position";

export function ScrollRestoration({ chapterSlug }: { chapterSlug: string }) {
  useScrollRestoration(chapterSlug);
  return null;
}
