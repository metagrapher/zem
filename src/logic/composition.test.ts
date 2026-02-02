import { describe, it, expect } from 'vitest'
import { pipe, compose, curry } from './composition'

describe('composition', () => {
    it('pipe should compose left-to-right', () => {
        const add1 = (n: number) => n + 1
        expect(pipe(5, add1)).toBe(6)
    })

    it('compose should compose right-to-left', () => {
        const add1 = (n: number) => n + 1
        const double = (n: number) => n * 2
        expect(compose(add1, double)(5)).toBe(11)
    })

    it('curry should partially apply functions', () => {
        const add = (a: number, b: number) => a + b
        expect(curry(add)(5)(10)).toBe(15)
    })
})
