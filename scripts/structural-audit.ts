import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, basename } from 'node:path'

const SRC_DIR = join(process.cwd(), 'src')
const TEST_DIR = join(process.cwd(), 'tests')
const IGNORED_FILES = ['index.ts', 'Indexer.ts']
const IGNORED_EXT = ['.d.ts']

const getAllFiles = (dir: string): string[] => {
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

const checkStructuralIntegrity = () => {
    const srcFiles = getAllFiles(SRC_DIR).filter(file => file.endsWith('.ts') && !isIgnored(file))
    const missingTests: string[] = []

    srcFiles.forEach(file => {
        const relPath = relative(SRC_DIR, file)
        const testFileSameDir = file.replace(/\.ts$/, '.test.ts')
        const specFileSameDir = file.replace(/\.ts$/, '.spec.ts')
        const testFileInTests = join(TEST_DIR, relPath.replace(/\.ts$/, '.test.ts'))
        const specFileInTests = join(TEST_DIR, relPath.replace(/\.ts$/, '.spec.ts'))

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

    console.log('\x1b[32m%s\x1b[0m', 'SIGNAL OK: All modules have corresponding verification context.')
}

checkStructuralIntegrity()
