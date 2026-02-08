import test from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

test('Coverage TMPDIR is set to local directory', () => {
    const tmpDir = process.env.TMPDIR
    assert.ok(tmpDir, 'TMPDIR should be defined')
    assert.ok(tmpDir.includes('coverage-data'), `TMPDIR should contain coverage-data, got: ${tmpDir}`)
    assert.ok(existsSync(tmpDir), 'TMPDIR should exist')
})
