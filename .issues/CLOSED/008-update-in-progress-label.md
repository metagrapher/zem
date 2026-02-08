---
title: "Update In Progress Label"
status: CLOSED
gh_number: 8
---
## Description
Update the sync script to use the specific "in progress" label (with a space) as requested by the user, and ensure it is removed when an issue is no longer in progress.

## Tasks
- [x] Update `scripts/sync-issues.mjs` to use "in progress" label
- [x] Implement logic to remove "in progress" when status is not `IN_PROGRESS`
- [x] Verify logic and close issue
