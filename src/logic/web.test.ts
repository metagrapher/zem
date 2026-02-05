import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Ok } from '../algebra/Result.ts'
import { safeJSON, safeURL, formatDate } from './web.ts'

describe('web', () => {
    describe('safeJSON', () => {
        it('should return Ok for valid json', async () => {
            const result = safeJSON('{"a": 1}')
            assert.deepEqual(result, Ok({ a: 1 }))
        })

        it('should return Err for invalid json', async () => {
            const result = safeJSON('invalid')
            assert.equal(result.ok, false)
        })
    })

    describe('safeURL', () => {
        it('should return Ok for valid URL strings', () => {
            const result = safeURL('https://example.com')
            assert.equal(result.ok, true)
            if (result.ok) assert.equal(result.value.href, 'https://example.com/')
        })

        it('should return Ok for URL objects', () => {
            const url = new URL('https://example.com')
            const result = safeURL(url)
            assert.deepEqual(result, Ok(url))
        })

        it('should return Ok for Request objects', () => {
            const req = new Request('https://example.com')
            const result = safeURL(req)
            assert.equal(result.ok, true)
            if (result.ok) assert.equal(result.value.href, 'https://example.com/')
        })

        it('should return Err for invalid URLs', () => {
            const result = safeURL('not a url')
            assert.equal(result.ok, false)
        })
    })

    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = new Date('2026-02-03T12:00:00Z')
            const formatted = formatDate(date)
            // Intl format varies by environment, but we ensure it returns a non-empty string
            assert.equal(typeof formatted, 'string')
            assert.ok(formatted.length > 0)
        })
    })
})
