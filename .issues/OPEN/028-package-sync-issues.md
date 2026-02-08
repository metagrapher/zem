---
title: "Package Issue Sync Logic into ZEM CLI"
status: OPEN
gh_number: 28
---
## Description
To enable other projects to easily adopt the "Infrastructure as Code" issue management workflow, we will package the `sync-issues.mjs` script into the core `zem` library as a CLI command. This eliminates the need for manual script copying and ensures all projects benefit from upstream improvements.

## Tasks
- [x] Promote `@octokit/rest` and `front-matter` to `dependencies` in `package.json`.
- [x] Create `src/cli/` directory structure.
- [x] Refactor `scripts/sync-issues.mjs` into strictly typed TypeScript at `src/cli/sync-issues.ts`.
- [x] Create a CLI entry point (e.g., `bin/zem.js` or `src/cli/index.ts`) to route commands.
- [x] Register the `bin` entry in `package.json`.
- [x] update the `.github/workflows/issues.yml` to use `npx zem sync-issues` instead of the local script.
- [x] Verify the new CLI command works correctly with strict TypeScript compilation.
