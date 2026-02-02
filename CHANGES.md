# Changelog

## [1.1.0] - 2026-02-02

### Added
- **ZEM ESLint Plugin**: Enforces `no-loops`, `no-throw`, `no-any`, and `leading-commas`.
- **Flat Config Support**: ESLint plugin is now compatible with ESLint 9's Flat Config system.
- **Inspiration Documentation**: Added `docs/INSPIRATION.md` detailing the influence of JSF C++ Coding Standards.
- **Core Hardening**: Refactored `Result` algebra and web logic to replace `any` with `unknown` and improve error handling.

### Fixed
- **Type Safety**: Improved type resolution for ESLint rules.
- **Build Process**: Resolved `dist/` permission issues and hardened `tsup` configuration.
### Chores
- **Git Hygiene**: Added comprehensive `.gitignore` and removed tracked artifacts (`node_modules/`, `dist/`).
- **Enforcement**: Added `@metagrapher/zem/no-long-files` ESLint rule to enforce the 150-line limit.
- **Specification**: Updated `docs/SPECIFICATION.md` to formally document the 150-line granularity rule.
