---
title: Repair Issue Synchronization
status: CLOSED
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
- [x] Support metadata extraction from markdown body if front-matter is missing
- [x] Verify logic with recursive discovery test
- [x] Ensure CLOSED issues are correctly synced to GitHub 'closed' state
