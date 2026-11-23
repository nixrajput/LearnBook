<h1 align="center">
  <br>
  <a href="https://github.com/nixrajput/LearnBook"><img src="app/src/app/icon.svg" alt="LearnBook" width="48"></a>
  <br>
  LearnBook
  <br>
</h1>

<p align="center">
  <strong>The open-source learning platform that unifies reading, annotation, AI study tools, flashcards, and analytics into one distraction-free experience.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Tests-341_passing-brightgreen?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/github/license/nixrajput/LearnBook?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/nixrajput/LearnBook?style=flat-square" alt="Stars">
</p>

---

## The Problem

Most students juggle **4-6 apps** to study: a reader (Kindle), a note app (Notion), a flashcard app (Anki), an analytics tool, and an AI assistant (ChatGPT). Highlights are dead ends. Switching between apps kills focus. No tool connects reading to active recall.

**LearnBook solves this.** One platform for the entire study loop:

```
Read → Highlight → Flashcard → Review → Remember
```

---

## Features

### Core Reading

| Feature                     | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| **Distraction-Free Reader** | Customizable fonts, themes, and reading width. Light/dark/system mode. |
| **Multi-Format Support**    | Markdown, PDF, EPUB, and web article import via URL.                   |
| **Smart Notes**             | Contextual notes tied to chapters, sections, or text selections.       |
| **Bookmarks & Highlights**  | Mark important passages with colored highlights.                       |
| **Full-Text Search**        | Search across chapters, sections, and notes instantly (`⌘K`).          |
| **Reading Progress**        | Per-chapter scroll position, completion tracking, reading streaks.     |
| **Keyboard Shortcuts**      | `j`/`k` nav, `n` notes, `b` bookmark, `[`/`]` sidebars.                |

### AI-Powered Study Tools

| Feature                     | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| **AI Explain**              | Select any text → get a contextual explanation grounded in chapter content. |
| **AI Summarize**            | One-click chapter summaries with key concepts and takeaways.                |
| **AI Ask**                  | Chat-style Q&A anchored to the current chapter.                             |
| **AI Quiz**                 | Auto-generated quizzes (multiple choice, true/false, short answer).         |
| **AI Study Sessions**       | Interactive Socratic sessions that identify weak areas.                     |
| **AI Flashcard Generation** | Generate flashcards from highlights, notes, or chapter content.             |
| **Multi-Provider Routing**  | OpenAI, Anthropic, Google — auto-routes by task, user-switchable.           |
| **Token-Based Credits**     | Plan-gated AI access with credit tracking and usage analytics.              |

### Flashcards & Spaced Repetition

| Feature              | Description                                         |
| -------------------- | --------------------------------------------------- |
| **FSRS Algorithm**   | Modern spaced repetition (superior to Anki's SM-2). |
| **Deck Management**  | Create, organize, and review flashcard decks.       |
| **Daily Review**     | Due cards with Again/Hard/Good/Easy rating system.  |
| **AI Generation**    | Auto-generate flashcards from any content.          |
| **Review Analytics** | Retention rate, state distribution, review streak.  |

### Knowledge Graph

| Feature                | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| **Concept Extraction** | AI extracts key concepts from highlights and notes.         |
| **Connection Mapping** | Visualize how concepts connect across chapters and courses. |
| **Interactive Graph**  | Force-directed graph visualization with click-to-explore.   |

### Study Groups

| Feature                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| **Create & Join**        | Shareable invite links with 8-character codes. |
| **Shared Annotations**   | Share highlights and notes with group members. |
| **Threaded Discussions** | Per-chapter threaded comments.                 |
| **Leaderboard**          | Weekly reading competition within groups.      |

### Analytics & Goals

| Feature                 | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| **Dashboard**           | Completion stats, streak tracking, activity heatmap, velocity chart. |
| **Reading Goals**       | Daily minutes and weekly chapter targets (PRO+).                     |
| **Speed Trends**        | WPM tracking over time (PREMIUM).                                    |
| **Completion Forecast** | Estimated course completion date (PREMIUM).                          |
| **Focus Insights**      | Peak reading hours, session duration analysis (PREMIUM).             |

### Platform

| Feature                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| **OAuth Authentication** | Google + GitHub sign-in via Auth.js v5.                           |
| **Three-Tier Pricing**   | Starter (free), Pro, Premium with Stripe billing.                 |
| **Admin Panel**          | User management, course uploads, offer codes, platform analytics. |
| **CSP Security Headers** | Content Security Policy, X-Frame-Options, Referrer-Policy.        |
| **Internationalization** | English + Hindi with `next-intl`. Add languages via JSON files.   |
| **341 Tests**            | Unit, integration, and component tests with Vitest.               |

---

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router, Turbopack, Server Components) |
| **UI**         | React 19 + Tailwind CSS + shadcn/ui (Radix UI)        |
| **Database**   | SQLite (dev) / PostgreSQL (prod) via Prisma ORM       |
| **Auth**       | Auth.js v5 (NextAuth) — Google + GitHub OAuth         |
| **Payments**   | Stripe (checkout, webhooks, customer portal)          |
| **AI**         | Vercel AI SDK v6 (OpenAI, Anthropic, Google)          |
| **Flashcards** | ts-fsrs (Free Spaced Repetition Scheduler)            |
| **Content**    | MDX via next-mdx-remote + Shiki syntax highlighting   |
| **i18n**       | next-intl (English, Hindi)                            |
| **State**      | Zustand (client), Prisma (server)                     |
| **Validation** | Zod                                                   |
| **Tests**      | Vitest + React Testing Library                        |
| **Fonts**      | Inter (UI) + JetBrains Mono (code)                    |

---

## Screenshots

> **Add screenshots here** — Replace the placeholders below with actual screenshots from your running app.

| Dashboard                                    | Reader                                 | Flashcards                                     |
| -------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Reader](docs/screenshots/reader.png) | ![Flashcards](docs/screenshots/flashcards.png) |

| AI Study Session                                     | Knowledge Graph                                          | Admin Panel                          |
| ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| ![Study Session](docs/screenshots/study-session.png) | ![Knowledge Graph](docs/screenshots/knowledge-graph.png) | ![Admin](docs/screenshots/admin.png) |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.9.0
- **npm** >= 10

### Installation

```bash
# Clone the repository
git clone https://github.com/nixrajput/LearnBook.git
cd LearnBook

# Install dependencies
npm install

# Copy environment variables
cp app/.env.example app/.env
```

### Environment Variables

| Variable                | Required | Description                                                    |
| ----------------------- | -------- | -------------------------------------------------------------- |
| `DATABASE_URL`          | Yes      | SQLite path (`file:./dev.db`) or PostgreSQL connection string  |
| `AUTH_SECRET`           | Yes      | Random secret for Auth.js sessions (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID`      | Yes      | Google OAuth client ID                                         |
| `GOOGLE_CLIENT_SECRET`  | Yes      | Google OAuth client secret                                     |
| `GITHUB_ID`             | Yes      | GitHub OAuth app ID                                            |
| `GITHUB_SECRET`         | Yes      | GitHub OAuth app secret                                        |
| `STRIPE_SECRET_KEY`     | Optional | Stripe secret key (for billing)                                |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret                                  |
| `OPENAI_API_KEY`        | Optional | OpenAI API key (for AI features)                               |
| `ANTHROPIC_API_KEY`     | Optional | Anthropic API key (for AI features)                            |
| `GOOGLE_AI_API_KEY`     | Optional | Google AI API key (for AI features)                            |
| `NEXT_PUBLIC_APP_URL`   | Optional | App URL (default: `http://localhost:3000`)                     |

### Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed plan configs and sample data
npm run db:seed
```

### Running the App

```bash
npm run dev
# → http://localhost:3000 (Next.js + Turbopack)
# → http://localhost:5555 (Prisma Studio)
```

### First Admin User

After signing in with OAuth, promote yourself to admin:

```bash
# Option 1: Use Prisma Studio (opens automatically with dev server)
# Navigate to http://localhost:5555 → users table → change role to "ADMIN"

# Option 2: Direct SQL
cd app && npx prisma db execute --stdin <<< "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## Project Structure

```
learnbook/
├── app/                         # Next.js application (npm workspace)
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (30+ models)
│   │   └── seed.ts              # Data seeder
│   ├── messages/                # i18n translation files
│   │   ├── en.json              # English (~450 keys)
│   │   └── hi.json              # Hindi
│   └── src/
│       ├── app/
│       │   ├── (public)/        # Landing, pricing, terms, privacy
│       │   ├── (auth)/          # Login page
│       │   └── (app)/           # Authenticated app (dashboard, courses, reader, etc.)
│       │       └── admin/       # Admin panel (users, courses, analytics, offers, plans)
│       ├── components/          # React components
│       │   ├── ui/              # shadcn/ui primitives
│       │   ├── reader/          # Chapter reader components
│       │   ├── flashcards/      # Flashcard deck, card, review components
│       │   ├── ai/              # AI chat, explain, summary, credits
│       │   ├── knowledge/       # Knowledge graph visualization
│       │   ├── groups/          # Study group components
│       │   ├── admin/           # Admin table, form components
│       │   ├── pricing/         # Plan cards, offer banner
│       │   └── shared/          # Theme toggle, confirm dialog, scroll reveal
│       ├── lib/
│       │   ├── ai/              # AI router, credits, prompts, concept extractor
│       │   ├── auth/            # Session helpers, requireAdmin
│       │   ├── content/         # Markdown parser, seeder, validator, PDF/web parsers
│       │   ├── flashcards/      # FSRS wrapper, AI card generator
│       │   └── validators/      # Zod schemas
│       ├── hooks/               # Custom React hooks
│       ├── __tests__/           # 41 test files, 341 tests
│       └── i18n/                # next-intl configuration
├── package.json                 # Root workspace config
└── README.md
```

### API Routes (40+)

| Category       | Endpoints                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auth**       | `api/auth/[...nextauth]`                                                                                                                               |
| **CRUD**       | `api/notes`, `api/bookmarks`, `api/highlights`, `api/progress`, `api/preferences`                                                                      |
| **Courses**    | `api/courses`, `api/courses/[id]/activate`                                                                                                             |
| **Content**    | `api/content/upload`, `api/content/import-url`, `api/search`, `api/export`, `api/import`                                                               |
| **AI**         | `api/ai/summarize`, `api/ai/explain`, `api/ai/ask`, `api/ai/quiz`, `api/ai/study-session`, `api/ai/flashcards`, `api/ai/credits`, `api/ai/preferences` |
| **Flashcards** | `api/flashcards/decks`, `api/flashcards/cards`, `api/flashcards/review`, `api/flashcards/due`                                                          |
| **Groups**     | `api/groups`, `api/groups/join`, `api/groups/[id]/members`, `api/groups/[id]/discussions`, `api/groups/[id]/annotations`, `api/groups/[id]/invite`     |
| **Knowledge**  | `api/knowledge-graph`, `api/knowledge-graph/concept/[id]`                                                                                              |
| **Stripe**     | `api/stripe/checkout`, `api/stripe/webhook`, `api/stripe/portal`                                                                                       |
| **Profile**    | `api/profile`, `api/account`, `api/sessions`, `api/sessions/reading`, `api/goals`                                                                      |
| **Admin**      | `api/admin/users`, `api/admin/courses`, `api/admin/offers`, `api/admin/plans`                                                                          |

---

## Architecture

### Data Model

```
User
├── Account / Session (Auth.js)
├── UserPreference (theme, font, locale, activeCourseId)
├── ReadingProgress (per-chapter scroll, completion, time)
├── ReadingStreak (daily activity per course)
├── ReadingGoal (daily/weekly targets)
├── ReadingSession (WPM tracking)
├── Note / Bookmark / Highlight
├── FlashcardDeck → FlashcardCard (FSRS fields) → FlashcardReview
├── AiCreditBalance / AiUsageLog / AiPreference
├── Quiz / StudySession (AI-powered)
├── GroupMember → StudyGroup → GroupDiscussion / SharedAnnotation
└── Concept → ConceptLink (knowledge graph)

Course → Part → Chapter → Section
ContentSource (markdown/pdf/epub/web metadata)
PlanConfig / Offer / OfferRedemption (billing)
```

### Key Design Decisions

- **Server Components by default** — pages fetch data directly from Prisma with no API overhead.
- **Client components pushed down** — only interactive elements (reader toolbar, notes panel, AI chat, flashcard viewer) are client-side.
- **userId always from session** — never from request body. Every API route calls `requireApiSession()`.
- **Plan limits enforced server-side** — `checkPlanLimit()` runs before every create operation.
- **AI credits reserve-then-reconcile** — atomic reservation before LLM call, actual cost reconciled after.
- **FSRS for spaced repetition** — modern algorithm that adapts per-card and per-user.
- **Defense-in-depth for admin** — proxy check + layout guard + `requireAdmin()` DB role check in every API route.

### Three-Tier Plan Structure

|                       | Starter (Free)      | Pro                       | Premium                |
| --------------------- | ------------------- | ------------------------- | ---------------------- |
| **Courses**           | 3                   | Unlimited                 | Unlimited + exclusive  |
| **AI Credits/month**  | 100 (budget models) | 1,500 (budget + standard) | 10,000 (all models)    |
| **Flashcard Decks**   | 3 (100 cards)       | Unlimited                 | Unlimited              |
| **Study Groups**      | Join 1              | Create 2, join 5          | Create 10 (50 members) |
| **Analytics**         | Basic               | Full + goals              | Advanced + forecasts   |
| **Knowledge Graph**   | —                   | View only                 | Full                   |
| **AI Study Sessions** | —                   | Yes                       | Yes                    |
| **Export**            | —                   | Markdown                  | All formats            |

---

## Available Scripts

All scripts run from the **repo root**:

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start dev server (Turbopack + Prisma Studio) |
| `npm run build`       | Production build                             |
| `npm run lint`        | Run ESLint                                   |
| `npm run format`      | Format with Prettier                         |
| `npm test`            | Run Vitest (341 tests)                       |
| `npm run db:push`     | Push Prisma schema to database               |
| `npm run db:generate` | Regenerate Prisma client                     |
| `npm run db:seed`     | Seed plan configs and sample data            |
| `npm run db:reset`    | Wipe and re-seed database                    |
| `npm run db:studio`   | Open Prisma Studio                           |

---

## Content Formats

### Markdown Courses

```markdown
# Part I - Part Title

## Chapter 1 - Chapter Title

### Section Heading

Content here...
```

Upload via the admin panel or seed via CLI.

### PDF / EPUB

Upload via **Library → Upload**. PDFs are parsed with text extraction and heading detection. EPUBs require conversion to markdown (via Calibre) for now.

### Web Articles

Import via **Library → Import Web Article**. Uses Mozilla Readability for content extraction.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

### Development Setup

```bash
git clone https://github.com/nixrajput/LearnBook.git
cd LearnBook
npm install
cp app/.env.example app/.env
# Edit app/.env with your OAuth credentials
npm run db:push && npm run db:seed
npm run dev
```

### Running Tests

```bash
npm test
# 41 test files, 341 tests — validators, FSRS, AI routing, security patterns, components
```

---

## Security

Please read [SECURITY.md](SECURITY.md) for the responsible disclosure policy.

### Security Features

- CSP headers (Content Security Policy)
- X-Frame-Options: DENY (clickjacking protection)
- Stripe webhook signature verification
- SSRF protection on URL imports
- File magic byte validation on uploads
- Path traversal prevention on course IDs
- Secure cookie flags
- Plan limit enforcement (server-side)
- Admin role verification from database (not session)

---

## License

This project is **source-available** under a [custom license](LICENSE).

- **Non-commercial use** (personal, educational, research) — free and unrestricted.
- **Commercial use** — requires written permission from the author.

Contact **nixrajput@gmail.com** for commercial licensing inquiries.

Copyright &copy; 2024-present [Nikhil Rajput](https://github.com/nixrajput).

---

<p align="center">
  <sub>Built with Next.js, Prisma, Stripe, AI SDK, and a lot of ☕ by <a href="https://github.com/nixrajput">@nixrajput</a></sub>
</p>
