import test from 'node:test'
import assert from 'node:assert/strict'
import { audit } from './audit.ts'

test('Audit engine initialization', () => {
    assert.strictEqual(typeof audit, 'function', 'Audit should be a function')
})
