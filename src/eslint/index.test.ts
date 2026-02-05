import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { rules, configs } from './index.ts'

describe('index', () => {
    it('rules should correspond to requirements', () => {
        assert.ok(rules)
    })

    it('configs should correspond to requirements', () => {
        assert.ok(configs)
    })

})
