---
title: "RFC: Data-Last Transformation API for Pipelining"
status: OPEN
---

## Context
Functional programming ergonomics heavily favor "Data-Last" arguments to enable currying and pipelining. Currently, ZEM's core algebra functions (`chain`, `map`, `fold`) are "Data-First" (`(result, fn)`), which makes `pipe` composition verbose or impossible without lambda wrappers.

## Proposal
Refactor the core algebra to support Data-Last arguments, enabling direct composition:

```typescript
// Current (Data-First)
const res = chain(result, fn)

// Proposed (Data-Last)
const res = chain(fn)(result)

// Enabled Pipeline
pipe(
  Ok(10),
  chain(n => Ok(n + 1)),
  map(n => n * 2)
)
```

## Strategy
This is a **Breaking Change**. We must:
1.  Introduce `chainLast`, `mapLast` (or similarly named exports) in minor version `1.x`.
2.  Deprecate current usage.
3.  Switch default exports in `2.0`.

## Tasks
- [ ] draft implementation of `chainLast`, `mapLast`.
- [ ] verify performance impact.
- [ ] release in experimental channel.
