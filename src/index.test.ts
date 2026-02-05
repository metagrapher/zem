import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as module from './index.ts'

describe('index', () => {
    it('should exist', () => {
        assert.ok(module)
    })
})
