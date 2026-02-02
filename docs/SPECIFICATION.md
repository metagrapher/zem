# Zero-Exception Methodology (ZEM)

The Zero-Exception Methodology is a set of rigorous coding standards designed for real-time, mission-critical environments. In the context of our arcade, an "error" is equivalent to "death"—a failure to handle an edge case can lead to state corruption, session loss, or a broken player experience.

## Core Principles

### 1. The Result Pattern (No try-catch)
We do not use `try-catch` blocks for control flow or error handling. Instead, all functions that can fail must return a `Result<T, E>` type. Errors are treated as data, not as side effects that halt execution.

```typescript
type Result<T, E = string> = 
    | { ok: true; value: T }
    | { ok: false; error: E }
```

- **Rule**: Only `do`. Never `try`.
- **Reasoning**: `try-catch` encourages developers to ignore specific error states in favor of a "catch-all" block. Explicitly handling `Err` forces the developer to consider every failure mode.

### 2. UI as Physical Hardware
The user interface is treated as a piece of physical equipment. Layout shifts are mechanical failures. State transitions (e.g., loading, scanning, error) must be reflected aggressively and consistently.
- **Rule**: Every interaction must have an immediate feedback loop.
- **Visuals**: Use status codes (e.g., `IDENT_SCAN`, `AUTH_BUSY`) to show that the system is "working".

### 3. Strict Typing
We operate in a type-safe environment to catch errors at compile time.
- **Rule**: No `any`. No implicit type conversions. 
- **Rule**: Use specific unit types and enums over generic strings or numbers.

### 4. Untrusted Input
Every function must treat its parameters as untrusted, regardless of the source (network, local storage, or internal call).
- **Rule**: Validate all parameters at the boundary of every function.
- **Rationale**: This prevents "poisoned" data from propagating through the system.

### 5. Test Driven Development (TDD)
No logic code is written without a preceding failing test.
- **Flow**: RED (write failing test) -> GREEN (write code to pass) -> REFACTOR (clean up).
- **Rule**: All exported functions must have comprehensive unit tests covering all branch conditions.

### 6. No Loops
Loops (`for`, `while`, `do...while`) are forbidden. They are prone to off-by-one errors and state mutations that are difficult to track.
- **Rule**: Use functional methods (`map`, `filter`, `reduce`, `every`, `some`) that always return a value.
- **Rule**: Use recursion for complex iterative logic.

### 7. Functional Purity & Composability
We prefer pure functions that generate no side effects.

### 7. Performance Consciousness
We optimize for the lowest possible overhead.
- **Binary First**: Use `ArrayBuffers` and `Uint8Arrays` for data manipulation.
- **WASM**: Move complex logic to WebAssembly when performance gains are measurable.

## Monadic Foundations & Algebra

To support the Zero-Exception Methodology, we employ algebraic structures that allow for safe, composable logic flow.

- **Functor**: An algebraic structure that allows a function to be applied to a value inside a "container" (like `Result`) without altering the structure itself. In ZEM, `Result` is a Functor because `map` transforms the `Ok` value while preserving the `Err` state.
- **Monad**: A Functor with additional capabilities: `unit` (our `Ok`) and `bind` (our `chain`). It enables the flat-mapping of computations that return the same monadic type, allowing for sequential, dependency-aware logic chains that short-circuit on failure.
- **Maybe**: A monad representing a value that may or may not exist (`Just T` or `Nothing`), avoiding nullable references.
- **IO**: A monad that encapsulates side-effects (DOM, network, random) into a lazy computation, keeping internal logic pure.
- **State**: A monad that manages state transformations (`S -> [T, S]`) without mutable global variables.
- **Monadic Choice**: The "Alternative" pattern, allowing for the selection of the first successful path among multiple monadic computations.

### 9. File Length & Granularity (Spec A vs Spec B)
To maintain mental model clarity and hardware-like specificity, source files must be atomic and highly focused.
- **Spec A (Standard)**: 75-line hard limit (Error), 40-line warning threshold.
- **Spec B (Alternative)**: 150-line hard limit (Error), 75-line warning threshold.
- **Rationale**: Smaller files are easier to reason about, test in isolation, and transfer to workers with zero memory overhead.

---
*This document serves as the technical definition for our coding standards. Adherence is non-negotiable.*
