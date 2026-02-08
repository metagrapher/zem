---
title: Restore Coverage Gate to 90%
status: IN_PROGRESS
gh_number: 47
test_ref: tests/issue-047.test.ts
---

## Objective
Restore the branch coverage threshold in the Mechanical Auditor to the standard 90% target.

## Context
The branch coverage threshold was temporarily lowered to 80% to allow the project to maintain a passing signal while coverage backfill is in progress. This represents technical debt that must be resolved to ensure the long-term integrity of the ZEM methodology.

## Standard
- Branch Coverage: 90%
- Line Coverage: 80% (Current floor: 25%)

## Tasks
- [x] Lower threshold to 80% in `audit.ts` to unblock Auditor (Debt Witness)
- [ ] Backfill tests for `src/cli/sync-issues.ts`
- [ ] Backfill tests for `src/cli/audit.ts`
- [ ] Restore thresholds in `src/cli/audit.ts` to 90%
- [ ] Verify `SIGNAL OK` with strict gates
