"use client";

import { useEffect, useRef, useCallback } from "react";

interface ParallaxProps {
  children: React.ReactNode;
  /** How much the element moves relative to scroll (0.1 = subtle, 0.5 = strong) */
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.3, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Progress: -1 when element is below viewport, 0 when centered, +1 when above
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const progress = (viewportCenter - elementCenter) / viewportHeight;

    // Apply parallax offset
    const offset = progress * speed * 150;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  }, [speed]);

  useEffect(() => {
    function onScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial position
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
