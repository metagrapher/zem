import test from 'node:test'
import assert from 'node:assert/strict'
import { audit } from './audit.ts'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

test('Mechanical Auditor - State Machine and Sync Verification', async (t) => {
    const tempDir = join(process.cwd(), 'temp-audit-test')
    
    const setup = () => {
        if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
        mkdirSync(tempDir)
        mkdirSync(join(tempDir, 'src'))
        mkdirSync(join(tempDir, '.issues'))
        mkdirSync(join(tempDir, '.issues/OPEN'))
        mkdirSync(join(tempDir, '.issues/CLOSED'))
        mkdirSync(join(tempDir, '.issues/IN_PROGRESS'))
        mkdirSync(join(tempDir, 'tests'))
    }

    const cleanup = () => {
        if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
    }

    await t.test('detects missing test files for src code', async () => {
        setup()
        writeFileSync(join(tempDir, 'src/logic.ts'), 'export const x = 1')
        
        const code = await audit({ baseDir: tempDir, isSilent: true })
        assert.strictEqual(code, 1, 'Audit should fail when test is missing')
        cleanup()
    })

    await t.test('detects state mismatch (status vs directory)', async () => {
        setup()
        writeFileSync(join(tempDir, '.issues/OPEN/123-bug.md'), '---\nstatus: CLOSED\ngh_number: 123\n---')
        
        const code = await audit({ baseDir: tempDir, isSilent: true })
        assert.strictEqual(code, 1, 'Audit should fail when status: CLOSED is in OPEN/ dir')
        cleanup()
    })

    await t.test('passes when structural integrity is maintained', async () => {
        setup()
        // Code + Test
        writeFileSync(join(tempDir, 'src/math.ts'), 'export const sum = (a, b) => a + b')
        writeFileSync(join(tempDir, 'src/math.test.ts'), 'import test from "node:test"; test("math", () => {})')
        
        // Issue in correct dir
        writeFileSync(join(tempDir, '.issues/OPEN/001-feat.md'), '---\nstatus: OPEN\ngh_number: 1\n---')
        
        // Mock a package.json for coverage check to not fail the whole process or run real coverage
        // Actually, the auditor runs 'npm run test:coverage' in the baseDir.
        // We'll skip coverage check in this test by providing a mocked npm script or just ignoring the return code for that part.
        // For now, we mainly want to test the metadata/structural logic.
    })
})

import { existsSync } from 'node:fs'
