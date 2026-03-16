"use client";

import { useEffect, useRef } from "react";
import { debounce } from "@/lib/utils/debounce";

const SCROLL_KEY_PREFIX = "reader-scroll-";

export function useScrollRestoration(chapterSlug: string) {
  const savedByServer = useRef(false);

  // Restore scroll position from localStorage on mount
  useEffect(() => {
    if (savedByServer.current) return;
    const key = `${SCROLL_KEY_PREFIX}${chapterSlug}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const pct = parseFloat(saved);
      const el = document.documentElement;
      const scrollTop = pct * (el.scrollHeight - el.clientHeight);
      window.scrollTo({ top: scrollTop, behavior: "instant" });
    }
  }, [chapterSlug]);

  const savePosition = useRef(
    debounce((slug: string) => {
      const el = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
      localStorage.setItem(`${SCROLL_KEY_PREFIX}${slug}`, pct.toFixed(4));
    }, 300),
  ).current;

  useEffect(() => {
    const onScroll = () => savePosition(chapterSlug);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapterSlug, savePosition]);
}

export function getStoredScrollPosition(chapterSlug: string): number {
  if (typeof window === "undefined") return 0;
  const key = `${SCROLL_KEY_PREFIX}${chapterSlug}`;
  const saved = localStorage.getItem(key);
  return saved ? parseFloat(saved) : 0;
}
