import { describe, it, expect } from 'vitest'
import { Ok, Err } from '../algebra/Result'
import { chain, map, fold, sequence, tap } from './transform'

describe('transform', () => {
    it('chain should bind Ok values', () => {
        expect(chain(Ok(10), n => Ok(n * 2))).toEqual(Ok(20))
    })

    it('map should transform Ok values', () => {
        expect(map(Ok(10), n => n + 5)).toEqual(Ok(15))
    })

    it('fold should transform both cases', () => {
        const ok = (n: number) => n + 1
        const err = (s: string) => s.length
        expect(fold(Ok(10), { ok, err })).toBe(11)
        expect(fold(Err('fail'), { ok, err })).toBe(4)
    })

    it('sequence should flip array of Results', () => {
        expect(sequence([Ok(1), Ok(2)])).toEqual(Ok([1, 2]))
    })

    it('tap should execute side effect for Ok', () => {
        let x = 0
        tap(Ok(10), n => { x = n })
        expect(x).toBe(10)
    })
})
