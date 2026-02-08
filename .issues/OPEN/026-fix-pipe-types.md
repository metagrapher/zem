---
title: Fix `pipe` returning `any` (loss of type safety)
status: OPEN
---

## Context
The current implementation of `pipe` in `src/logic/composition.ts` returns `any`:

```typescript
export const pipe = <T>(value: T, ...fns: Function[]): any =>
    fns.reduce((acc, fn) => fn(acc), value)
```

This breaks type safety at the end of a pipeline, violating "Zero Exception Methodology" tenets by allowing unsafe operations on the result without compilation errors.

## Requirement
Update `pipe` and `compose` to use TypeScript Variadic Tuple Types to correctly infer the return type of the pipeline based on the last function in the chain.

## Acceptance Criteria
1. `pipe` return type is strictly inferred.
2. `compose` return type is strictly inferred.
3. Verify with a test that incorrectly typed operations on the result cause a TS error.
