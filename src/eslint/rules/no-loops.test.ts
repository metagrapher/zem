import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { noLoops as rule } from './no-loops.ts'

describe('eslint-rule: no-loops', () => {
    it('should be an ESLint rule object', () => {
        assert.ok(rule.create)
        assert.ok(rule.meta)
    })
})
