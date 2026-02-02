import { describe, it, expect } from 'vitest'
import { leadingCommas as rule } from './leading-commas'

describe('eslint-rule: leading-commas', () => {
    it('should be an ESLint rule object', () => {
        expect(rule).toHaveProperty('create')
        expect(rule).toHaveProperty('meta')
    })
})
