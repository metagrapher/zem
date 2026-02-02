import { describe, it, expect } from 'vitest'
import { noAny as rule } from './no-any'

describe('eslint-rule: no-any', () => {
    it('should be an ESLint rule object', () => {
        expect(rule).toHaveProperty('create')
        expect(rule).toHaveProperty('meta')
    })
})
