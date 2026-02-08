---
title: "Update README with Accurate ZEM Usage Examples"
status: OPEN
gh_number: 29
---
## Description
The current `README.md` examples for `pipe` and `chain` are aspirational and do not reflect the current `(data, ...args)` API of the library. To follow the ZEM methodology, our documentation must be strictly accurate.

## Objectives
- **Update Usage Examples**: Replace the implicit curried examples with explicit `curry` usage or data-first composition.
- **Explain Currying**: Add a dedicated section explaining why and how to use `curry` for composition.
- **Document Core Functions**: Provide clear, accurate examples for `Ok`, `Err`, `chain`, `map`, `fold`, `pipe`, `curry`, and `choice`.
- **Verify**: Ensure all documentation examples execute correctly against the current codebase.
