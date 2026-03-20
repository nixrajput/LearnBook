"use client";

import { useEffect, useState, useRef } from "react";
import { debounce } from "@/lib/utils/debounce";

export function useReadingProgress(chapterId: string, courseId?: string, wordCount?: number) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const accumulatedRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  const updateServer = useRef(
    debounce(async (pct: number, chId: string) => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = Date.now();

      // Send only the delta since last update, not accumulated total
      if (elapsed <= 0) return;
      accumulatedRef.current += elapsed;

      const completed = pct >= 0.95;
      try {
        await fetch(`/api/progress/${chId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scrollPosition: pct,
            completed,
            timeSpentSec: elapsed,
          }),
        });
      } catch {
        // Silently fail – not critical
      }
    }, 2000),
  ).current;

  // Start a reading session on mount, end on unmount
  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    async function startSession() {
      try {
        const res = await fetch("/api/sessions/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start", courseId, chapterId }),
        });
        const data = await res.json();
        if (!cancelled && data.sessionId) {
          sessionIdRef.current = data.sessionId;
        }
      } catch {
        // Not critical
      }
    }

    startSession();

    return () => {
      cancelled = true;
      // End session on unmount — read from ref for current progress value
      if (sessionIdRef.current) {
        const wordsEstimate = wordCount ? Math.round(progressRef.current * wordCount) : 0;
        const payload = JSON.stringify({
          action: "end",
          sessionId: sessionIdRef.current,
          wordsRead: wordsEstimate,
        });
        // Use Blob with application/json so sendBeacon sets the correct Content-Type
        const blob = new Blob([payload], { type: "application/json" });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/sessions/reading", blob);
        } else {
          fetch("/api/sessions/reading", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
        sessionIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, courseId]);

  useEffect(() => {
    let container: HTMLElement | null = null;
    let rafId: number;
    let attempts = 0;

    const onScroll = () => {
      if (!container) return;
      const pct = container.scrollTop / (container.scrollHeight - container.clientHeight || 1);
      const clamped = Math.min(1, Math.max(0, pct));
      progressRef.current = clamped;
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
