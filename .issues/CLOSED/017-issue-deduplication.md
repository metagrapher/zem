---
title: Implement issue deduplication check in pre-commit hook
status: CLOSED
gh_number: 17
test_ref: src/logic/dedupe.test.ts
verification: PASS
---
## Description
The issue synchronization system relies on unique `gh_number` values in the front-matter of local issue files. Accidental duplication of these numbers can lead to unpredictable behavior and data loss during sync.

## Tasks
- [ ] Implement a check in `scripts/structural-audit.ts` to verify `gh_number` uniqueness across all .md files in `.issues/`.
- [ ] Ensure the pre-commit hook fails if duplicates are detected.
- [ ] Verify the fix by creating a temporary duplicate issue and running the audit.
