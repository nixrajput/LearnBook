# Contributing to LearnBook

Thank you for your interest in contributing! This document explains how to get set up, the conventions used in the project, and what to expect from the review process.

---

## Quick Start

```bash
git clone https://github.com/nixrajput/LearnBook.git
cd LearnBook
npm install
cp app/.env.example app/.env
# Edit app/.env — set OAuth credentials (Google + GitHub)
npm run db:push
npm run db:seed
npm run dev
# → http://localhost:3000 (app)
# → http://localhost:5555 (Prisma Studio)
```

---

## Project Structure

This is a monorepo using npm workspaces:

```
learnbook/
├── app/                    # Next.js 16 application (primary workspace)
│   ├── prisma/             # Schema (30+ models) + seed script
│   ├── messages/           # i18n translation files (en.json, hi.json)
│   └── src/
│       ├── app/            # App Router pages + API routes (40+)
│       ├── components/     # React components (ui, reader, flashcards, ai, admin, etc.)
│       ├── lib/            # Server utilities (ai, auth, content, flashcards, validators)
│       ├── hooks/          # Custom React hooks
│       ├── __tests__/      # 41 test files, 341 tests
│       └── i18n/           # next-intl configuration
├── docs/                   # Documentation and screenshots
├── package.json            # Root workspace config
└── README.md
```

---

## Development Conventions

### Code Style

- **TypeScript strict mode** — no `any` without `eslint-disable` comment.
- **Prettier + ESLint** — run `npm run lint:fix && npm run format` before committing.
- **Imports** — use `@/` path aliases (e.g., `@/lib/db`, `@/components/ui/button`).

### Component Patterns

- **Server Components by default** — only add `"use client"` when you need interactivity or browser APIs.
- **Push client boundaries down** — wrap only the interactive part, not the whole page.
- **shadcn/ui for UI primitives** — don't build custom buttons, dialogs, etc. from scratch.
- **Confirm dialogs for destructive actions** — use `<ConfirmDialog>` from `@/components/shared/confirm-dialog`.

### API Route Patterns

```typescript
// Every authenticated route starts with:
const user = await requireApiSession();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Admin routes use fresh DB role check:
const result = await requireAdmin();
if (result.error) return result.error;

// Plan limits checked before creation:
const limitError = await checkPlanLimit(user.id, user.plan ?? "FREE", "notes");
if (limitError) return limitError;
```

### Database

- **Prisma ORM** — schema at `app/prisma/schema.prisma`.
- **snake_case in DB** — use `@map()` and `@@map()` for column/table names.
- **camelCase in TypeScript** — Prisma handles the mapping.
- After schema changes: `npm run db:push && npm run db:generate`.

### Testing

Tests live in `app/src/__tests__/` and use **Vitest**.

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --run slugs     # Run specific test file
```

- **Unit tests** — pure logic (validators, credit calculations, FSRS scheduling).
- **Integration tests** — mocked DB + auth (API route patterns, plan limits).
- **Component tests** — `@testing-library/react` with `jsdom` environment.

### i18n / Translations

- Translation files: `app/messages/en.json`, `app/messages/hi.json`.
- Server components: `const t = await getTranslations("namespace")`.
- Client components: `const t = useTranslations("namespace")`.
- Adding a new language: create `messages/<lang>.json`, copy structure from `en.json`, translate values, add to `SUPPORTED_LANGUAGES` in `config/locales.ts`.

---

## Commit Messages

Follow the format in `.gitmessage`:

```
<type>: <short description>

- Bullet point details of what changed.
- Another detail.
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

---

## Pull Requests

1. Create a feature branch from `main`.
2. Make your changes with tests.
3. Run `npm run lint:fix && npm run format && npm test`.
4. Open a PR with a clear description of what and why.
5. PRs are reviewed for correctness, security, and consistency with existing patterns.

---

## Areas Open for Contribution

- **Translations** — Add new languages by creating `messages/<lang>.json`.
- **EPUB parsing** — Binary EPUB support (ZIP extraction) is a placeholder. Needs `adm-zip` integration.
- **Rate limiting** — Upstash Redis integration (deferred from Phase 5).
- **Anki export** — Export flashcard decks as `.apkg` files.
- **Real-time groups** — WebSocket support for live discussion updates.
- **Additional AI providers** — More provider integrations via AI SDK.
- **Bug fixes and tests** — Always welcome.

---

## Security

If you discover a security vulnerability, please follow the responsible disclosure process in [SECURITY.md](SECURITY.md). Do **not** open a public issue.

---

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project's [source-available license](LICENSE), and you grant the copyright holder a perpetual, irrevocable license to use your contribution under any license terms.
