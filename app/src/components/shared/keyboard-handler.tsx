"use client";

import { useRouter } from "next/navigation";
import { useReaderStore } from "@/stores/reader-store";
import { useSearchStore } from "@/stores/search-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardHandlerProps {
  prevChapterSlug?: string;
  nextChapterSlug?: string;
}

export function KeyboardHandler({ prevChapterSlug, nextChapterSlug }: KeyboardHandlerProps) {
  const router = useRouter();
  const { toggleSidebar, toggleToc, toggleNotesPanel } = useReaderStore();
  const setSearchOpen = useSearchStore((s) => s.setOpen);

  useKeyboardShortcuts([
    { key: "k", meta: true, handler: () => setSearchOpen(true) },
    { key: "k", ctrl: true, handler: () => setSearchOpen(true) },
    { key: "j", handler: () => nextChapterSlug && router.push(`/course/${nextChapterSlug}`) },
    { key: "k", handler: () => prevChapterSlug && router.push(`/course/${prevChapterSlug}`) },
    { key: "n", handler: () => toggleNotesPanel() },
    { key: "[", handler: () => toggleSidebar() },
    { key: "]", handler: () => toggleToc() },
  ]);

  return null;
}
