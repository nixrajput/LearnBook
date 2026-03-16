"use client";

import { useEffect, useState, useRef } from "react";
import { debounce } from "@/lib/utils/debounce";

export function useReadingProgress(chapterId: string) {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const accumulatedRef = useRef(0);

  const updateServer = useRef(
    debounce(async (pct: number, chId: string) => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      accumulatedRef.current += elapsed;
      startTimeRef.current = Date.now();

      const completed = pct >= 0.95;
      try {
        await fetch(`/api/progress/${chId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scrollPosition: pct,
            completed,
            timeSpentSec: accumulatedRef.current,
          }),
        });
      } catch {
        // Silently fail – not critical
      }
    }, 2000),
  ).current;

  useEffect(() => {
    let container: HTMLElement | null = null;
    let rafId: number;
    let attempts = 0;

    const onScroll = () => {
      if (!container) return;
      const pct = container.scrollTop / (container.scrollHeight - container.clientHeight || 1);
      const clamped = Math.min(1, Math.max(0, pct));
      setProgress(clamped);
      updateServer(clamped, chapterId);
    };

    // Poll until the element is available (it's rendered by a sibling component)
    const attach = () => {
      container = document.getElementById("reader-scroll-area");
      if (container) {
        container.addEventListener("scroll", onScroll, { passive: true });
        return;
      }
      if (attempts++ < 20) {
        rafId = requestAnimationFrame(attach);
      }
    };

    rafId = requestAnimationFrame(attach);

    return () => {
      cancelAnimationFrame(rafId);
      container?.removeEventListener("scroll", onScroll);
    };
  }, [chapterId, updateServer]);

  return progress;
}
