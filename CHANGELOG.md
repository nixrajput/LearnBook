# Changelog

All notable changes to LearnBook are documented here.

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
