# Inspiration & Standards

The **Zero-Exception Methodology (ZEM)** is deeply influenced by high-reliability engineering standards used in aviation and aerospace. The primary "Flight Manual" for this philosophy is the **Joint Strike Fighter Air Vehicle C++ Coding Standards**.

## Primary Reference

[Joint Strike Fighter Air Vehicle C++ Coding Standards (Doc. 2RDU00001 Rev. C)](./JSF-Air-Vehicle-C++-Coding-Standards.pdf) ([Remote Mirror](https://github.com/tpn/pdfs/blob/master/Joint%20Strike%20Fighter%20Air%20Vehicle%20C%2B%2B%20Coding%20Standards%20-%20Dec%202005%20(Doc.%202RDU00001%20Rev.%20C).pdf))

## Philosophical Alignment

Treating software as a physical machine requires moving from "best guesses" to "bounded execution space." The following JSF principles are core to the ZEM methodology:

### 1. Bounded Guarantees
Rules like **AV Rule 119 (No recursion)** and **AV Rule 189 (Deterministic loops)** force a shift toward Total Functions. In ZEM, we ensure that every operation has a mathematically guaranteed termination state. For example, our algorithms move from unbounded recursion to logic where iteration depth is a static property of the input size (e.g., $log_2(\text{count})$).

### 2. Stack Predictability
In multi-threaded web environments (Cloudflare Workers, Web Workers), maintaining a shallow and predictable stack is critical. By avoiding deep recursion and complex exception propagation, we prevent "silent deaths" and non-deterministic memory pressure in high-traffic scenarios.

### 3. The "Safety Subset"
Just as the JSF standard created a "Safer Subset" of C++, ZEM creates a "Safer Subset" of JavaScript/TypeScript. Our bans on `for`, `while`, `throw`, and `any` are not stylistic choices; they are structural boundaries designed to eliminate entire classes of runtime failures.

### 4. Hardware Emulation
The UI and application state are treated as physical hardware. Failure is not an "Error" to be caught, but a state to be signaled (e.g., "NO SIGNAL" or "NO POWER"). This reflects the JSF approach where subsystems must fail gracefully and the main system must continue to operate.
