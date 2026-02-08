---
title: Propagate metadata to GitHub issue body
status: CLOSED
---

## Description
Local issue metadata (like `test_ref`) is currently invisible on GitHub because it is only stored in the local front-matter. This makes it difficult to verify the TDD state from the GitHub UI.

## Tasks
- [ ] Modify `scripts/sync-issues.mjs` to include metadata in the body sent to GitHub.
- [ ] Ensure managed fields (`title`, `status`, `gh_number`) are excluded from the body-metadata to avoid redundancy.
- [ ] Verify that `test_ref` is visible in the description of Issue #7 on GitHub.
