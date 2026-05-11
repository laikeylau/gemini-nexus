# Aggressive Structure Optimization Design

## Goal

Make the repository root the real runnable Chrome extension project root, reduce duplicated project boundaries, and strengthen automated checks around structure, versions, and packaging.

## Architecture

The current runnable app under `gemini-nexus/` moves to the repository root. Project-level files already at the root stay at the root and are updated to reference root-level build paths. The runtime domains remain recognizable:

- `background/` for the MV3 service worker and browser-control managers.
- `content/` for injected page UI and toolbar scripts.
- `sandbox/` for isolated rendering and app UI.
- `sidepanel/` for the extension side-panel bridge.
- `services/` for provider and upload/auth APIs.
- `shared/` for cross-domain utilities that were previously in `lib/`.

## Build And Packaging

Vite continues to build `sidepanel/index.html` and `sandbox/index.html`. The package script still assembles a complete loadable extension under `artifacts/chrome-extension`, but it reads inputs from the repository root and copies `shared/` instead of `lib/`.

The GitHub Actions workflow runs from the repository root. Cache paths, artifact paths, and zip paths are updated to match the root-level package layout.

## Tests

The test suite gains structure tests that fail if the nested project returns, if `lib/` is reintroduced as a runtime shared directory, or if version values drift between `package.json`, `package-lock.json`, `manifest.json`, and the current changelog entry.

Packaging tests are updated to expect `shared/` runtime files. Manifest tests continue to guard content-script coverage.

## Migration Boundary

This change does not convert the whole codebase to TypeScript and does not replace the content-script loader in one step. Those are follow-up refactors after the root migration is stable.
