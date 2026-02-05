import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { toHex, fromHex } from './hex.ts'

describe('hex', () => {
    it('toHex/fromHex should be isomorphic', () => {
        const buffer = new Uint8Array([1, 2, 3]).buffer
        const hex = toHex(buffer)
        assert.deepEqual(fromHex(hex), new Uint8Array(buffer))
    })

    it('fromHex should handle empty string', () => {
        assert.deepEqual(fromHex(''), new Uint8Array([]))
    })
})
