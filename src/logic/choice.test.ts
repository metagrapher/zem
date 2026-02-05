import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Ok, Err } from '../algebra/Result.ts'
import { choice } from './choice.ts'

describe('choice', () => {
    it('should return the first Ok result', () => {
        assert.deepEqual(choice(Err('fail'), Ok('success')), Ok('success'))
    })

    it('should return the last Err if all fail', () => {
        assert.deepEqual(choice(Err('fail1'), Err('fail2')), Err('fail2'))
    })

    it('should return EMPTY_CHOICE if no arguments provided', () => {
        assert.equal((choice() as any).error, 'EMPTY_CHOICE')
    })
})
