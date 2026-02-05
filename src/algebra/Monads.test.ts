import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { identity, constant } from '../logic/composition.ts'

describe('Monads', () => {
    it('identity should return the value', () => {
        assert.equal(identity(10), 10)
    })

    it('constant should return a function that returns the value', () => {
        const c = constant(10)
        assert.equal(c(), 10)
    })
})
