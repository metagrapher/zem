#!/bin/bash

# Antigravity AI: ZEM Mechanical Gate (Pre-commit)
# Enforces the GIT_PROTOCOL by blocking local mistakes.

BRANCH=$(git rev-parse --abbrev-ref HEAD)
USER_NAME=$(git config user.name)
SIGNING_ENABLED=$(git config commit.gpgsign)
MAX_DIFF_LINES=50

echo "--- [Antigravity AI] Running Pre-commit Gate ---"

# 0. Size Gate (Atomic Enforcement)
DIFF_LINES=$(git diff --cached | wc -l | xargs)
if [[ "$DIFF_LINES" -gt "$MAX_DIFF_LINES" ]]; then
  echo -e "\x1b[31m[ERROR] Size Violation: This commit changes $DIFF_LINES lines.\x1b[0m"
  echo "The current atomic limit is $MAX_DIFF_LINES lines. Please split your changes."
  exit 1
fi

# 1. Block 'primary' branch commits for AI
if [[ "$BRANCH" == "primary" && "$USER_NAME" == "Antigravity AI" ]]; then
  echo -e "\x1b[31m[ERROR] Illegal Action: Antigravity AI is forbidden from committing to 'primary'.\x1b[0m"
  echo "Please switch to a feature branch (ai/...) and use a Pull Request."
  exit 1
fi

# 2. Ensure Identity is set to AI
if [[ "$USER_NAME" != "Antigravity AI" ]]; then
  echo -e "\x1b[33m[WARNING] Identity Mismatch: committing as '$USER_NAME' instead of 'Antigravity AI'.\x1b[0m"
  # Optional: force fail if we want to be strict
fi

# 3. Ensure Signing is enabled
if [[ "$SIGNING_ENABLED" != "true" ]]; then
  echo -e "\x1b[31m[ERROR] Security Violation: Commit signing (gpgsign) is disabled.\x1b[0m"
  exit 1
fi

echo -e "\x1b[32m[PASS] Mechanical Gate passed. Proceeding with atomic commit.\x1b[0m"
exit 0
