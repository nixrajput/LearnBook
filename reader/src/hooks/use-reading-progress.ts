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
    const onScroll = () => {
      const el = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
      const clamped = Math.min(1, Math.max(0, pct));
      setProgress(clamped);
      updateServer(clamped, chapterId);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapterId, updateServer]);

  return progress;
}
