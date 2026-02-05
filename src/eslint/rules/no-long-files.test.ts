import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { noLongFiles as rule } from './no-long-files.ts'

describe('eslint-rule: no-long-files', () => {
    it('should be an ESLint rule object', () => {
        assert.ok(rule.create)
        assert.ok(rule.meta)
    })
})
