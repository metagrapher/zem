import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Ok, Err, type Result } from '../src/algebra/Result.ts'
import { pipe } from '../src/logic/composition.ts'
import { chain, map } from '../src/logic/transform.ts'

// Verify usage pattern 1: Inline Pipelining
const add = (a: number) => (b: number) => a + b
// Current API requires explicit wrappers for pipe
// Verified Helper Types
const chainL = <T, E, U>(fn: (v: T) => Result<U, E>) => (res: Result<T, E>) => chain(res, fn)
const mapL = <T, E, U>(fn: (v: T) => U) => (res: Result<T, E>) => map(res, fn)

describe('Documentation Code Verification', () => {
    it('Usage Example 1 operates correctly', () => {
        const safeDivision = (a: number, b: number) => 
            b === 0 ? Err('DIVIDE_BY_ZERO') : Ok(a / b)

        const calculate = (input: number) => pipe(
            Ok(input),
            chainL((n: number) => safeDivision(n, 2)),
            mapL((n: number) => n + 5)
        )
        
        assert.deepEqual(calculate(10), Ok(10))
        assert.deepEqual(calculate(20), Ok(15))
    })
})
