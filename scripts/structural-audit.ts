import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join, relative, basename } from 'node:path'

const SRC_DIR = join(process.cwd(), 'src')
const TEST_DIR = join(process.cwd(), 'tests')
const ISSUES_DIR = join(process.cwd(), '.issues')
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

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.astro', '.css', '.wasm']

const checkStructuralIntegrity = () => {
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

    // New Audit: gh_number deduplication
    const issueFiles = getAllFiles(ISSUES_DIR).filter(f => f.endsWith('.md'))
    const ghNumberMap: Record<string, string[]> = {}

    issueFiles.forEach(file => {
        const content = readFileSync(file, 'utf8')
        const match = content.match(/gh_number:\s*(\d+)/)
        if (match) {
            const num = match[1]
            if (!ghNumberMap[num]) ghNumberMap[num] = []
            ghNumberMap[num].push(relative(process.cwd(), file))
        }
    })

    const duplicates = Object.entries(ghNumberMap).filter(([_, files]) => files.length > 1)
    if (duplicates.length > 0) {
        console.error('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Duplicate gh_number detected:')
        duplicates.forEach(([num, files]) => {
            console.error(` - gh_number: ${num} found in: ${files.join(', ')}`)
        })
        process.exit(1)
    }

    console.log('\x1b[32m%s\x1b[0m', 'SIGNAL OK: All modules have verification context and gh_numbers are unique.')
}

checkStructuralIntegrity()
