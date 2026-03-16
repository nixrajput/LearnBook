# LearnBook — Reader App

A production-quality personal learning app for reading, annotating, and tracking progress through study notes. Supports multiple courses — notes, bookmarks, and progress are stored per-course and visible across all courses.

## Features

- **Multi-course dashboard** — stats and progress for the active course, all seeded courses listed with completion %
- **Docs-style reader** — chapter sidebar, nested table of contents, reading progress bar
- **Notes panel** — per-chapter notes with autosave, edit, delete; browsable across all courses
- **Bookmarks** — save any chapter or section; all bookmarks grouped by course
- **Search** — full-text search across chapters, sections, and personal notes (⌘K)
- **Reading progress** — scroll position saved per chapter, restored on return
- **Export / Import** — portable JSON backup of all notes, bookmarks, highlights, and progress
- **Reader settings** — font size, line width, font family, light/dark/system theme
- **Keyboard navigation** — `j`/`k` next/prev chapter, `n` notes, `[`/`]` sidebars, `⌘K` search
- **Responsive** — desktop split-view, mobile-friendly layouts

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS + shadcn/ui |
| Fonts | Inter (UI) + JetBrains Mono (code) |
| Content | MDX via `next-mdx-remote/rsc` |
| Database | SQLite via Prisma |
| Client state | Zustand |
| Theme | next-themes |
| Validation | Zod |
| Tests | Vitest |

## Setup

```bash
# From the repo root:
npm install
npm run db:push
npm run db:seed
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path (default: `file:./dev.db`) |
| `NOTES_PATH` | Path to the notes collection to seed, relative to `reader/` |

## Available scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run db:seed` | Parse markdown and seed the database |
| `npm run db:reset` | Wipe and re-seed |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run tests (Vitest) |

## Project structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── page.tsx          # Dashboard (/)
│   ├── course/           # Course overview (/course) and reader (/course/[slug])
│   ├── notes/            # Notes across all courses (/notes)
│   ├── bookmarks/        # Bookmarks across all courses (/bookmarks)
│   ├── settings/         # Reader preferences (/settings)
│   └── api/              # REST API routes
├── components/
│   ├── ui/               # Primitive UI components
│   ├── layout/           # App shell, nav, mobile nav
│   ├── reader/           # Chapter sidebar, content, TOC, toolbar
│   ├── notes/            # Notes panel, editor, card
│   ├── search/           # Search dialog
│   ├── settings/         # Preferences form, export/import
│   └── shared/           # Theme provider, keyboard handler, MDX components
├── lib/
│   ├── content/          # Markdown parser and DB content queries
│   ├── validators/       # Zod schemas
│   └── utils/            # cn, slugify, debounce, date helpers
├── stores/               # Zustand stores
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── config/               # Site config, nav items, keyboard shortcuts

prisma/
├── schema.prisma         # Database schema (multi-course)
└── seed.ts               # Content ingestion script
```

## Data model

```
Course → Part → Chapter → Section
                Chapter → ReadingProgress
                Chapter → Bookmark        (scoped per course)
                Chapter → Note            (scoped per course)
                Chapter → Highlight       (scoped per course)
                Course  → ReadingStreak   (daily activity per course)
UserPreference  (single row, id="default")
```

## Architecture notes

### Multi-course support

All user data (notes, bookmarks, highlights, progress, streaks) is scoped by `courseId`. Seeding a new course with a different `NOTES_PATH` adds it to the DB without touching existing data. The Notes and Bookmarks pages show data across all courses, grouped by course.

### Server vs client components

- All pages are **server components** — data is fetched directly from Prisma with no API overhead.
- Client components are scoped to interactive features: reader toolbar, notes panel, progress bar, search dialog, keyboard handler, scroll restoration, preferences form.
- MDX content is rendered server-side — zero client JS for content.

### Reading progress flow

1. `ReadingProgressBar` listens to scroll events and updates the progress bar.
2. `useReadingProgress` debounces a `PUT /api/progress/[chapterId]` call every 2 seconds.
3. `useScrollRestoration` saves scroll position to `localStorage` (debounced 300ms) and restores on mount.
4. The server records `scrollPosition` (0.0–1.0) and marks `completed = true` when ≥ 95% scrolled.

### Adding auth later

Every API route treats `userId = "default"` implicitly. To add auth:
1. Add a `User` model and `userId` to all user-owned tables.
2. Add auth middleware (Next-Auth or Clerk).
3. Replace `"default"` with `session.userId` in `src/app/api/`.
