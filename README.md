# Spanish MTEL Coach

A fully static React TypeScript GitHub Pages app for Spanish MTEL-style practice. It includes daily adaptive practice, extra practice, review, streak tracking, local backup export/import, and a casual passcode gate.

This project intentionally has no backend server, API server, database server, nightly job, cron job, analytics, external API, Firebase, Supabase, Auth0, or third-party learner data storage.

## Architecture

- Vite, React, TypeScript, React Router with `HashRouter`
- Static GitHub Pages deployment
- GitHub Actions for install, passcode config generation, validation, tests, audit, build, Playwright, and deployment
- IndexedDB for all learner progress
- `sessionStorage` only for the current unlocked session marker
- Browser SpeechSynthesis for listening prompts when a Spanish voice is available
- No cookies, analytics, CDN scripts, external fonts, or external runtime APIs

## Passcode Gate

The first screen asks for a passcode. GitHub Actions reads the `SITE_PASSCODE` secret and generates `src/generated/passcodeConfig.ts` during the workflow. That generated file contains a public salt, public PBKDF2 SHA-256 hash, iteration count, and algorithm name.

Important: this is not secure authentication. Because this is a public static site, determined visitors can inspect the JavaScript bundle, find the hash, and try an offline attack. The passcode is only a casual gate for a low-risk practice app.

Do not store private, medical, financial, legal, or highly sensitive information in this app.

## Local Progress

Progress is stored only in the learner browser using IndexedDB:

- attempts
- daily sets
- daily completion records
- streak state derived from completions
- extra practice sessions
- settings and export metadata

Clearing browser data can delete progress unless she exports a backup first. Answers, streaks, scores, and passcodes are not sent anywhere by the app.

## Daily Practice

Each America/Chicago calendar date has exactly 10 daily questions. On first use for that date, the app reads local IndexedDB history, computes weak areas, and selects a deterministic daily set. Once saved, that date daily set remains stable.

The default new-learner mix is:

1. Listening main idea
2. Listening inference
3. Reading main idea
4. Reading detail or inference
5. Language structures
6. Language structures
7. Culture or cultural comparison
8. Communication or classroom-oriented scenario
9. Written-expression strategy, multiple choice
10. Oral-expression strategy, multiple choice

All practice in this app is multiple choice. Writing and oral skills are practiced through response-strategy and judgment questions, not typed free responses, microphone recording, or self-scored rubrics.

## Streaks

A completed day means all 10 daily questions were submitted for the America/Chicago date. Extra practice affects weak-area statistics but does not count toward the daily streak. A missed day resets the current streak; longest streak is preserved.

## Question Content

The question bank contains original Spanish MTEL-style practice content:

- at least 40 listening items
- at least 40 reading items
- at least 60 language structures items
- at least 30 culture items
- at least 35 writing-strategy multiple-choice items
- at least 35 oral-strategy multiple-choice items

It does not copy official MTEL questions or copyrighted passages. Validate content with the GitHub Actions workflow or by triggering `npm run validate:questions` in Actions.

## GitHub Actions

CI and Pages workflows:

- install dependencies
- generate passcode config
- check for obvious secrets and unsafe static patterns
- validate the question bank with Zod
- run TypeScript checks
- run ESLint
- run Vitest and React Testing Library tests
- build the static app
- run Playwright in the Pages workflow
- run `npm audit --audit-level=moderate`
- deploy to GitHub Pages only after checks pass

## Required Secret

Set a repository secret:

```bash
gh secret set SITE_PASSCODE --repo OWNER/spanish-mtel-coach
```

To change the passcode, update the same secret and rerun the Pages workflow or push a new commit.

## GitHub Pages

Use GitHub Actions as the Pages source:

Settings -> Pages -> Build and deployment -> Source -> GitHub Actions

The workflow sets:

```text
VITE_BASE_PATH=/spanish-mtel-coach/
```

## Export And Import

Settings includes:

- export progress as a local JSON file
- optional AES-GCM encryption with a backup passphrase
- import with validation
- merge or replace mode, both requiring confirmation
- clear all local data with confirmation

Unencrypted exports contain practice answers and scores.

## Security Checklist

- No committed passcode
- `src/generated/passcodeConfig.ts` is gitignored
- No backend or learner data API
- No analytics or tracking scripts
- No external runtime API calls
- Restrictive CSP meta tag
- No `eval`, `new Function`, or unsafe HTML rendering
- CodeQL, Dependabot, npm audit, and custom no-secret checks in GitHub Actions

See [SECURITY.md](SECURITY.md) for the full threat model.
