# Gemini Nexus Comprehensive Optimization Design

**Date:** 2026-04-14

## Goal

Bring the repository out of its current half-refactored state without broad feature churn. The optimization pass should leave the extension easier to reason about, easier to build, and better protected against the most fragile web-provider regressions.

## Current State

The repo already contains partial cleanup work:

- `gemini-nexus/content/bootstrap.js` and targeted bootstrap tests exist.
- the vendored snapshot formatter copy has already been removed.
- shared HTML image parsing helpers and related sandbox tests already exist.

The remaining friction is concentrated in three places:

1. The content-script entrypoint contract is still split between `content/index.js` and `content/main.js`.
2. The build pipeline still uses Vite for HTML pages and esbuild for background/content, which keeps manifest and emitted paths loosely coupled.
3. `services/auth.js` and `services/providers/web.js` still rely on brittle HTML scraping and stream parsing without direct regression tests.

## Recommended Approach

### 1. Finish the structure cleanup around one canonical content entrypoint

Treat `gemini-nexus/content/main.js` as the only source entrypoint name and remove `gemini-nexus/content/index.js`. The manifest and packaged output should reference `content/main.js` directly. This closes the last misleading entrypoint alias left over from the earlier refactor.

### 2. Unify runtime bundling under Vite and shrink the packager

Use Vite to build:

- `sidepanel/index.html`
- `sandbox/index.html`
- `background/index.js`
- `content/main.js`

Keep `scripts/package-extension.mjs` only as a packaging/validation step that copies static assets and checks that manifest entrypoints exist in `dist/`. This removes the double-bundler split while preserving the current “load `dist/` as unpacked extension” workflow.

### 3. Add regression-oriented tests around the brittle web provider

Keep the current auth and retry behavior intact, especially the session-clearing and retry assumptions that work with `background/managers/keep_alive.js`. Instead of rewriting the provider, add test seams:

- a parser-level test for extracting auth params from Gemini HTML
- web-provider tests for login-page detection, network failure reporting, and streaming success parsing

Small helper extraction is acceptable if it improves testability without changing behavior.

## Design Boundaries

### In scope

- content entrypoint cleanup
- build-pipeline consolidation
- packaging validation
- auth/web-provider regression tests
- lightweight helper extraction in service files to support tests

### Out of scope

- replacing the entire extension build with CRXJS or `vite-plugin-web-extension`
- redesigning the extension runtime architecture
- changing the CDP action model
- broad provider feature changes

## Risks And Mitigations

### Risk: manifest/build mismatch breaks Chrome loading

Mitigation: add tests that assert manifest references canonical entrypoints and add packaging validation that checks emitted files actually exist in `dist/`.

### Risk: provider refactors break current retry/login recovery behavior

Mitigation: keep retry decisions in `background/managers/session/request_dispatcher.js` unchanged and add service-level tests before touching auth/provider code.

### Risk: nested repo layout causes path confusion

Mitigation: keep docs in the outer repo and reference inner app files explicitly as `gemini-nexus/...`, matching the existing plan documents.

## Verification Strategy

- targeted Vitest runs for each new regression test
- full `npm test`
- `npm run typecheck`
- `npm run build`
- manual inspection of `dist/manifest.json` and the emitted `dist/background/index.js` and `dist/content/main.js`
