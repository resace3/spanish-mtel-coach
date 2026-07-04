# Security Policy

## Static Site Threat Model

Spanish MTEL Coach is a public static GitHub Pages app. It has no backend server, API server, database server, external learner-data service, analytics, or tracking script. Learner progress is stored only in the browser through IndexedDB.

This design is appropriate for low-risk practice data. It is not appropriate for private, medical, financial, legal, or highly sensitive information.

## Passcode Limitation

The passcode gate is not equivalent to real server authentication. Because the app is static, the browser receives the JavaScript bundle and public passcode hash. A determined person can inspect the bundle and try an offline attack.

The passcode can keep casual visitors out. It cannot protect sensitive data against a determined attacker.

The app stores only an unlocked session marker in `sessionStorage`. It does not store the passcode in `localStorage`, IndexedDB, `sessionStorage`, or committed files.

## Browser Storage Risks

IndexedDB data belongs to the local browser profile. Anyone with access to that browser profile may be able to view or export practice data. Clearing browser data can delete progress unless a backup has been exported.

Unencrypted exports contain answers, scores, and streak data. Encrypted exports use a user-provided backup passphrase and Web Crypto AES-GCM, but passphrase loss means the backup cannot be restored.

## Secret Handling

`SITE_PASSCODE` must be stored as a GitHub repository secret. GitHub Actions generates `src/generated/passcodeConfig.ts` during CI and Pages builds. That generated file is gitignored and must not be committed.

Do not put GitHub tokens, API keys, passcodes, or production secrets in source files, docs, issues, commits, or Actions logs.

## Static Controls

- Restrictive Content Security Policy in `index.html`
- No external runtime scripts or fonts
- No analytics
- No external API calls for learner data
- No dangerous HTML rendering
- No dynamic code execution
- Custom secret scan script
- npm audit in CI and deployment workflow
- CodeQL workflow
- Dependabot for npm and GitHub Actions

## Pre-Deployment Checklist

- `SITE_PASSCODE` repository secret is set
- Pages source is GitHub Actions
- CI workflow passes
- Pages workflow passes
- `src/generated/passcodeConfig.ts` is not committed
- No `.env` files are committed
- README still explains static passcode limitations

## Vulnerability Reporting

Report suspected security issues privately to the repository owner. Do not include real passcodes, GitHub tokens, or learner export files in public issues.
