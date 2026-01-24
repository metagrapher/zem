# @zem/core

> **Zero-Exception Monadic Methodology (ZEM)**: A rigorous functional programming toolkit for building resilient, non-throwing applications.

## Core Philosophy

`@zem/core` is built on the **Zero-Exception Methodology**. It enforces a strict "Never Throw" policy, replacing exceptions with monadic `Result<T, E>` types and composable logic pipelines.

- **No Try-Catch**: Use `Result` and `chain/map` instead.
- **Pure Functions**: No side-effects without explicit `IO` or `State` wrappers.
- **Hardware Emulation**: Treating software state with the reliability of hardware components.

## Install

```bash
npm install @zem/core
```

## Usage

### Result Algebra

```typescript
import { Ok, Err, map, chain } from '@zem/core'

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
import { choice, Err, Ok } from '@zem/core'

const val = choice(
  Err('fail'),
  Ok('success'),
  Ok('ignored')
) // Ok('success')
```

## Directives

For full compliance with ZEM, projects should:
1. Forbid `try-catch` blocks in application logic.
2. Use `Result<T, E>` as the return type for all non-trivial logic.
3. Validate all inputs at the boundary using `safeJSON` or similar.

---
See [SPECIFICATION.md](./docs/SPECIFICATION.md) for the full methodology.
