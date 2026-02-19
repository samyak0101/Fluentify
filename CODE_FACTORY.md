# Code Factory — fluentify-v2

> **Automated code review and remediation loop for this Chrome browser extension.**

This document explains how the Code Factory automation works for fluentify-v2 and why certain files are treated as critical high risk.

---

## What Is the Code Factory?

The Code Factory is an AI-driven code review and auto-remediation loop that runs on every pull request. Instead of relying solely on human reviewers, it:

1. **Classifies** every PR by risk tier (HIGH or LOW) based on which files were changed
2. **Requests** an AI code review from a bot (CodeRabbit or Greptile)
3. **Automatically patches** code review findings using the Codex agent
4. **Validates** the fix locally (lint + typecheck + tests) before pushing
5. **Repeats** up to 3 times per commit SHA, then requires human intervention

The result: PRs touching low-risk code (popup UI, types, data) flow through with minimal friction. PRs touching critical code (background scripts, content scripts, manifest) get full AI review scrutiny.

---

## Why Background/Content Scripts and Manifest Are Critical

Chrome browser extensions run with elevated trust. This makes bugs in certain files disproportionately dangerous:

### `src/background/service-worker.ts` — CRITICAL
- Runs persistently in Chrome's background, even when no tab is open
- Has access to `chrome.tabs`, `chrome.storage`, `chrome.cookies`, `chrome.webRequest`
- A logic error here can silently corrupt user data or expose browsing history
- A crash here disables the entire extension for the user

### `src/content/**` — CRITICAL
- Content scripts are **injected into web pages** the user visits
- They run in the context of those pages with access to the DOM
- A bug can leak page data, interact with pages in unexpected ways, or be exploited by XSS

### `src/manifest.ts` — CRITICAL
- Controls what **Chrome permissions** the extension requests at install time
- Changing permissions (e.g., adding `"*://*/*"` host access) silently expands attack surface
- Permission changes are irreversible once users have installed the extension version
- Manifest errors can break the extension entirely

### `src/lib/**` and `src/hooks/**` — HIGH
- Core shared logic used across all extension surfaces
- Bugs here cascade across background, content, popup, and options simultaneously

### `src/options/**` — HIGH
- Options page runs in a privileged Chrome extension context
- Can read/write extension storage that affects all user sessions

---

## Risk Tier Classification

### HIGH RISK — Full review pipeline required

| Pattern | Examples | Why |
|---|---|---|
| `src/background/**` | `src/background/service-worker.ts` | Runs with full extension permissions |
| `src/content/**` | `src/content/injector.ts` | Injected into user web pages |
| `src/manifest.ts` | `src/manifest.ts` | Controls all extension permissions |
| `src/lib/**` | `src/lib/storage.ts`, `src/lib/api.ts` | Core shared logic |
| `src/hooks/**` | `src/hooks/useSettings.ts` | Shared hooks across all surfaces |
| `src/options/**` | `src/options/OptionsPage.tsx` | Privileged options context |
| `vite.config.*` | `vite.config.ts` | Build configuration |
| `tsconfig.json` | `tsconfig.json` | TypeScript compilation config |
| `package.json` | `package.json` | Dependency management |
| `package-lock.json` | `package-lock.json` | Dependency lock — supply chain risk |
| `.github/workflows/**` | `.github/workflows/ci.yml` | CI/CD pipeline config |
| `risk-policy.json` | `risk-policy.json` | This policy contract itself |

**Required checks for HIGH tier PRs:** `risk-policy-gate`, `code-review-agent`, `Build & Type Check`

### LOW RISK — Gate + CI only

| Pattern | Examples | Why |
|---|---|---|
| `src/popup/**` | `src/popup/App.tsx`, `src/popup/components/**` | UI-only, limited permissions |
| `src/types/**` | `src/types/index.ts` | Type definitions, no runtime behavior |
| `src/data/**` | `src/data/languages.ts` | Static data |
| Styles, assets, docs | `*.css`, `*.md`, `*.png` | No runtime risk |

**Required checks for LOW tier PRs:** `risk-policy-gate`, `Build & Type Check`

---

## The Automation Loop

```
PR opened / commit pushed
        │
        ▼
risk-policy-gate runs
├── Classifies files: HIGH or LOW tier
├── Posts tier result as PR comment
└── Fails if policy violation found
        │
        ▼ (on synchronize, HIGH tier PRs)
code-review-rerun requests @coderabbitai review
        │
        ▼
Bot posts findings
        │
        ▼
remediation.yml fires
├── Validates: is comment from the review bot?
├── Validates: does comment reference current HEAD SHA?
├── Checks: attempts < 3 (safety guard)
├── Runs Codex to patch findings
├── Validates fix: npm run lint + npm run typecheck + npm test -- --run
└── Pushes fix commit → triggers new review cycle
        │
        ▼ (bot posts "LGTM")
auto-resolve-threads resolves bot-only PR threads
        │
        ▼
All required checks pass → PR can merge
```

---

## How to Trigger the Remediation Loop

The loop triggers **automatically** when the configured review bot posts findings on a PR. No manual action is needed.

To trigger a fresh review on an existing PR (e.g., after manually pushing a fix):
1. Push a new commit to the PR branch — `code-review-rerun.yml` fires automatically on `synchronize`
2. Or, comment `@coderabbitai review` manually on the PR to request a fresh review

To **stop** the loop (e.g., if the agent is looping on an unfixable finding):
1. Push a new commit with a manual fix — this resets the SHA-based attempt counter
2. Or, the loop stops automatically after 3 attempts on the same commit SHA

---

## Branch Protection Settings

Configure these in **Settings → Branches → Add rule** for the `main` branch:

### Required status checks
Add all three of these (search by exact name):
- `risk-policy-gate` — from `risk-policy-gate.yml`
- `Build & Type Check` — from the existing `ci.yml` (exact string — must match)
- `code-review-agent` — from CodeRabbit or Greptile

### Other recommended settings
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

> **Critical:** The check names in branch protection must **exactly** match the strings in `risk-policy.json → mergePolicy.high.requiredChecks`. The string `"Build & Type Check"` must be typed verbatim — it matches the job `name:` in `.github/workflows/ci.yml`.

---

## Repository Setup Checklist

### Secrets (Settings → Secrets and variables → Actions secrets)
- [ ] `OPENAI_API_KEY` — for the Codex remediation agent

### Variables (Settings → Secrets and variables → Variables)
- [ ] `CODE_REVIEW_SERVICE` — `coderabbitai` or `greptile`
- [ ] `CODE_REVIEW_BOT` — exact GitHub login, e.g., `coderabbitai[bot]`
- [ ] `REMEDIATION_AGENT` — `codex` (default)

### External Apps
- [ ] Install [CodeRabbit](https://coderabbit.ai) or [Greptile](https://greptile.com) on this repo

---

## Available npm Scripts

These are the ONLY scripts used in automation. No invented scripts:

| Script | Command | Used by |
|---|---|---|
| `npm run lint` | `eslint src/` | remediation.yml validation |
| `npm run typecheck` | `tsc --noEmit` | remediation.yml validation |
| `npm test -- --run` | `vitest --run` | remediation.yml validation |
| `npm run build` | `tsc && vite build` | ci.yml (Build & Type Check) |

---

## A Note on Browser Evidence

The standard Code Factory includes a `browser-evidence` check that requires screenshot manifests from a staging environment. **This check is NOT applicable for fluentify-v2.**

For Chrome extensions, "browser evidence" means loading the unpacked extension in Chrome DevTools and running extension-specific flows — not navigating to a staging URL. The `scripts/browser-evidence-verify.sh` script is included for completeness but is not wired into the required checks.

If extension-level evidence capture is implemented in the future (e.g., using Playwright's Chrome extension testing support), add `"browser-evidence"` to `risk-policy.json → mergePolicy.high.requiredChecks` and update branch protection.

---

## Files Reference

| File | Purpose |
|---|---|
| `risk-policy.json` | Machine-readable policy contract — risk tiers and required checks |
| `scripts/risk-policy-check.js` | File classification engine — run locally to test tier assignment |
| `scripts/browser-evidence-verify.sh` | Evidence manifest validator (N/A for extensions, included for reference) |
| `.github/workflows/ci.yml` | **Existing CI** — typecheck + lint + build + test (DO NOT MODIFY) |
| `.github/workflows/risk-policy-gate.yml` | PR tier classification + policy enforcement |
| `.github/workflows/code-review-rerun.yml` | SHA-deduplicated AI review request |
| `.github/workflows/remediation.yml` | Auto-patch findings using Codex + validate before push |
| `.github/workflows/auto-resolve-threads.yml` | Clean up resolved bot-only review threads |

---

Based on Ryan Carson's Code Factory pattern ([@ryancarson](https://x.com/ryancarson), Feb 2026).
