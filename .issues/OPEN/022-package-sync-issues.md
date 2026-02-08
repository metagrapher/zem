---
title: Package Issue Sync Logic into ZEM CLI
status: OPEN
---

## Description
To enable other projects to easily adopt the "Infrastructure as Code" issue management workflow, we will package the `sync-issues.mjs` script into the core `zem` library as a CLI command. This eliminates the need for manual script copying and ensures all projects benefit from upstream improvements.

## Tasks
- [ ] Promote `@octokit/rest` and `front-matter` to `dependencies` in `package.json`.
- [ ] Create `src/cli/` directory structure.
- [ ] Refactor `scripts/sync-issues.mjs` into strictly typed TypeScript at `src/cli/sync-issues.ts`.
- [ ] Create a CLI entry point (e.g., `bin/zem.js` or `src/cli/index.ts`) to route commands.
- [ ] Register the `bin` entry in `package.json`.
- [ ] update the `.github/workflows/issues.yml` to use `npx zem sync-issues` instead of the local script.
- [ ] Verify the new CLI command works correctly with strict TypeScript compilation.
