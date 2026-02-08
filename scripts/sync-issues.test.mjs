import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

// Mock of the discovery logic in sync-issues.mjs

// Proposed discovery logic
function findFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir, { withFileTypes: true })
  return files.flatMap(file => {
    const res = path.join(dir, file.name)
    return file.isDirectory() ? findFilesRecursive(res) : (file.name.endsWith('.md') ? [res] : [])
  })
}

// Test Setup
const testDir = '.issues-test'
if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
fs.mkdirSync(path.join(testDir, 'OPEN'), { recursive: true })
fs.mkdirSync(path.join(testDir, 'CLOSED'), { recursive: true })
fs.writeFileSync(path.join(testDir, 'OPEN', 'test1.md'), 'test1')
fs.writeFileSync(path.join(testDir, 'CLOSED', 'test2.md'), 'test2')
fs.writeFileSync(path.join(testDir, 'root.md'), 'root')

try {
  console.log('Running Test B (The Proof): Confirming current logic MISSES subdirectories...')
  // Using original logic pointed at testDir
  const originalFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.md'))
  assert.strictEqual(originalFiles.length, 1, 'Current logic should only find 1 file in root')
  assert.strictEqual(originalFiles[0], 'root.md', 'Current logic should find root.md')
  console.log('Test B PASSED: Current logic indeed misses subdirectories.')

  console.log('Running Test A (The Solution): Confirming new logic FINDS subdirectories...')
  const newFiles = findFilesRecursive(testDir)
  assert.strictEqual(newFiles.length, 3, 'New logic should find 3 files')
  const baseNames = newFiles.map(f => path.basename(f)).sort()
  assert.deepStrictEqual(baseNames, ['root.md', 'test1.md', 'test2.md'].sort(), 'New logic should find all files')
  console.log('Test A PASSED: New logic finds all files.')

} finally {
  fs.rmSync(testDir, { recursive: true })
}
