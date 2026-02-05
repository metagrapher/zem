import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Ok, Err } from '../algebra/Result.ts'
import { chain, map, fold, sequence, tap } from './transform.ts'

describe('transform', () => {
    it('chain should bind Ok values', () => {
        assert.deepEqual(chain(Ok(10), n => Ok(n * 2)), Ok(20))
        assert.deepEqual(chain(Err('fail'), (n: number) => Ok(n * 2)), Err('fail'))
    })

    it('map should transform Ok values', () => {
        assert.deepEqual(map(Ok(10), n => n + 5), Ok(15))
        assert.deepEqual(map(Err('fail'), (n: number) => n + 5), Err('fail'))
    })

    it('fold should transform both cases', () => {
        const ok = (n: number) => n + 1
        const err = (s: string) => s.length
        assert.equal(fold(Ok(10), { ok, err }), 11)
        assert.equal(fold(Err('fail'), { ok, err }), 4)
    })

    it('sequence should flip array of Results', () => {
        assert.deepEqual(sequence([Ok(1), Ok(2)]), Ok([1, 2]))
        assert.deepEqual(sequence([Ok(1), Err('fail')]), Err('fail'))
        assert.deepEqual(sequence([Err('fail'), Ok(1)]), Err('fail'))
    })

    it('tap should execute side effect only for Ok', () => {
        let x = 0
        tap(Ok(10), n => { x = n })
        assert.equal(x, 10)
        
        let y = 0
        tap(Err('fail'), (n: number) => { y = n })
        assert.equal(y, 0)
    })
})
