title: Reorganize Verification and Integration Tests
status: OPEN
---
## Description
Current verification and integration tests (e.g., `issue-007.test.mjs`) are incorrectly placed in the `scripts/` directory. These should be moved to the legacy-empty `tests/` directory to maintain proper project organization and separate operational scripts from test verification logic.

## Tasks
- [ ] Move `scripts/issue-007.test.mjs` to `tests/`.
- [ ] Move `scripts/failing-tdd.test.mjs` to `tests/`.
- [ ] Move `scripts/verify-metadata-preservation.test.mjs` to `tests/`.
- [ ] Update `package.json` test scripts to include the `tests/` directory.
- [ ] Verify full audit (`npm run zem`) passes after reorganization.
- [ ] Update `test_ref` in closed issues to point to new locations.
