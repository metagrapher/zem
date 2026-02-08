---
title: Fix destructive metadata synchronization in sync-issues.mjs
status: CLOSED
gh_number: 13
test_ref: src/logic/metadata.test.ts
verification: PASS
---
## Description
The current implementation of `sync-issues.mjs` overwrites the entire front-matter of local issue files with a hardcoded set of fields (`title`, `status`, `gh_number`). This causes any other metadata, such as `test_ref`, to be permanently deleted from the local file upon the first successful sync.

## Tasks
- [x] Implement non-destructive front-matter update logic
- [ ] Create proof that `test_ref` is preserved during sync
- [ ] Verify that all existing front-matter attributes are preserved during sync
