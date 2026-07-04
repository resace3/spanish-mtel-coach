# GitHub Pages Setup

## Required Settings

In the repository:

Settings -> Pages -> Build and deployment -> Source -> GitHub Actions

The workflow deploys the `dist` folder through `actions/upload-pages-artifact` and `actions/deploy-pages`.

## Required Secret

Set:

```text
SITE_PASSCODE
```

With GitHub CLI:

```bash
gh secret set SITE_PASSCODE --repo OWNER/spanish-mtel-coach
```

## Optional Base Path

The workflows set:

```text
VITE_BASE_PATH=/spanish-mtel-coach/
```

The app uses `HashRouter`, so route refreshes work on GitHub Pages.

## Inspect Deployments

```bash
gh run list --repo OWNER/spanish-mtel-coach
gh run view --repo OWNER/spanish-mtel-coach --log
gh run watch --repo OWNER/spanish-mtel-coach
```

Rerun a failed workflow from the Actions tab or with:

```bash
gh run rerun RUN_ID --repo OWNER/spanish-mtel-coach
```
