"use client";

import { useEffect, useRef, useCallback } from "react";
import { debounce } from "@/lib/utils/debounce";

export function useAutosave(value: string, onSave: (value: string) => Promise<void>, delay = 1500) {
  const savedRef = useRef(value);
  const saving = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (v: string) => {
      if (v === savedRef.current || saving.current) return;
      saving.current = true;
      try {
        await onSave(v);
        savedRef.current = v;
      } finally {
        saving.current = false;
      }
    }, delay),
    [onSave, delay],
  );

  useEffect(() => {
    if (value !== savedRef.current) {
      debouncedSave(value);
    }
  }, [value, debouncedSave]);
}
