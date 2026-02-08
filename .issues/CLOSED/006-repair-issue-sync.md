---
title: "Repair Issue Synchronization"
status: CLOSED
gh_number: 6
---
## Description
The issue synchronization script and workflow are not correctly handling the subdirectories in `.issues/` (OPEN and CLOSED). The script also needs to be more robust in finding issue metadata if front-matter is missing or if files are moved.

## Metadata
- **status**: CLOSED
- **test_ref**: scripts/sync-issues.test.mjs
- **gh_number**: 

## Tasks
- [x] Implement recursive file search in `scripts/sync-issues.mjs`
- [x] Update `.github/workflows/issue-sync.yml` to track subdirectories
- [x] Support status transitions (`OPEN` <-> `IN_PROGRESS` <-> `CLOSED`)
- [x] Implement TDD verification for `IN_PROGRESS` status
- [x] Automate file movement between `OPEN/`, `IN_PROGRESS/`, and `CLOSED/` folders
- [x] Sync `in-progress` label to GitHub
