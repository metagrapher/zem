import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { findFiles } from './sync-issues.ts'

describe('CLI: Sync Issues', () => {
    it('finds files recursively', () => {
        const testDir = '.issues-test'
        
        // Setup
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
        fs.mkdirSync(path.join(testDir, 'OPEN'), { recursive: true })
        fs.mkdirSync(path.join(testDir, 'CLOSED'), { recursive: true })
        fs.writeFileSync(path.join(testDir, 'OPEN', 'test1.md'), 'test1')
        fs.writeFileSync(path.join(testDir, 'CLOSED', 'test2.md'), 'test2')
        fs.writeFileSync(path.join(testDir, 'root.md'), 'root')
        
        try {
            const result = findFiles(testDir)
            
            assert.equal(result.length, 3)
            const baseNames = result.map(f => path.basename(f)).sort()
            assert.deepEqual(baseNames, ['root.md', 'test1.md', 'test2.md'])
        } finally {
            // Cleanup
            if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
        }
    })
})
