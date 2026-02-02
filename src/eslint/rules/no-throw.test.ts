import { describe, it, expect } from 'vitest'
import { noThrow as rule } from './no-throw'

describe('eslint-rule: no-throw', () => {
    it('should be an ESLint rule object', () => {
        expect(rule).toHaveProperty('create')
        expect(rule).toHaveProperty('meta')
    })
})
