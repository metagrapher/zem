import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { init } from './init.ts'

describe('CLI: Init', () => {
    it('exports init function', () => {
        assert.ok(typeof init === 'function')
    })
})
