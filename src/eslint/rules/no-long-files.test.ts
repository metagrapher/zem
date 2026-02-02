import { describe, it, expect } from 'vitest'
import { noLongFiles as rule } from './no-long-files'

describe('eslint-rule: no-long-files', () => {
    it('should be an ESLint rule object', () => {
        expect(rule).toHaveProperty('create')
        expect(rule).toHaveProperty('meta')
    })
})
