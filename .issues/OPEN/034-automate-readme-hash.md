---
title: "Automate README Install Hash Updates"
type: task
status: open
priority: high
test_ref: scripts/update-readme-hash.test.ts
verification: FAIL
gh_number: 34
---
# Objective
The README installation instructions point to a specific commit hash for security and stability. This hash becomes stale as `primary` advances. We need an automated process to update this hash safely.

# Requirements
1.  **Script**: Create a script (e.g., `scripts/update-readme-hash.ts`) that:
    - Fetches the current `HEAD` hash of `origin/primary`.
    - Updates `README.md` to use this new hash in the `npm install` command.
    - Verifies that the new hash actually exists.
2.  **Automation**:
    - This script should be runnable manually or via a GitHub Action on release/merge.
    - Ideally, it should create a "chore" commit if changes are detected.
3.  **Verification**:
    - Ensure the script doesn't accidentally point to a broken or unverified commit.

# Context
Currently, we manually pasted the hash. This is error-prone and will drift immediately upon the next merge.
