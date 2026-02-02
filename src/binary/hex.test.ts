import { describe, it, expect } from 'vitest'
import { toHex, fromHex } from './hex'

describe('hex', () => {
    it('toHex/fromHex should be isomorphic', () => {
        const buffer = new Uint8Array([1, 2, 3]).buffer
        const hex = toHex(buffer)
        expect(fromHex(hex)).toEqual(new Uint8Array(buffer))
    })
})
