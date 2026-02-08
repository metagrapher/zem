import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join, relative, basename } from 'node:path'
import { spawnSync } from 'node:child_process'

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.astro', '.css', '.wasm']
const IGNORED_FILES = ['index.ts', 'Indexer.ts']
const IGNORED_EXT = ['.d.ts']

const getAllFiles = (dir: string): string[] => {
    if (!existsSync(dir)) return []
    const files = readdirSync(dir)
    return files.flatMap((file) => {
        const path = join(dir, file)
        if (statSync(path).isDirectory()) {
            return getAllFiles(path)
        }
        return path
    })
}

const isIgnored = (path: string) => {
    const fileName = basename(path)
    return IGNORED_FILES.includes(fileName) || IGNORED_EXT.some(ext => fileName.endsWith(ext)) || fileName.includes('.test.ts') || fileName.includes('.spec.ts')
}

export async function audit() {
    const SRC_DIR = join(process.cwd(), 'src')
    const TEST_DIR = join(process.cwd(), 'tests')
    const ISSUES_DIR = join(process.cwd(), '.issues')

    console.log('\x1b[36m%s\x1b[0m', '--- ZEM: Mechanical Audit ---')

    // 1. Structural Audit: Code vs Tests
    if (existsSync(SRC_DIR)) {
        const srcFiles = getAllFiles(SRC_DIR).filter(file => {
            const ext = file.substring(file.lastIndexOf('.'))
            return CODE_EXTENSIONS.includes(ext) && !isIgnored(file)
        })
        const missingTests: string[] = []

        srcFiles.forEach(file => {
            const relPath = relative(SRC_DIR, file)
            const ext = file.substring(file.lastIndexOf('.'))
            const testFileSameDir = file.replace(ext, '.test.ts')
            const specFileSameDir = file.replace(ext, '.spec.ts')
            const testFileInTests = join(TEST_DIR, relPath.replace(ext, '.test.ts'))
            const specFileInTests = join(TEST_DIR, relPath.replace(ext, '.spec.ts'))

            const hasTest = existsSync(testFileSameDir) ||
                existsSync(specFileSameDir) ||
                existsSync(testFileInTests) ||
                existsSync(specFileInTests)

            if (!hasTest) {
                missingTests.push(relPath)
            }
        })

        if (missingTests.length > 0) {
            console.error('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Missing verification context (test files) for:')
            missingTests.forEach(file => console.error(` - ${file}`))
            process.exit(1)
        }
    }

    // 2. Metadata Audit: Issues
    if (existsSync(ISSUES_DIR)) {
        const issueFiles = getAllFiles(ISSUES_DIR).filter(f => f.endsWith('.md'))
        
        // Deduplication checks
        const ghNumberMap: Record<string, string[]> = {}
        const prefixMap: Record<string, string[]> = {}

        issueFiles.forEach(file => {
            const content = readFileSync(file, 'utf8')
            const name = basename(file)
            const relPath = relative(process.cwd(), file)
            
            // gh_number check
            const ghMatch = content.match(/gh_number:\s*(\d+)/)
            if (ghMatch) {
                const num = ghMatch[1]
                if (!ghNumberMap[num]) ghNumberMap[num] = []
                ghNumberMap[num].push(relPath)
            }

            // prefix check
            const prefixMatch = name.match(/^(\d+)-/)
            if (prefixMatch) {
                const prefix = prefixMatch[1]
                if (!prefixMap[prefix]) prefixMap[prefix] = []
                prefixMap[prefix].push(relPath)
            }

            // Mechanical Verification
            const isClosed = relPath.includes('CLOSED')
            const testMatch = content.match(/test_ref:\s*(.+)/)
            const verMatch = content.match(/verification:\s*(.+)/)
            
            const testRef = testMatch ? testMatch[1].trim() : null
            const verStatus = verMatch ? verMatch[1].trim() : null

            if (isClosed && !testRef) {
                console.error('\x1b[31m%s\x1b[0m', `NO SIGNAL: Closed issue ${relPath} must have a test_ref.`)
                process.exit(1)
            }

            if (testRef) {
                const absoluteTestPath = join(process.cwd(), testRef)
                if (!existsSync(absoluteTestPath)) {
                    console.error('\x1b[31m%s\x1b[0m', `NO SIGNAL: Issue ${relPath} references non-existent test: ${testRef}`)
                    process.exit(1)
                }

                if (isClosed) {
                    const result = spawnSync('node', ['--experimental-strip-types', '--test', absoluteTestPath], { encoding: 'utf8' })
                    if (result.status !== 0) {
                        console.error('\x1b[31m%s\x1b[0m', `NO SIGNAL: Issue ${relPath} is CLOSED but its test_ref fails!`)
                        console.error(result.stderr || result.stdout)
                        process.exit(1)
                    }
                    if (verStatus !== 'PASS') {
                        console.error('\x1b[31m%s\x1b[0m', `NO SIGNAL: Issue ${relPath} is CLOSED but verification is not 'PASS'.`)
                        process.exit(1)
                    }
                }
            }
        })

        // Report duplicates
        const duplicates = Object.entries(ghNumberMap).filter(([_, files]) => files.length > 1)
        if (duplicates.length > 0) {
            console.error('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Duplicate gh_number detected:')
            duplicates.forEach(([num, files]) => console.error(` - gh_number: ${num} in: ${files.join(', ')}`))
            process.exit(1)
        }

        const prefixDuplicates = Object.entries(prefixMap).filter(([_, files]) => files.length > 1)
        if (prefixDuplicates.length > 0) {
            console.error('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Duplicate issue number prefixes detected:')
            prefixDuplicates.forEach(([prefix, files]) => console.error(` - Prefix ${prefix} in: ${files.join(', ')}`))
            process.exit(1)
        }
    }

    console.log('\x1b[32m%s\x1b[0m', 'SIGNAL OK: All structural and mechanical invariants confirmed.')
}
