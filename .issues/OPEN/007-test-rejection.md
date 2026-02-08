---
title: Test Rejection Verification
status: CLOSED
gh_number: 7
test_ref: scripts/failing-tdd.test.mjs
---

## Description
This is a proof-of-concept issue to verify that the sync script correctly rejects a 'CLOSED' state when tests fail, and instead promotes the issue to 'IN_PROGRESS' with the appropriate label.

## Tasks
- [x] Run failing TDD tests
- [x] Verify automatic move to `IN_PROGRESS` folder
- [ ] Verify `in progress` label is applied to GitHub issue #7
- [ ] Confirm local filename matches GitHub issue number (e.g. `007-test-rejection.md`)
