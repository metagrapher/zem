---
title: Resolve Environmental Coverage Restrictions
status: CLOSED
gh_number: 19
test_ref: tests/verify-coverage.test.mjs
verification: PASS
---
## Description
The sandbox environment restricts `mkdtemp` in the system `/var` directory, causing Node.js experimental coverage to fail with `EPERM`. This prevents the mechanical audit from passing.

## Tasks
- [x] Identify a writable local directory for `TMPDIR`.
- [x] Update `package.json` to use local `coverage-data/` for coverage temp files.
- [x] Ensure `.gitignore` ignores the coverage data.
- [x] Fix unused imports in related test utility scripts.
- [x] Verify full audit passes with `npm run zem`.
