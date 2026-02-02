import { describe, it, expect } from 'vitest'
import { Ok } from '../algebra/Result'
import { safeJSON } from './web'

describe('web', () => {
    it('safeJSON should return Ok for valid json', async () => {
        const response = new Response('{"a": 1}')
        const text = await response.text()
        const result = safeJSON(text)
        expect(result).toEqual(Ok({ a: 1 }))
    })

    it('safeJSON should return Err for invalid json', async () => {
        const result = safeJSON('invalid')
        expect(result.ok).toBe(false)
    })
})
