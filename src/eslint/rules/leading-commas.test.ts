import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { leadingCommas as rule } from './leading-commas.ts'

describe('eslint-rule: leading-commas', () => {
    it('should be an ESLint rule object', () => {
        assert.ok(rule.create)
        assert.ok(rule.meta)
    })
})
