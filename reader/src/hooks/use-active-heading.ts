"use client";

import { useEffect } from "react";
import { useReaderStore } from "@/stores/reader-store";

export function useActiveHeading(sectionSlugs: string[]) {
  const setActiveHeading = useReaderStore((s) => s.setActiveHeading);

  useEffect(() => {
    if (sectionSlugs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    const elements: Element[] = [];
    for (const slug of sectionSlugs) {
      const el = document.getElementById(slug);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      for (const el of elements) observer.unobserve(el);
      observer.disconnect();
    };
  }, [sectionSlugs, setActiveHeading]);
}
