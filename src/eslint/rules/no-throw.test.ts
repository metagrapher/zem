import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { noThrow as rule } from './no-throw.ts'

describe('eslint-rule: no-throw', () => {
    it('should be an ESLint rule object', () => {
        assert.ok(rule.create)
        assert.ok(rule.meta)
    })
})
