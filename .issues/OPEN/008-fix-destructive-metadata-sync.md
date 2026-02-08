---
title: Fix destructive metadata synchronization in sync-issues.mjs
status: OPEN
---

## Description
The current implementation of  overwrites the entire front-matter of local issue files with a hardcoded set of fields (`title`, `status`, `gh_number`). This causes any other metadata, such as `test_ref`, to be permanently deleted from the local file upon the first successful sync.

## Tasks
- [ ] Create proof that `test_ref` is deleted during sync
- [ ] Implement non-destructive front-matter update logic
- [ ] Verify that all existing front-matter attributes are preserved during sync
