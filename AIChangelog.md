# AI Changelog

## #JANUS-BFF-0002 — Remove Vitest Dependencies

**Work:** Build — Removed any remaining Vitest, `@vitest`, and Vite path dependencies from the BFF dependency installation and lockfile, confirming the project dependency tree is Jest-only.

## #JANUS-BFF-0001 — Replace Vitest with Jest

**Work:** Plan / Build — Migrated the BFF test tooling from Vitest to Jest while preserving the existing unit and e2e coverage. Added ESM-compatible Jest and ts-jest configuration, converted test mocks and assertions to Jest APIs, removed Vitest/Vite dependencies and configuration, and removed the Mau deployment reference without changing application behavior or architecture.
