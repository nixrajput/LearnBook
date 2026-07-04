export interface ParsedPart {
  number: number;
  romanNumeral: string;
  title: string;
  chapters: ParsedChapter[];
}

export interface ParsedChapter {
  number: number;
  title: string;
  slug: string;
  rawContent: string;
  wordCount: number;
  readingTimeMin: number;
  sections: ParsedSection[];
}

export interface ParsedSection {
  heading: string;
  slug: string;
  level: number;
  content: string;
  sortOrder: number;
}

export interface ChapterNavItem {
  slug: string;
  number: number;
  title: string;
  partNumber: number;
}

export interface SectionSummary {
  heading: string;
  slug: string;
  level: number;
  sortOrder: number;
}

export interface ChapterWithProgress {
  id: string;
  number: number;
  title: string;
  slug: string;
  partId: string;
  partNumber: number;
  partTitle: string;
  wordCount: number;
  readingTimeMin: number;
  progress: {
    scrollPosition: number;
    completed: boolean;
    lastReadAt: Date | null;
  } | null;
  bookmarkCount: number;
  noteCount: number;
}

export interface ChapterDetail {
  id: string;
  number: number;
  title: string;
  slug: string;
  partNumber: number;
  partTitle: string;
  wordCount: number;
  readingTimeMin: number;
  rawContent: string;
  sections: SectionSummary[];
  prevChapter: ChapterNavItem | null;
  nextChapter: ChapterNavItem | null;
  progress: {
    scrollPosition: number;
    completed: boolean;
    lastReadAt: Date | null;
  } | null;
}

export interface PartWithChapters {
  id: string;
  number: number;
  romanNumeral: string;
  title: string;
  chapters: ChapterWithProgress[];
  completedCount: number;
  totalCount: number;
}
