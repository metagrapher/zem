import { describe, it, expect } from 'vitest'
import { Ok, Err } from '../algebra/Result'
import { chain, map, fold, sequence, tap } from './transform'

describe('transform', () => {
    it('chain should bind Ok values', () => {
        expect(chain(Ok(10), n => Ok(n * 2))).toEqual(Ok(20))
        expect(chain(Err('fail'), n => Ok(n * 2))).toEqual(Err('fail'))
    })

    it('map should transform Ok values', () => {
        expect(map(Ok(10), n => n + 5)).toEqual(Ok(15))
        expect(map(Err('fail'), n => n + 5)).toEqual(Err('fail'))
    })

    it('fold should transform both cases', () => {
        const ok = (n: number) => n + 1
        const err = (s: string) => s.length
        expect(fold(Ok(10), { ok, err })).toBe(11)
        expect(fold(Err('fail'), { ok, err })).toBe(4)
    })

    it('sequence should flip array of Results', () => {
        expect(sequence([Ok(1), Ok(2)])).toEqual(Ok([1, 2]))
        expect(sequence([Ok(1), Err('fail')])).toEqual(Err('fail'))
        expect(sequence([Err('fail'), Ok(1)])).toEqual(Err('fail'))
    })

    it('tap should execute side effect only for Ok', () => {
        let x = 0
        tap(Ok(10), n => { x = n })
        expect(x).toBe(10)
        
        let y = 0
        tap(Err('fail'), (n: number) => { y = n })
        expect(y).toBe(0)
    })
})
