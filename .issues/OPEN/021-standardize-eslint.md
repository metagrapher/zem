---
title: Standardize ESLint Coverage
status: OPEN
gh_number: 21
---

## Description
The current `eslint.config.js` is fragmented and uses restrictive file patterns (missing `.mjs`) and directory-specific overrides. This leads to inconsistent linting coverage across the project.

## Tasks
- [ ] Expand global file patterns to include `.ts`, `.js`, `.mjs`, and `.cjs`.
- [ ] Merge disparate configuration blocks to ensure all code files receive project-wide rules.
- [ ] Uniformly apply Node.js globals to scripts, tests, and build tools.
- [ ] Verify coverage by running `eslint .` on the entire project root.
