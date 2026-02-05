import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Ok, Err, atomic, atomicAsync, fromPromise } from './Result.ts'

describe('Result', () => {
    it('Ok should create a success result', () => {
        const result = Ok(10)
        assert.equal(result.ok, true)
        if (result.ok) assert.equal(result.value, 10)
    })

    it('Err should create a failure result', () => {
        const result = Err('error')
        assert.equal(result.ok, false)
        if (!result.ok) assert.equal(result.error, 'error')
    })

    it('atomic should wrap throwing functions', () => {
        assert.deepEqual(atomic(() => 10), Ok(10))
        const err = atomic(() => { throw new Error('fail') })
        assert.equal(err.ok, false)
        if (!err.ok) assert.equal(err.error, 'fail')
        
        const stringErr = atomic(() => { throw 'string fail' })
        assert.equal(stringErr.ok, false)
        if (!stringErr.ok) assert.equal(stringErr.error, 'string fail')
    })

    it('atomicAsync should wrap failing promises', async () => {
        const ok = await atomicAsync(async () => 10)
        assert.deepEqual(ok, Ok(10))
        const err = await atomicAsync(async () => { throw new Error('fail') })
        assert.equal(err.ok, false)
        if (!err.ok) assert.equal(err.error, 'fail')

        const stringErr = await atomicAsync(async () => { throw 'string fail' })
        assert.equal(stringErr.ok, false)
        if (!stringErr.ok) assert.equal(stringErr.error, 'string fail')
    })

    it('fromPromise should wrap promises', async () => {
        const ok = await fromPromise(Promise.resolve(10))
        assert.deepEqual(ok, Ok(10))
        const err = await fromPromise(Promise.reject(new Error('fail')))
        assert.equal(err.ok, false)
        if (!err.ok) assert.equal(err.error, 'fail')
        
        const stringErr = await fromPromise(Promise.reject('string fail'))
        assert.equal(stringErr.ok, false)
        if (!stringErr.ok) assert.equal(stringErr.error, 'string fail')
    })
})
