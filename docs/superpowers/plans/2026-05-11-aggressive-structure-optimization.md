# Aggressive Structure Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the runnable extension project to the repository root and add guardrails so the structure stays coherent.

**Architecture:** Keep the existing Chrome extension runtime domains, rename `lib/` to `shared/`, and update build, CI, tests, and docs for root-level operation.

**Tech Stack:** Chrome MV3, Vite, Vitest, TypeScript config with JavaScript runtime files.

---

### Task 1: Add Structure Tests

- [x] Add tests that assert `package.json` and `manifest.json` live at the repository root.
- [x] Add tests that assert `gemini-nexus/package.json` no longer exists.
- [x] Add tests that assert `shared/` exists and runtime `lib/` does not.
- [x] Add tests that assert `package.json`, `package-lock.json`, `manifest.json`, and the first changelog entry share the same version.

### Task 2: Promote App Root

- [x] Move app files from `gemini-nexus/` to the repository root.
- [x] Keep the existing root README, license, assets, `.github`, and `.trellis` content.
- [x] Remove the now-empty nested app directory.

### Task 3: Rename Shared Runtime Directory

- [x] Rename `lib/` to `shared/`.
- [x] Update all imports, packaging paths, tests, and docs from `lib/` to `shared/`.

### Task 4: Update Automation And Docs

- [x] Update GitHub Actions paths so packaging runs at the repository root.
- [x] Update README commands and load paths for root-level operation.
- [x] Remove stale hardcoded content-script version text.

### Task 5: Verify

- [x] Run targeted tests for the new structure guardrails.
- [x] Run `npm run check`.
- [x] Run `npm run package:extension`.
- [x] Inspect the packaged extension contents for required files.
