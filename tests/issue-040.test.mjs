import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

test('CI Verification Workflow exists and is valid', () => {
    const workflowPath = join(process.cwd(), '.github/workflows/verify.yml')
    assert.ok(existsSync(workflowPath), 'verify.yml should exist')
    
    const content = readFileSync(workflowPath, 'utf8')
    assert.ok(content.includes('npm run zem'), 'Workflow should run zem audit')
    assert.ok(content.includes('runs-on: ubuntu-latest'), 'Workflow should run on ubuntu-latest')
})
