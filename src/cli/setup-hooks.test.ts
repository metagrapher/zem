import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { setupHooks } from './setup-hooks.ts'

describe('CLI: Setup Hooks', () => {
    it('exports setupHooks function', () => {
        assert.ok(typeof setupHooks === 'function')
    })
})
