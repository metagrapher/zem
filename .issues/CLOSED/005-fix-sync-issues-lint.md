---
title: "Fix Linting for sync-issues.mjs"
status: CLOSED
gh_number: 5
test_ref: tests/legacy.test.mjs
verification: PASS
---
# Issue 002: Fix Linting for sync-issues.mjs

## Description
The `scripts/sync-issues.mjs` file had 11 linting errors because `.mjs` files were not covered by the global environment configuration in `eslint.config.js`. We decided to maintain the original file content and just fix the environment config.

## Metadata
- **status**: CLOSED
- **branch**: fix/002-sync-issues-lint

## Tasks
- [x] Create issue and branch
- [x] Update `eslint.config.js` to include `.mjs` files in scripts globals
- [x] Verify linting passes
- [x] Run full audit
- [x] Close issue and create PR

