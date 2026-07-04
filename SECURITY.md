# Security Policy

## Supported Versions

LearnBook is a personal, self-hosted tool. Only the latest version on the `main` branch receives security fixes. There are no versioned releases with separate support windows at this time.

| Version | Supported |
|---------|-----------|
| `main` (latest) | Yes |
| Older commits | No |

---

## Scope

LearnBook is designed to run **locally on a single machine** with no authentication and no exposure to the public internet. As such, the threat model is limited:

- **In scope:** Vulnerabilities that could affect users who expose the app to a network (e.g. on a local LAN or behind a reverse proxy), data integrity issues, and dependency vulnerabilities with a credible exploit path.
- **Out of scope:** Attacks that require local machine access (if an attacker has shell access, the app is already compromised), missing rate limiting on the local dev server, and missing HTTPS (intended to be handled at the reverse proxy layer).

---

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report security issues via one of the following:

1. **GitHub Private Security Advisory** — use the [Security tab](https://github.com/<your-username>/learnbook/security/advisories/new) on the repository to open a private advisory.
2. **Email** — send details to the repository owner directly (see GitHub profile for contact).

### What to include

A useful report includes:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof-of-concept (if available).
- The component or file(s) affected.
- Any suggested mitigations.

### Response timeline

| Stage | Target |
|-------|--------|
| Initial acknowledgement | Within 72 hours |
| Assessment and triage | Within 7 days |
| Fix or mitigation | Dependent on severity |
| Public disclosure | After a fix is available, coordinated with the reporter |

---

## Dependency Security

Dependencies are managed via npm. To check for known vulnerabilities in the dependency tree:

```bash
npm audit
```

If you discover a vulnerability in a dependency used by this project, please report it to the upstream package maintainer first. If the upstream package is unresponsive or the vulnerability has a direct exploit path in this project, follow the reporting process above.

---

## Known Limitations

- **No authentication** — the app assumes it is only accessible to its owner. Do not expose it to the public internet without adding auth.
- **SQLite database** — stored at `reader/prisma/dev.db`. Protect this file with appropriate file-system permissions if the machine is shared.
- **`dangerouslySetInnerHTML`** — used in the search dialog to render highlighted snippets. Snippet content is sourced from the local database (seeded from local Markdown files), not from external user input, so XSS via this path requires the attacker to already control the local course files.
