---
title: Fix npm install failure caused by missing @types/front-matter
status: CLOSED
gh_number: 30
test_ref: tests/issue-028.test.mjs
---

## Description
CI is failing because `@types/front-matter` is not found in the npm registry. Looking at `node_modules/front-matter`, it already includes an `index.d.ts` file, making `@types/front-matter` redundant.

## Objectives
- [x] Remove `@types/front-matter` from `package.json` and `package-lock.json`.
- [x] Verify that `front-matter` types are correctly picked up from the package itself.
- [x] Ensure `npm install` and `npm run zem` work correctly.
- [x] Commit changes with cryptographic signature.

## Test Proof
- **Test A (The Solution)**: `npm install` should succeed in a clean environment.
- **Test B (The Proof)**: The presence of `@types/front-matter` in `package.json` causes 404 error during `npm install`.
