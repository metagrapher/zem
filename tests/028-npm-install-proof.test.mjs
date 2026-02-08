import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'

test('Test A (The Solution): @types/front-matter is removed from package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    assert.strictEqual(pkg.devDependencies['@types/front-matter'], undefined, '@types/front-matter should be removed')
})

test('Regression: front-matter types are still valid', () => {
    // We already verified this with npm run typecheck, but double check the file
    const hasInternalTypes = fs.existsSync('node_modules/front-matter/index.d.ts')
    assert.ok(hasInternalTypes, 'front-matter should have internal types')
})
