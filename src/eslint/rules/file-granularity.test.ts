import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fileGranularity as rule } from './file-granularity.ts'

describe('eslint-rule: file-granularity', () => {
    it('should be an ESLint rule object', () => {
        assert.ok(rule.create)
        assert.ok(rule.meta)
    })
})
