import { describe, it, expect } from 'vitest'
import { noLoops as rule } from './no-loops'

describe('eslint-rule: no-loops', () => {
    it('should be an ESLint rule object', () => {
        expect(rule).toHaveProperty('create')
        expect(rule).toHaveProperty('meta')
    })
})
