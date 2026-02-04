import { describe, it, expect } from 'vitest'
import { Ok, Err } from '../algebra/Result'
import { choice } from './choice'

describe('choice', () => {
    it('should return the first Ok result', () => {
        expect(choice(Err('fail'), Ok('success'))).toEqual(Ok('success'))
    })

    it('should return the last Err if all fail', () => {
        expect(choice(Err('fail1'), Err('fail2'))).toEqual(Err('fail2'))
    })

    it('should return EMPTY_CHOICE if no arguments provided', () => {
        expect((choice() as any).error).toBe('EMPTY_CHOICE')
    })
})
