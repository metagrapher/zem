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
- **Monadic Pipelines**: Logic is composed via `chain` and `map`, ensuring errors are handled explicitly at every step.
- **No Try-Catch**: Application logic is purely functional. `try-catch` is banned outside of framework boundaries.

### 2. Structural Integrity (Static Enforcement)
**The Problem**: Developers drift. Without constant vigilance, "quick hacks" become technical debt.
**The ZEM Solution**:
- **Strict Linting**: Custom ESLint rules that forbid `throw`, `any`, and loops, enforcing functional purity.
- **Verification Gating**: A CLI that refuses to let you commit code unless it passes 100% coverage, type checks, and linting.

### 3. Atomic TDD (Process Discipline)
**The Problem**: Features are often sprawling, untracked, or merged without rigorous proof of correctness.
**The ZEM Solution**:
- **Infrastructure as Code Issues**: Requirements are markdown files in `.issues/OPEN/`. They are tracked, versión-controlled, and synced to GitHub.
- **The "Red-Green" Cycle**: You cannot merge code without a failing test (The Proof) and a passing test (The Solution).

---

## The Toolkit

ZEM packages these three pillars into a single installable standard.

### 📦 1. The Runtime Algebra (`@metagrapher/zem`)
The functional primitives to write crash-proof code.

```typescript
import { Ok, Err, chain, pipe } from '@metagrapher/zem'

// safeDivision returns a Result, never throws
const safeDivision = (a: number, b: number) => 
  b === 0 ? Err('DIVIDE_BY_ZERO') : Ok(a / b)

// Composable logic pipeline
const calculate = (input: number) => pipe(
  Ok(input),
  chain(n => safeDivision(n, 2)), // Error handling built-in
  map(n => n + 5)
) 
```

### 🛡️ 2. The Guardrails (ESLint Plugin)
Enforce the methodology automatically.

**In `eslint.config.js`:**
```javascript
import zem from "@metagrapher/zem/eslint"; // ZEM's strict rules

export default [
  zem.configs.specA, // Standard: Enforces no-throw, no-loops, small files
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

```bash
npm install @metagrapher/zem
```

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

---

**ZEM** is the standard for high-reliability engineering.
See [SPECIFICATION.md](./docs/SPECIFICATION.md) for deeper architectural details.
