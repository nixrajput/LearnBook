"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReaderState {
  sidebarOpen: boolean;
  tocOpen: boolean;
  notesPanelOpen: boolean;
  activeHeadingSlug: string;
  setSidebarOpen: (open: boolean) => void;
  setTocOpen: (open: boolean) => void;
  setNotesPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleToc: () => void;
  toggleNotesPanel: () => void;
  setActiveHeading: (slug: string) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      tocOpen: true,
      notesPanelOpen: false,
      activeHeadingSlug: "",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTocOpen: (open) => set({ tocOpen: open }),
      setNotesPanelOpen: (open) => set({ notesPanelOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleToc: () => set((s) => ({ tocOpen: !s.tocOpen })),
      toggleNotesPanel: () => set((s) => ({ notesPanelOpen: !s.notesPanelOpen })),
      setActiveHeading: (slug) => set({ activeHeadingSlug: slug }),
    }),
    {
      name: "reader-ui-state",
      partialize: (s) => ({
        sidebarOpen: s.sidebarOpen,
        tocOpen: s.tocOpen,
      }),
    },
  ),
);
