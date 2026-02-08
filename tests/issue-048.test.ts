import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

test('Issue #048: Line Coverage Debt Witness', async (t) => {
    // Run coverage to get current levels
    const result = spawnSync('npm', ['run', 'test:coverage'], { encoding: 'utf8' })
    const output = result.stdout + result.stderr
    const match = output.match(/all files\s*\|\s*([\d.]+)/)
    const linePct = match ? parseFloat(match[1]) : 0

    await t.test('Test B (The Proof) - PROVE LINE DEBT EXISTS', () => {
        // This test passes if we have debt (Line < 80)
        assert.ok(linePct < 80, `Line debt exists: Coverage is ${linePct}% which is less than 80%`)
    })

    await t.test('Test A (The Solution) - VERIFY LINE DEBT RESOLVED', () => {
        // This test fails until coverage hits 80
        assert.ok(linePct >= 80, `Line debt unresolved: Coverage is ${linePct}%`)
    })
})
