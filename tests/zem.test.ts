import { describe, it, expect } from 'vitest'
import {
    Ok
    , Err
    , choice
    , chain
    , map
    , fold
    , sequence
    , tap
    , pipe
    , compose
    , curry
    , identity
    , constant
    , toHex
    , fromHex
} from '../src/index'

describe('@zem/core: Monadic Helpers', () => {
    it('choice: should return the first Ok result', () => {
        expect(choice(Err('fail'), Ok('success'))).toEqual(Ok('success'))
    })

    it('chain: should bind Ok values', () => {
        expect(chain(Ok(10), n => Ok(n * 2))).toEqual(Ok(20))
    })

    it('map: should transform Ok values', () => {
        expect(map(Ok(10), n => n + 5)).toEqual(Ok(15))
    })

    it('sequence: should flip array of Results', () => {
        expect(sequence([Ok(1), Ok(2)])).toEqual(Ok([1, 2]))
    })
})

describe('@zem/core: Functional Helpers', () => {
    it('pipe: should compose left-to-right', () => {
        const add1 = (n: number) => n + 1
        expect(pipe(5, add1)).toBe(6)
    })

    it('curry: should partially apply functions', () => {
        const add = (a: number, b: number) => a + b
        expect(curry(add)(5)(10)).toBe(15)
    })
})

describe('@zem/core: Binary Hex', () => {
    it('toHex/fromHex: should be isomorphic', () => {
        const buffer = new Uint8Array([1, 2, 3]).buffer
        const hex = toHex(buffer)
        expect(fromHex(hex)).toEqual(new Uint8Array(buffer))
    })
})
