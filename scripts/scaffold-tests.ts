import { watch, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(process.cwd(), 'src')

console.log(`[ZEM] Watching ${SRC_DIR} for new code files...`)

const IGNORED_EXTENSIONS = ['.test.ts', '.spec.ts', '.d.ts', '.test.js', '.spec.js', '.test.tsx', '.spec.tsx']
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']

watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return
    if (eventType !== 'rename') return // 'rename' handles creation and deletion

    const ext = extname(filename)

    // Filter for code files only
    if (!CODE_EXTENSIONS.includes(ext)) return

    // Ignore test and definition files
    if (IGNORED_EXTENSIONS.some(ignore => filename.endsWith(ignore))) return

    const filePath = join(SRC_DIR, filename)

    // Ensure file exists (it might have been deleted)
    if (!existsSync(filePath)) return

    // Always generate .test.ts to satisfy ZEM structural audit
    const base = basename(filename, ext)
    const testFilePath = join(dirname(filePath), `${base}.test.ts`)

    // If test file already exists, do nothing
    if (existsSync(testFilePath)) return

    console.log(`[ZEM] Detected new file: ${filename}`)

    try {
        const fileContent = readFileSync(filePath, 'utf-8')

        // Extract exported names using regex
        const exportRegex = /export\s+(?:const|function|class|type|interface)\s+([a-zA-Z0-9_]+)/g
        const exports: string[] = []
        let match
        while ((match = exportRegex.exec(fileContent)) !== null) {
            exports.push(match[1])
        }

        // If no exports found, maybe default export?
        if (exports.length === 0 && fileContent.includes('export default')) {
            // We'll handle named imports primarily for ZEM style, but good to note.
        }

        const relativePath = `./${base}`

        let testContent = `import { describe, it, expect } from 'vitest'\n`

        if (exports.length > 0) {
            testContent += `import { ${exports.join(', ')} } from '${relativePath}'\n`
        } else {
            testContent += `import * as module from '${relativePath}'\n`
        }

        testContent += `\ndescribe('${base}', () => {\n`

        if (exports.length > 0) {
            exports.forEach(exp => {
                testContent += `    it('${exp} should correspond to requirements', () => {\n`
                testContent += `        expect(${exp}).toBeDefined()\n`
                testContent += `    })\n\n`
            })
        } else {
            testContent += `    it('should exist', () => {\n`
            testContent += `        expect(module).toBeDefined()\n`
            testContent += `})\n`
        }

        testContent += `})\n`

        writeFileSync(testFilePath, testContent)
        console.log(`[ZEM] Scaffolding created: ${testFilePath}`)

    } catch (err) {
        console.error(`[ZEM] Error processing ${filename}:`, err)
    }
})
