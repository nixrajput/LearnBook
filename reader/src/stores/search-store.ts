"use client";

import { create } from "zustand";
import type { SearchResult } from "@/types/database";

interface SearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  setOpen: (open: boolean) => void;
  setQuery: (q: string) => void;
  setResults: (results: SearchResult[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  isOpen: false,
  query: "",
  results: [],
  isLoading: false,
  setOpen: (open) => set({ isOpen: open }),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
}));
