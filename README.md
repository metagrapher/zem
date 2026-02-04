# @metagrapher/zem

> **Zero-Exception Monadic Methodology (ZEM)**: A rigorous functional programming toolkit for building resilient, non-throwing applications.

## Core Philosophy

`@metagrapher/zem` is built on the **Zero-Exception Methodology**. It enforces a strict "Never Throw" policy, replacing exceptions with monadic `Result<T, E>` types and composable logic pipelines.

- **No Try-Catch**: Use `Result` and `chain/map` instead.
- **Pure Functions**: No side-effects without explicit `IO` or `State` wrappers.
- **Hardware Emulation**: Treating software state with the reliability of hardware components.

## Install

```bash
npm install @metagrapher/zem
```

## Usage

### Result Algebra

```typescript
import { Ok, Err, map, chain } from '@metagrapher/zem'

const safeDivision = (a: number, b: number) => 
  b === 0 ? Err('DIVIDE_BY_ZERO') : Ok(a / b)

const result = pipe(
  Ok(10),
  chain(n => safeDivision(n, 2)),
  map(n => n + 5)
) // Ok(10)
```

### Monadic Choice

```typescript
import { choice, Err, Ok } from '@metagrapher/zem'

const val = choice(
  Err('fail'),
  Ok('success'),
  Ok('ignored')
) // Ok('success')
```

## Terminal Gating

ZEM enforces a strict "Terminal Gating" policy to ensure code reliability and structural integrity before any commit is accepted.

### Enforcement Rules
1. **100% Code Coverage**: Every line, branch, and function must be verified by Vitest.
2. **Structural Integrity**: Every source file in `src/` (including `.ts`, `.js`, `.astro`, `.css`, `.wasm`) must have a corresponding `.test.ts` or `.spec.ts` file.
3. **Linting & Types**: Full ESLint compliance and TypeScript error-free execution.

### Installation
To install the pre-commit hook in your local environment, run:
```bash
node scripts/setup-hooks.js
```
This will automatically link the verification scripts to your git commit process.

### Manual Verification
You can run the full audit at any time:
```bash
npm run zem
```

## Automatic Test Scaffolding

To maintain 100% structural integrity without manual boilerplate, use the automatic test scaffold watcher:

```bash
npm run watch:tests
```

This script:
1. **Watches** `src/` for any new code files.
2. **Performs an Initial Scan** on startup to catch any missing verification contexts.
3. **Automatically Scaffolds** tailored `.test.ts` files with named imports and basic verification suites.

## Directives

For full compliance with ZEM, projects should:
1. Forbid `try-catch` blocks in application logic.
2. Use `Result<T, E>` as the return type for all non-trivial logic.
3. Validate all inputs at the boundary using `safeJSON` or similar.

## 🛠 Linting & Enforcement

ZEM requirements are strictly enforced via the included ESLint plugin.

### Installation

In your `eslint.config.js` (Flat Config):

```javascript
import zem from "@metagrapher/zem/eslint";

export default [
  // ... your other configs
  {
    plugins: {
      "@metagrapher/zem": zem,
    },
    rules: {
      "@metagrapher/zem/no-loops": "error",
      "@metagrapher/zem/no-throw": "error",
      "@metagrapher/zem/no-any": "error",
      "@metagrapher/zem/leading-commas": "warn",
    },
  },
];
```

Or use the recommended preset:

```javascript
import zem from "@metagrapher/zem/eslint";

export default [
  zem.configs.specA, // Standard: 75 lines max, 40 lines warning
];
```

For projects that require larger file sizes, use Spec B:

```javascript
export default [
  zem.configs.specB, // Alternative: 150 lines max, 75 lines warning
];
```

---
See [SPECIFICATION.md](./docs/SPECIFICATION.md) for the full methodology and [INSPIRATION.md](./docs/INSPIRATION.md) for our engineering standards.
