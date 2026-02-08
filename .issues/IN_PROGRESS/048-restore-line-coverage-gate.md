---
title: Restore Line Coverage Gate to 80%
status: IN_PROGRESS
gh_number: 48
test_ref: tests/issue-048.test.ts
---

## Objective
Restore the line coverage threshold in the Mechanical Auditor to the standard 80% target.

## Context
The line coverage threshold was lowered to 25% (floor) to allow the Auditor to pass while larger CLI modules are being backfilled with tests. This represents a significant gap in our verification context (currently at ~36%).

## Standard
- Line Coverage Target: 80%
- Current Level: ~36%

## Tasks
- [x] Lower threshold to 25% in `audit.ts` (Debt Witness)
- [ ] Implement integrated CLI tests for `src/cli/sync-issues.ts`
- [ ] Implement integrated CLI tests for `src/cli/audit.ts`
- [ ] Restore line coverage threshold in `src/cli/audit.ts` to 80%
- [ ] Verify `SIGNAL OK` with strict gates
