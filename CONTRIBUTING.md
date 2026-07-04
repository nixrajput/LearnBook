# Contributing to LearnBook

Thank you for your interest in contributing! This document explains how to get set up, the conventions used in the project, and what to expect from the review process.

---

## Table of Contents

- [Contributing to LearnBook](#contributing-to-learnbook)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Pull Request Guidelines](#pull-request-guidelines)
  - [Code Style](#code-style)
  - [Testing](#testing)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)

---

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Getting Started

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/learnbook.git
   cd learnbook
   ```

2. **Install dependencies** from the repo root:

   ```bash
   npm install
   ```

3. **Set up the database:**

   ```bash
   cp reader/.env.example reader/.env
   # Edit reader/.env — set NOTES_PATH to a course folder under courses/
   npm run db:push
   npm run db:seed
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

5. **Run checks** before opening a PR:
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```

---

## Development Workflow

- Work on a **feature branch** cut from `main`.
- Keep changes focused — one feature or fix per pull request.
- Make sure `npm run build` passes before pushing.
- All CI checks (lint, format, build, tests) must pass for a PR to be merged.

---

## Branch Naming

Use descriptive branch names with a short prefix:

| Prefix      | Use for                               |
| ----------- | ------------------------------------- |
| `feat/`     | New features                          |
| `fix/`      | Bug fixes                             |
| `chore/`    | Tooling, deps, config                 |
| `docs/`     | Documentation only                    |
| `refactor/` | Code changes with no behaviour change |

Examples: `feat/export-csv`, `fix/progress-bar-flicker`, `docs/update-readme`

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`

Examples:

```
feat(courses): add per-course completion percentage to dashboard
fix(reader): restore scroll position on back navigation
docs: update environment variables table in README
```

Keep the subject line under 72 characters and written in the imperative mood ("add" not "added").

---

## Pull Request Guidelines

- Open a PR against the `main` branch.
- Fill in the PR description: what changed and why, how to test it.
- Link any related issues using `Closes #<issue-number>`.
- Keep PRs small and reviewable — large PRs take longer and are harder to review.
- Do not force-push to a PR branch after review has started.
- Add or update tests for any changed behaviour.

---

## Code Style

The project uses **ESLint** and **Prettier** for consistent formatting.

```bash
# Check and auto-fix lint issues
npm run lint:fix

# Format all files
npm run format
```

Key conventions:

- TypeScript strict mode — avoid `any` unless there is no alternative.
- Server components are the default — only add `"use client"` when interactivity is required.
- Keep components focused — extract client interactivity into small leaf components rather than making whole pages client-side.
- No new external dependencies without discussion — the goal is to keep the bundle small.

---

## Testing

Tests live in `reader/src/__tests__/` and use **Vitest**.

```bash
npm test
```

- Write a test for any non-trivial utility function or bug fix.
- Tests should not hit the real database — use mocks or in-memory fixtures.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/<your-username>/learnbook/issues) and include:

- A clear title and description.
- Steps to reproduce the issue.
- Expected vs actual behaviour.
- Your Node.js version (`node -v`) and OS.
- Any relevant error messages or screenshots.

---

## Suggesting Features

Open a GitHub Issue with the label `enhancement`. Describe:

- The problem you are trying to solve.
- Your proposed solution (or ideas for one).
- Any alternatives you have considered.

Feature requests are welcome, but scope is intentionally kept small — LearnBook is a personal reading tool, not a general-purpose LMS.
