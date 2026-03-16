# LearnBook

A self-hosted, personal learning app for reading, annotating, and tracking progress through structured study notes — with support for multiple courses.

Built with **Next.js 16**, **React 19**, **SQLite + Prisma**, and **Tailwind CSS**.

---

## Table of Contents

- [LearnBook](#learnbook)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
    - [App directories](#app-directories)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
    - [Running the App](#running-the-app)
  - [Course Collections](#course-collections)
    - [Directory Layout](#directory-layout)
    - [manifest.json Schema](#manifestjson-schema)
    - [Markdown Format](#markdown-format)
    - [Adding a New Course](#adding-a-new-course)
    - [Switching the Active Course](#switching-the-active-course)
  - [Available Scripts](#available-scripts)
  - [Architecture](#architecture)
    - [Multi-Course Support](#multi-course-support)
    - [Data Model](#data-model)
    - [Server vs Client Components](#server-vs-client-components)
    - [Active Course Resolution](#active-course-resolution)
    - [Adding Authentication](#adding-authentication)
  - [Contributing](#contributing)
  - [Security](#security)
  - [License](#license)

---

## Overview

LearnBook turns plain Markdown files into a full reading experience: a docs-style chapter reader with sidebar navigation, per-chapter notes and bookmarks, reading progress tracking, full-text search, and an analytics dashboard — all stored locally in SQLite.

It is intentionally **self-hosted and single-user**. There is no auth, no cloud sync, and no third-party telemetry.

---

## Features

| Feature                    | Description                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Multi-course dashboard** | Analytics, streak tracking, and progress for the active course                        |
| **Courses library**        | Browse all seeded courses, switch active course from the UI                           |
| **Docs-style reader**      | Chapter sidebar, nested table of contents, reading progress bar                       |
| **Notes panel**            | Per-chapter notes with autosave, edit, and delete                                     |
| **Bookmarks**              | Save any chapter or section; browsable across all courses                             |
| **Full-text search**       | Searches chapters, sections, and personal notes (`⌘K`)                                |
| **Reading progress**       | Scroll position saved per chapter, restored on return                                 |
| **Advanced analytics**     | Activity heatmap, reading velocity, day-of-week chart, streak stats                   |
| **Export / Import**        | Portable JSON backup of all notes, bookmarks, highlights, and progress                |
| **Reader settings**        | Font size, line width, font family, light/dark/system theme                           |
| **Keyboard shortcuts**     | `j`/`k` next/prev chapter · `n` notes · `b` bookmark · `[`/`]` sidebars · `⌘K` search |
| **Responsive**             | Desktop split-view, mobile-friendly layouts                                           |

---

## Tech Stack

| Layer        | Technology                                                |
| ------------ | --------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)                        |
| UI           | React 19 + Tailwind CSS + shadcn/ui (Radix UI)            |
| Fonts        | Inter (UI) · JetBrains Mono (code blocks)                 |
| Content      | MDX via `next-mdx-remote/rsc` + Shiki syntax highlighting |
| Database     | SQLite via Prisma ORM                                     |
| Client state | Zustand                                                   |
| Theme        | next-themes                                               |
| Validation   | Zod                                                       |
| Tests        | Vitest                                                    |

---

## Project Structure

```
learnbook/
├── courses/                  # Course content collections (one folder per course)
│   └── <collection-id>/
│       ├── manifest.json     # Course metadata
│       └── <entryFile>.md    # Course content (Markdown)
├── reader/                   # Next.js application
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Content ingestion script
│   └── src/
│       ├── app/              # Next.js App Router pages and API routes
│       ├── components/       # React components
│       ├── lib/              # Utilities, DB client, content parser
│       ├── stores/           # Zustand client state
│       ├── hooks/            # Custom React hooks
│       ├── types/            # TypeScript types
│       └── config/           # Site config, nav items, keyboard shortcuts
├── package.json              # Root workspace (npm workspaces)
└── README.md
```

### App directories

```
src/app/
├── page.tsx                  # Dashboard (/)
├── courses/                  # Courses library (/courses) and detail (/courses/[id])
├── course/[slug]/            # Chapter reader (/course/[slug])
├── notes/                    # Notes across all courses (/notes)
├── bookmarks/                # Bookmarks across all courses (/bookmarks)
├── settings/                 # Reader preferences (/settings)
└── api/                      # REST API routes
    ├── courses/              # GET /api/courses · POST /api/courses/[id]/activate
    ├── notes/                # CRUD for notes
    ├── bookmarks/            # CRUD for bookmarks
    ├── highlights/           # CRUD for highlights
    ├── progress/             # Reading progress updates
    ├── search/               # Full-text search
    ├── preferences/          # User preferences
    ├── export/               # Data export (JSON)
    └── import/               # Data import (JSON)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.9.0
- **npm** ≥ 10

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/learnbook.git
cd learnbook

# Install all dependencies
# (root workspace installs packages for all workspaces)
npm install
```

### Environment Variables

Copy the example file:

```bash
cp reader/.env.example reader/.env
```

| Variable       | Required        | Default         | Description                                                                                      |
| -------------- | --------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL` | Yes             | `file:./dev.db` | SQLite database path, relative to `reader/`                                                      |
| `NOTES_PATH`   | Seed-time only  | —               | Path to the course collection to seed, relative to `reader/` (e.g. `../courses/my-course`). Not used at runtime — the active course is stored in the database. |

> **Note:** Once at least one course is seeded, `NOTES_PATH` is not required to run the app. The active course is stored in `UserPreference.activeCourseId` and can be changed from the `/courses` page.

### Database Setup

```bash
# Push the Prisma schema to SQLite (creates reader/prisma/dev.db)
npm run db:push

# Parse the course at NOTES_PATH and seed the database
npm run db:seed
```

### Running the App

```bash
npm run dev
# → http://localhost:3000
```

---

## Course Collections

### Directory Layout

Each folder under `courses/` is a self-contained course collection:

```
courses/
└── <collection-id>/
    ├── manifest.json      # Required — course metadata
    └── <entryFile>.md     # Required — course content in Markdown
```

### manifest.json Schema

```json
{
  "id": "my-course",
  "title": "My Course Title",
  "description": "A short one-line description.",
  "entryFile": "my_course_notes.md",
  "version": "1.0.0"
}
```

| Field         | Type     | Description                                          |
| ------------- | -------- | ---------------------------------------------------- |
| `id`          | `string` | Unique identifier — used as the database primary key |
| `title`       | `string` | Display name shown in the UI                         |
| `description` | `string` | Short description shown on the courses page          |
| `entryFile`   | `string` | Filename of the Markdown file inside this folder     |
| `version`     | `string` | Arbitrary version string (informational only)        |

### Markdown Format

The content parser expects a specific heading hierarchy:

```markdown
# Part I - Part Title

## Chapter 1 - Chapter Title

### Section Heading

Content here...

#### Sub-section Heading

More content...
```

- `# Part [ROMAN] - Title` — creates a Part (supports I–X)
- `## Chapter [N] - Title` — creates a Chapter inside the current Part
- `###` / `####` — creates Sections shown in the Table of Contents sidebar

### Adding a New Course

1. Create `courses/<your-collection>/manifest.json` and the Markdown file.
2. Update `NOTES_PATH` in `reader/.env`:
   ```bash
   NOTES_PATH="../courses/<your-collection>"
   ```
3. Run the seed script:
   ```bash
   npm run db:seed
   ```
   Courses accumulate in the database — existing notes, bookmarks, and progress are never overwritten.

### Switching the Active Course

Visit `/courses` in the running app and click **Set active** on any seeded course.

The active course is stored in `UserPreference.activeCourseId` in the database. No `.env` edit or server restart is needed.

---

## Available Scripts

All scripts run from the **repo root**:

| Script                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start the development server (Turbopack, port 3000) |
| `npm run build`        | Production build                                    |
| `npm run lint`         | Run ESLint across `src/`                            |
| `npm run lint:fix`     | Auto-fix ESLint issues                              |
| `npm run format`       | Format all files with Prettier                      |
| `npm run format:check` | Check formatting without writing changes            |
| `npm run db:push`      | Push Prisma schema changes to the SQLite database   |
| `npm run db:seed`      | Parse `NOTES_PATH` and seed the database            |
| `npm run db:reset`     | Wipe all data and re-seed from `NOTES_PATH`         |
| `npm run db:studio`    | Open Prisma Studio (visual database browser)        |
| `npm test`             | Run Vitest unit tests                               |

---

## Architecture

### Multi-Course Support

All user data (notes, bookmarks, highlights, reading progress, streaks) is scoped by `courseId`. Seeding a new course adds it to the database without touching existing data. The Notes and Bookmarks pages aggregate data across all courses, grouped by course.

### Data Model

```
Course
  └── Part
        └── Chapter
              ├── Section
              ├── ReadingProgress   (scroll position, completion %, time spent)
              ├── Bookmark          (optional section-level)
              ├── Note
              └── Highlight         (text selection with colour)

Course → ReadingStreak              (daily reading activity per course)
UserPreference                      (singleton row: theme, font, activeCourseId, …)
```

### Server vs Client Components

- All **pages** are server components — data is fetched directly from Prisma with no API overhead.
- **Client components** are scoped to interactive features: reader toolbar, notes panel, progress bar, search dialog, keyboard handler, scroll restoration, preferences form, and the "Set active" course button.
- MDX content is rendered server-side — zero client JS for content.

### Active Course Resolution

`getActiveCourseId()` resolves in this order:

1. `UserPreference.activeCourseId` from the database (set via the `/courses` UI).
2. First course alphabetically in the database (fallback).

### Adding Authentication

Every API route uses `userId = "default"` implicitly. To add multi-user auth:

1. Add a `User` model and `userId` foreign key to all user-owned tables.
2. Add auth middleware (e.g. NextAuth or Clerk).
3. Replace `"default"` with `session.userId` in each `src/app/api/` route handler.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## Security

Please read [SECURITY.md](SECURITY.md) for the responsible disclosure policy.

---

## License

Released under the [MIT License](LICENSE). Copyright © 2023 Nikhil Rajput.
