import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'

test('Regression: @types/front-matter is not in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    assert.strictEqual(pkg.devDependencies['@types/front-matter'], undefined, '@types/front-matter must not be present as it breaks CI and is redundant')
})

test('Regression: front-matter types are reachable', () => {
    // Verified by tsc, but check file existence as a failsafe
    const hasInternalTypes = fs.existsSync('node_modules/front-matter/index.d.ts')
    assert.ok(hasInternalTypes, 'front-matter must have internal types')
})
