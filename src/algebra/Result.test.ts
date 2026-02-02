import { describe, it, expect } from 'vitest'
import { Ok, Err } from './Result'

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
})
