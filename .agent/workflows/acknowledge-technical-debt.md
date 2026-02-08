---
description: SOP for acknowledging and mechanically witnessing technical debt in ZEM.
---

# Acknowledge Technical Debt Workflow

Use this workflow when a technical standard (coverage, linting, complexity) cannot be met immediately, allowing the project to maintain a `SIGNAL OK` without bypassing the protocol.

## 1. Issue Initiation
1.  Create a GitHub Issue describing the debt (e.g., "Restore Coverage Gate to 90%").
2.  Assign the `gh_number`.
3.  Create/Move the local marker to `.issues/IN_PROGRESS/NNN-title.md`.

## 2. Mechanical Witness (TDD)
1.  Create a dedicated test file `tests/issue-NNN.test.ts`.
2.  Implement **Test B (The Proof)**: This test must **PASS** if the debt exists (e.g., assert current coverage < target).
3.  Implement **Test A (The Solution)**: This test must **FAIL** until the debt is fully resolved (e.g., assert current coverage >= target).

## 3. Code Annotation
1.  Lower the threshold in the enforcement engine (e.g., `src/cli/audit.ts`).
2.  **MANDATORY**: Add a comment referencing the Issue ID directly above the lowered threshold.
    ```typescript
    // TECHNICAL DEBT (#NNN): Target is X%. Temporarily lowered to Y% to allow backfill.
    if (current < Y) { ... }
    ```

## 4. Verification
1.  Run `npm run build && node dist/cli.js audit`.
2.  The Auditor should return `SIGNAL OK` because:
    - The issue is `IN_PROGRESS`.
    - Test B (Proof) passes.
    - Test A (Solution) is acknowledged as failing but tracked.

## 5. Coordination Hygiene
// turbo
1.  Pull current state: `git pull origin <branch> --rebase`.
2.  Commit changes: `git add . && git commit -S -m "feat: track <title> technical debt #NNN"`.
3.  Push: `git push origin <branch>`.
4.  **NEVER** force-push unless explicitly authorized and after verifying remote state.
