import { describe, it, expect } from 'vitest'
import { fileGranularity as rule } from './file-granularity'

describe('eslint-rule: file-granularity', () => {
    it('should be an ESLint rule object', () => {
        expect(rule).toHaveProperty('create')
        expect(rule).toHaveProperty('meta')
    })
})
