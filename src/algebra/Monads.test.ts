import { describe, it, expect } from 'vitest'
import { identity, constant } from '../logic/composition'

describe('Monads', () => {
    it('identity should return the value', () => {
        expect(identity(10)).toBe(10)
    })

    it('constant should return a function that returns the value', () => {
        const c = constant(10)
        expect(c()).toBe(10)
    })
})
