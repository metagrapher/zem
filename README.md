# @metagrapher/zem

> **Zero Exception Methodology (ZEM)**: A rigorous toolkit for building resilient, predictable, and fault-tolerant software.

---

ZEM isn't just a library; it's a **disciplined engineering methodology**. It exists because modern software development is plagued by "silent failures" (unhandled exceptions, loose types, and undisciplined state).

ZEM provides the **Core Algebra**, **Enforcement Guardrails**, and **Process Automation** necessary to guarantee software reliability at the structural level.

## The ZEM Methodology

### 1. Zero Exceptions (Runtime Safety)
**The Problem**: Throwing errors (`throw new Error`) is a "GOTO" statement that destroys control flow and crashes processes.
**The ZEM Solution**:
- **Result Types**: All operations return `Result<T, E>`. Success or Failure is a first-class value, not a side effect.
- **Monadic Pipelines**: Logic is composed via composition functions, ensuring errors are handled explicitly at every step.
- **No Try-Catch**: Application logic is purely functional. `try-catch` is banned outside of framework boundaries.

### 2. Structural Integrity (Static Enforcement)
**The Problem**: Developers drift. Without constant vigilance, "quick hacks" become technical debt.
**The ZEM Solution**:
- **Strict Linting**: Custom ESLint rules that forbid `throw`, `any`, and loops, enforcing functional purity.
- **Verification Gating**: A CLI that refuses to let you commit code unless it passes 100% coverage, type checks, and linting.

### 3. Atomic TDD (Process Discipline)
**The Problem**: Features are often sprawling, untracked, or merged without rigorous proof of correctness.
**The ZEM Solution**:
- **Infrastructure as Code Issues**: Requirements are markdown files in `.issues/OPEN/`. They are tracked, version-controlled, and synced to GitHub.
- **The "Red-Green" Cycle**: You cannot start code without a passing test (The Proof) and a failing test (The Solution) and you cannot merge code without a failing test (The Proof) and a passing test (The Solution).

---

## The Toolkit

ZEM packages these three pillars into a single installable standard.

### 📦 1. The Runtime Algebra (`@metagrapher/zem`)
The functional primitives to write crash-proof code.

#### Basic Usage

```typescript
import { Ok, Err, chain, map } from '@metagrapher/zem'

// safeDivision returns a Result, never throws
const safeDivision = (a: number, b: number) => 
  b === 0 ? Err('DIVIDE_BY_ZERO') : Ok(a / b)

const result = safeDivision(10, 2)
const next = map(result, n => n + 5) // Ok(10)
```

> **Note**: This pattern is known as **[Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)**. The `map` function keeps you on the "success track". If an error occurs, the code switches to the "failure track" and skips subsequent operations safely.

### Why is this better?

The core principle of ZEM is that the **failure is a value**.

When you call `safeDivision(1, 0)`, it does NOT crash or throw. It returns an object: `{ success: false, error: 'DIVIDE_BY_ZERO' }`.

If you try to use this result directly—like checking `safeDivision(1,0) + 5`—TypeScript will stop you: "Operator '+' cannot be applied to types 'Result' and 'number'."

**You cannot use the value until you handle the possibility of failure.**

If you ignore it, type checking stops you (Compile-Time Error).
If you handle it (using `map`, `chain`, or checking `.success`), your code is forced to decide what to do in the error case explicitly.

```typescript
const result = safeDivision(10, 0)

// ❌ UNSAFE: Using the result directly is blocked by TypeScript.
// console.log(result + 5) // Error: Operator '+' cannot be applied to type 'Result'

// ✅ SAFE: Use 'map' to transform the success case only.
// If result is an error, 'map' skips the computation and passes the error along.
const safeOutput = map(result, (n) => n + 5) 
```

This converts potential **Runtime Crashes** (app failure) into **Compile-Time Checks** (build failure).

### Why No Exceptions?

ZEM prohibits `throw` and `try/catch`, mirroring the **Joint Strike Fighter Air Vehicle C++ Coding Standards** (JSF AV) for safety-critical systems. We adapt these principles for modern TypeScript:

1.  **Reliability (No Invisible Control Flow)**:
    Exceptions define a hidden control flow path (a dynamic `GOTO`) that is invisible in the source code. In ZEM, control flow is always linear, explicit, and visible.

2.  **Complexity & Finite States**:
    When a function can throw, *every* line of code is a potential exit point. This explodes the complexity of the system.
    
    By returning `Result`, we reduce the state space to a manageable, finite set. This allows your application to behave like a reliable **Finite State Machine**. Simpler, linear code with fewer branches allows the CPU to execute instructions significantly faster.

3.  **Performance (Edge & Cloud)**:
    In serverless environments (Cloudflare Workers, AWS Lambda), "Wall Time" is money. Unhandled exceptions or deep stack traces cause expensive deoptimizations. 
    
    Explicit error handling ensures predictable performance profiles. Deterministic code allows JavaScript engines (V8) to optimize "hot paths" more effectively than code with unpredictable exception jumps.

4.  **Type Safety (The "Any" Trap)**:
    **This is the single biggest advantage.** TypeScript cannot type-check exceptions. A `catch (e)` block always receives `unknown` or `any`, forcing you to guess what went wrong. And if you're using implicit conversion, then you won't even know that the function can throw.
    
    `Result<Success, Failure>` transforms error handling from a runtime guessing game into a **compile-time contract**. You know *exactly* which errors a function can return, and the compiler forces you to handle them. This safety guarantee is impossible with standard `try/catch`.

#### Composition & Pipelining

ZEM is designed for composition. While the base functions (`map`, `chain`) are data-first, you can easily create data-last wrappers or simple composition helpers to build pipelines.

*Note: Future versions of ZEM will export data-last functions by default for easier pipelining.*

```typescript
import { Ok, Err, chain, map, pipe } from '@metagrapher/zem'

// Create simple data-last helpers for your project
const chainL = <Input, Error, Output>(fn: (v: Input) => Result<Output, Error>) => 
  (res: Result<Input, Error>) => chain(res, fn)

const mapL = <Input, Error, Output>(fn: (v: Input) => Output) => 
  (res: Result<Input, Error>) => map(res, fn)

// Now you can build clean pipelines with type safety
const calculate = (input: number) => pipe(
  Ok(input),
  chainL((n) => safeDivision(n, 2)), 
  mapL((n) => n + 5)
) 
```

### 🛡️ 2. The Guardrails (ESLint Plugin)
Enforce the methodology automatically.

**In `eslint.config.js`:**
```javascript
import zem from "@metagrapher/zem/eslint"; // ZEM's strict rules

export default [
  // ... your other configs
  {
    plugins: {
      "@metagrapher/zem": zem,
    },
    rules: {
      "@metagrapher/zem/no-loops": "error",     // Forbid for/while loops
      "@metagrapher/zem/no-throw": "error",     // Forbid throw statements
      "@metagrapher/zem/no-any": "error",       // Forbid 'any' type
      "@metagrapher/zem/leading-commas": "warn", // Aesthetic preference
    },
  },
];
```

Or use the recommended preset:

```javascript
import zem from "@metagrapher/zem/eslint";

export default [
  zem.configs.specA, // Standard: Enforces no-throw, no-loops, small files (75 lines max)
];
```

For projects that require larger file sizes, use Spec B:

```javascript
export default [
  zem.configs.specB, // Alternative: 150 lines max
];
```


### ⚙️ 3. The Process CLI (`zem`)
Automate the rigorous workflow.

#### Initialization
Scaffold the ZEM verification stack and strictly typed git hooks in any project:
```bash
npx zem init
```

#### Issue Management (Infrastructure as Code)
Manage your development tasks as code, kept in sync with GitHub Issues.
1. Create a task: `.issues/OPEN/001-fix-login.md`
2. Sync to GitHub:
```bash
npx zem sync-issues
```
3. Close the task by moving file to `.issues/CLOSED/`.

---

## Installation

To ensure stability and auditability, we strictly recommend installing ZEM via a specific commit hash:

```bash
npm install github:metagrapher/zem#a2b9d1b8b4dde6b8b73af3c55073e8b6c1fc6675
```

We do not publish to the public npm registry to prevent supply chain attacks and ensure all code is immutable.

## Developing with ZEM

### Terminal Gating
ZEM installs a `pre-commit` hook that blocks any commit that doesn't pass:
1. **Structural Audit**: Every file must have a test.
2. **Type Check**: Zero TypeScript errors.
3. **Lint**: Zero ESLint warnings.
4. **Test Coverage**: 100% coverage required.

To run the audit manually:
```bash
npm run zem
```

### Automatic Test Scaffolding
To maintain velocity without boilerplate fatigue, run the watcher. It instantly creates `.test.ts` files for any new code you write:
```bash
npm run watch:tests
```

This script:
1. **Watches** `src/` for any new code files.
2. **Performs an Initial Scan** on startup to catch any missing verification contexts.
3. **Automatically Scaffolds** tailored `.test.ts` files with named imports and basic verification suites.

---


**ZEM** is the standard for high-reliability engineering.
See [SPECIFICATION.md](./docs/SPECIFICATION.md) for deeper architectural details and [INSPIRATION.md](./docs/INSPIRATION.md) for our engineering standards.
