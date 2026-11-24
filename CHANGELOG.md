# Changelog

All notable changes to LearnBook are documented here.

## [0.2.3] - 2026-11-24

### Changed

- The README now lists Node.js 22 or newer as the prerequisite, with 24 recommended, matching `engines` and `.nvmrc`.

## [0.2.2] - 2026-11-23

### Fixed

- The course list, course detail, course activation and admin course and plan routes are now in the repository.
- Uploads between 10 MB and 50 MB no longer fail.
- Chapter pages no longer return a server error when the build database has no chapters.
- The course list, course page and course activation show only published courses and your own uploads.
- Upload routes skip the proxy and refuse oversized bodies before reading them.

## [0.2.1] - 2026-11-23

### Fixed

- PDF uploads work again: the parser uses the pdf-parse 2.x API.
- A Stripe webhook delivered twice no longer grants credits twice.
- AI requests charge credits down to zero and cap prompt input size.
- AI features and the reader only open published courses or your own uploads.
- Uploaded and imported text can no longer inject HTML into the reader or search.
- Article import blocks private addresses, including through redirects.
- Uploads over the size limit are refused before the server reads them.
- Checkout no longer applies an offer you already redeemed or one that has not started.
- `/api/auth/session` no longer returns the session token or Stripe ids.
- Production CSP no longer allows `unsafe-eval`.

### Changed

- Upgraded dependencies to exact pins, including Prisma 7, AI SDK 7, Stripe 23, Zod 4 and lucide-react 1.
- Pinned GitHub Actions by commit SHA and narrowed workflow permissions.

## [0.2.0] - 2026-11-23

### Phase 17a — Translation Infrastructure

- Added `next-intl` with English and Hindi translation files (~450 keys each).
- Language switcher in settings and navigation.
- Login and settings pages fully translated as reference implementations.

### Phase 16 — Testing for Feature Expansion

- 341 tests across 41 test files covering all features.
- AI model routing, credit calculations, FSRS scheduling, SSRF protection, component rendering.

### Phase 15 — Knowledge Graph

- Concept extraction from highlights/notes using AI.
- Force-directed graph visualization on canvas.
- Concept panel showing cross-chapter/cross-course connections.

### Phase 14 — Study Groups

- Create/join groups via 8-character cryptographic invite codes.
- Threaded per-chapter discussions.
- Shared annotations between group members.
- Weekly leaderboard with completion-based scoring.

### Phase 13 — Multi-Format Content

- PDF upload with text extraction and heading detection.
- Web article import using Mozilla Readability.
- EPUB placeholder with conversion guidance.
- Personal library page with format badges.
- SSRF protection and magic byte validation on uploads.

### Phase 12 — AI Quiz + Study Sessions

- Auto-generated quizzes (multiple choice, true/false, short answer).
- Interactive Socratic study sessions with evaluation and weak area identification.
- Quiz caching and score tracking.

### Phase 11 — Flashcards + Spaced Repetition

- FSRS algorithm (ts-fsrs) for scheduling.
- Deck management, card creation, daily review sessions.
- AI-powered flashcard generation from content.
- Card states: New, Learning, Review, Relearning.

### Phase 10 — AI Infrastructure

- Multi-provider AI routing (OpenAI, Anthropic, Google).
- Token-based credit system with reserve-then-reconcile pattern.
- Streaming AI summarize, explain, and ask APIs.
- Inline AI explain popover in the reader.
- Model selector and credits badge in UI.

### Phases 0–9 — Core SaaS Platform

- Auth.js v5 with Google + GitHub OAuth.
- 30+ Prisma models with userId threading across all routes.
- Profile management, session control, account deletion.
- Stripe checkout, webhooks, customer portal, offer codes.
- CSP headers, plan limit enforcement, security hardening.
- Advanced analytics: streaks, heatmap, velocity, reading goals.
- Admin panel: users, courses, offers, plans, platform analytics.
- Course upload with markdown validation and file management.
- 238 base tests covering validators, API guards, analytics.
