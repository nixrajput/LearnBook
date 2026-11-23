"use client";

import { useEffect, useRef } from "react";
import { debounce } from "@/lib/utils/debounce";

const SCROLL_KEY_PREFIX = "reader-scroll-";

export function useScrollRestoration(chapterSlug: string) {
  // Restore scroll position from localStorage on mount
  useEffect(() => {
    const key = `${SCROLL_KEY_PREFIX}${chapterSlug}`;
    const saved = localStorage.getItem(key);
    if (!saved) return;

    const pct = parseFloat(saved);
    let rafId: number;
    let attempts = 0;

    const tryRestore = () => {
      const container = document.getElementById("reader-scroll-area");
      if (container) {
        const scrollTop = pct * (container.scrollHeight - container.clientHeight);
        container.scrollTo({ top: scrollTop, behavior: "instant" });
      } else if (attempts++ < 20) {
        rafId = requestAnimationFrame(tryRestore);
      }
    };

    rafId = requestAnimationFrame(tryRestore);
    return () => cancelAnimationFrame(rafId);
  }, [chapterSlug]);

  const savePosition = useRef(
    debounce((slug: string) => {
      const container = document.getElementById("reader-scroll-area");
      if (!container) return;
      const pct = container.scrollTop / (container.scrollHeight - container.clientHeight || 1);
      localStorage.setItem(`${SCROLL_KEY_PREFIX}${slug}`, pct.toFixed(4));
    }, 300),
  ).current;

  useEffect(() => {
    let container: HTMLElement | null = null;
    let rafId: number;
    let attempts = 0;

    const onScroll = () => savePosition(chapterSlug);

    const attach = () => {
      container = document.getElementById("reader-scroll-area");
      if (container) {
        container.addEventListener("scroll", onScroll, { passive: true });
      } else if (attempts++ < 20) {
        rafId = requestAnimationFrame(attach);
      }
    };

    rafId = requestAnimationFrame(attach);
    return () => {
      cancelAnimationFrame(rafId);
      container?.removeEventListener("scroll", onScroll);
    };
  }, [chapterSlug, savePosition]);
}

export function getStoredScrollPosition(chapterSlug: string): number {
  if (typeof window === "undefined") return 0;
  const key = `${SCROLL_KEY_PREFIX}${chapterSlug}`;
  const saved = localStorage.getItem(key);
  return saved ? parseFloat(saved) : 0;
}
