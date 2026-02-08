import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Linter } from 'eslint'
import { leadingCommas as rule } from './leading-commas.ts'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../')

describe('eslint-rule: leading-commas golden verification', () => {
    const linter = new Linter({ configType: 'flat' })
    
    const dirtyPath = path.join(root, '.eslint-rules/golden-standart-DONOTDELETE.js')
    const cleanPath = path.join(root, '.eslint-rules/golden-standard-DONOTDELETE.js')
    
    if (!fs.existsSync(dirtyPath)) throw new Error(`Dirty file missing: ${dirtyPath}`)
    if (!fs.existsSync(cleanPath)) throw new Error(`Clean file missing: ${cleanPath}`)

    const dirty = fs.readFileSync(dirtyPath, 'utf8')
    const clean = fs.readFileSync(cleanPath, 'utf8')

    // Standard config for our tests
    const getConfig = () => [
        {
            languageOptions: {
                ecmaVersion: 2024,
                sourceType: 'module'
            },
            plugins: {
                local: {
                    rules: {
                        'leading-commas': rule
                    }
                }
            },
            rules: { 'local/leading-commas': 'error' }
        }
    ]

    it('should transform golden-standart (dirty) to golden-standard (clean) exactly', () => {
        const result = linter.verifyAndFix(dirty, getConfig() as any)

        assert.equal(result.fixed, true, 'Should have made fixes')
        if (result.output !== clean) {
            const resLines = result.output.split('\n')
            const cleanLines = clean.split('\n')
            const firstDiff = resLines.findIndex((line, i) => line !== cleanLines[i])
            if (firstDiff !== -1) {
                console.error(`First diff at line ${firstDiff + 1}:`)
                console.error(`Actual:   [${resLines[firstDiff]}]`)
                console.error(`Expected: [${cleanLines[firstDiff]}]`)
                console.error('Context (Actual):')
                console.error(resLines.slice(Math.max(0, firstDiff - 2), firstDiff + 3).join('\n'))
            }
        }
        assert.equal(result.output, clean, 'Output should match golden-standard exactly')
    })

    it('should NOT transform golden-standard (idempotency)', () => {
        const result = linter.verifyAndFix(clean, getConfig() as any)

        assert.equal(result.fixed, false, 'Should not modify a already-clean file')
        assert.equal(result.output, clean, 'Output should match original clean file')
    })

    describe('granular logic checks', () => {
        it('enforces zero-space in control flow', () => {
            const code = 'if ( true ) {}'
            const expected = 'if (true) {}'
            const result = linter.verifyAndFix(code, getConfig() as any)
            assert.equal(result.output, expected)
        })

        it('enforces inline start for function call arguments and correct indent', () => {
            const code = 'foo(\n  a\n, b\n)'
            // foo( is col 0-3. ( is at 3.
            // wallColumn = 3.
            // expectedItem = \n + '   ' + ', '
            // expectedClose = \n + '   '
            const expected = 'foo( a\n   , b\n   )'
            const result = linter.verifyAndFix(code, getConfig() as any)
            assert.equal(result.output, expected)
        })

        it('handles object alignment with leading commas', () => {
            const code = 'const obj = { \n  a: 1\n, b: 2\n}'
            // const obj = is 12 chars. { is at 12.
            // braceOnNewLine is false. 
            // wallColumn = getIndent(node) + 2 = 0 + 2 = 2.
            // expectedItem = \n + '  ' + ', '
            const expected = 'const obj =\n{ a: 1\n, b: 2\n}'
            const result = linter.verifyAndFix(code, getConfig() as any)
            assert.equal(result.output, expected)
        })
    })
})
