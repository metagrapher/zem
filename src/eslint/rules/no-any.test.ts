import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { noAny as rule } from './no-any.ts'

describe('eslint-rule: no-any', () => {
    it('should be an ESLint rule object', () => {
        assert.ok(rule.create)
        assert.ok(rule.meta)
    })
})
