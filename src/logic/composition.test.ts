import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pipe, compose, curry } from './composition.ts'

describe('composition', () => {
    it('pipe should compose left-to-right', () => {
        const add1 = (n: number) => n + 1
        assert.equal(pipe(5, add1), 6)
    })

    it('compose should compose right-to-left', () => {
        const add1 = (n: number) => n + 1
        const double = (n: number) => n * 2
        assert.equal(compose(add1, double)(5), 11)
    })

    it('curry should partially apply functions', () => {
        const add = (a: number, b: number) => a + b
        assert.equal(curry(add)(5)(10), 15)
    })
})
