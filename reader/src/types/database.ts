import type {
  Note,
  Bookmark,
  Highlight,
  ReadingProgress,
  UserPreference,
  Chapter,
  Section,
} from "@prisma/client";

export type { Note, Bookmark, Highlight, ReadingProgress, UserPreference };

export interface NoteWithChapter extends Note {
  chapter: Pick<Chapter, "id" | "title" | "slug" | "number">;
}

export interface BookmarkWithDetails extends Bookmark {
  chapter: Pick<Chapter, "id" | "title" | "slug" | "number">;
  section: Pick<Section, "id" | "heading" | "slug"> | null;
}

export interface HighlightWithChapter extends Highlight {
  chapter: Pick<Chapter, "id" | "title" | "slug" | "number">;
}

export interface NoteInput {
  chapterId: string;
  sectionSlug?: string;
  content: string;
}

export interface NoteUpdate {
  content: string;
}

export interface BookmarkInput {
  chapterId: string;
  sectionId?: string;
  label?: string;
}

export interface HighlightInput {
  chapterId: string;
  startOffset: number;
  endOffset: number;
  text: string;
  color?: "yellow" | "green" | "blue" | "pink";
  note?: string;
}

export interface ProgressUpdate {
  scrollPosition: number;
  completed?: boolean;
  timeSpentSec?: number;
}

export interface SearchResult {
  type: "chapter" | "section" | "note";
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  sectionSlug?: string;
  heading?: string;
  snippet: string;
}

export interface DashboardStats {
  totalChapters: number;
  completedChapters: number;
  completionPercentage: number;
  inProgressChapters: number;
  bookmarksCount: number;
  notesCount: number;
  currentStreak: number;
  longestStreak: number;
  lastReadChapter: { slug: string; number: number; title: string } | null;
  partProgress: Array<{
    partNumber: number;
    partTitle: string;
    total: number;
    completed: number;
  }>;
  recentNotes: NoteWithChapter[];
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  notes: Array<{
    chapterSlug: string;
    sectionSlug?: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>;
  bookmarks: Array<{
    chapterSlug: string;
    sectionSlug?: string | null;
    label?: string | null;
    createdAt: string;
  }>;
  highlights: Array<{
    chapterSlug: string;
    text: string;
    color: string;
    note?: string | null;
    startOffset: number;
    endOffset: number;
    createdAt: string;
  }>;
  progress: Array<{
    chapterSlug: string;
    scrollPosition: number;
    completed: boolean;
    completedAt?: string | null;
    timeSpentSec: number;
  }>;
  preferences: {
    theme: string;
    fontSize: number;
    lineWidth: string;
    fontFamily: string;
    showLineNumbers: boolean;
  };
}
