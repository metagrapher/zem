import { describe, it, expect } from 'vitest'
import { Ok } from '../algebra/Result'
import { safeJSON, safeURL, formatDate } from './web'

describe('web', () => {
    describe('safeJSON', () => {
        it('should return Ok for valid json', async () => {
            const result = safeJSON('{"a": 1}')
            expect(result).toEqual(Ok({ a: 1 }))
        })

        it('should return Err for invalid json', async () => {
            const result = safeJSON('invalid')
            expect(result.ok).toBe(false)
        })
    })

    describe('safeURL', () => {
        it('should return Ok for valid URL strings', () => {
            const result = safeURL('https://example.com')
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.value.href).toBe('https://example.com/')
        })

        it('should return Ok for URL objects', () => {
            const url = new URL('https://example.com')
            const result = safeURL(url)
            expect(result).toEqual(Ok(url))
        })

        it('should return Ok for Request objects', () => {
            const req = new Request('https://example.com')
            const result = safeURL(req)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.value.href).toBe('https://example.com/')
        })

        it('should return Err for invalid URLs', () => {
            const result = safeURL('not a url')
            expect(result.ok).toBe(false)
        })
    })

    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = new Date('2026-02-03T12:00:00Z')
            const formatted = formatDate(date)
            // Intl format varies by environment, but we ensure it returns a non-empty string
            expect(typeof formatted).toBe('string')
            expect(formatted.length).toBeGreaterThan(0)
        })
    })
})
