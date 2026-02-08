#!/bin/bash
# Antigravity AI: ZEM Mechanical Gate (Commit-msg)
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Allow bypass for synchronization tasks
if [[ "$COMMIT_MSG" == *"chore(sync)"* ]]; then
  exit 0
fi

if ! echo "$COMMIT_MSG" | grep -qE "#[0-9]+"; then
  echo -e "\x1b[31m[ERROR] Format Violation: Every commit message must contain an issue reference (e.g., #123).\x1b[0m"
  exit 1
fi

exit 0
