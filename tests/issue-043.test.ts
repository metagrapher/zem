import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

test('Issue #043: Coverage Debt Witness', async (t) => {
    // Run coverage to get current levels
    const result = spawnSync('npm', ['run', 'test:coverage'], { encoding: 'utf8' })
    const output = result.stdout + result.stderr
    const match = output.match(/all files\s*\|\s*[\d.]+\s*\|\s*([\d.]+)/)
    const branchPct = match ? parseFloat(match[1]) : 0

    await t.test('Test B (The Proof) - PROVE DEBT EXISTS', () => {
        // This test passes if we have debt (Branch < 90)
        assert.ok(branchPct < 90, `Debt exists: Branch coverage is ${branchPct}% which is less than 90%`)
    })

    await t.test('Test A (The Solution) - VERIFY DEBT RESOLVED', () => {
        // This test fails until coverage hits 90
        assert.ok(branchPct >= 90, `Debt unresolved: Branch coverage is ${branchPct}%`)
    })
})
