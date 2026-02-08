import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'

test('Test B (The Proof): @types/front-matter exists in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    assert.ok(pkg.devDependencies['@types/front-matter'], '@types/front-matter should exist in devDependencies to prove the issue')
})

test('Test A (The Solution): @types/front-matter is removed from package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    assert.strictEqual(pkg.devDependencies['@types/front-matter'], undefined, '@types/front-matter should be removed')
})
