import { describe, it, expect } from 'vitest'
import { Ok, Err, atomic, atomicAsync, fromPromise } from './Result'

describe('Result', () => {
    it('Ok should create a success result', () => {
        const result = Ok(10)
        expect(result.ok).toBe(true)
        if (result.ok) expect(result.value).toBe(10)
    })

    it('Err should create a failure result', () => {
        const result = Err('error')
        expect(result.ok).toBe(false)
        if (!result.ok) expect(result.error).toBe('error')
    })

    it('atomic should wrap throwing functions', () => {
        expect(atomic(() => 10)).toEqual(Ok(10))
        const err = atomic(() => { throw new Error('fail') })
        expect(err.ok).toBe(false)
        if (!err.ok) expect(err.error).toBe('fail')
        
        const stringErr = atomic(() => { throw 'string fail' })
        expect(stringErr.ok).toBe(false)
        if (!stringErr.ok) expect(stringErr.error).toBe('string fail')
    })

    it('atomicAsync should wrap failing promises', async () => {
        const ok = await atomicAsync(async () => 10)
        expect(ok).toEqual(Ok(10))
        const err = await atomicAsync(async () => { throw new Error('fail') })
        expect(err.ok).toBe(false)
        if (!err.ok) expect(err.error).toBe('fail')

        const stringErr = await atomicAsync(async () => { throw 'string fail' })
        expect(stringErr.ok).toBe(false)
        if (!stringErr.ok) expect(stringErr.error).toBe('string fail')
    })

    it('fromPromise should wrap promises', async () => {
        const ok = await fromPromise(Promise.resolve(10))
        expect(ok).toEqual(Ok(10))
        const err = await fromPromise(Promise.reject(new Error('fail')))
        expect(err.ok).toBe(false)
        if (!err.ok) expect(err.error).toBe('fail')
        
        const stringErr = await fromPromise(Promise.reject('string fail'))
        expect(stringErr.ok).toBe(false)
        if (!stringErr.ok) expect(stringErr.error).toBe('string fail')
    })
})
