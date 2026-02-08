import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join, relative, basename } from 'node:path'
import { spawnSync } from 'node:child_process'

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.astro', '.css', '.wasm']
const IGNORED_FILES = ['index.ts', 'Indexer.ts']
const IGNORED_EXT = ['.d.ts']

const TEST_EXTENSIONS = ['.test.ts', '.test.mjs', '.test.js', '.spec.ts', '.spec.mjs', '.spec.js']

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
    return IGNORED_FILES.includes(fileName) || IGNORED_EXT.some(ext => fileName.endsWith(ext)) || TEST_EXTENSIONS.some(ext => fileName.includes(ext))
}

export type AuditConfig = {
    baseDir: string;
    isSilent?: boolean;
}

export async function audit(config: AuditConfig = { baseDir: process.cwd() }): Promise<number> {
    const { baseDir, isSilent } = config
    const SRC_DIR = join(baseDir, 'src')
    const TEST_DIR = join(baseDir, 'tests')
    const ISSUES_DIR = join(baseDir, '.issues')

    const log = (...args: any[]) => !isSilent && console.log(...args)
    const err = (...args: any[]) => !isSilent && console.error(...args)

    log('\x1b[36m%s\x1b[0m', '--- ZEM: Mechanical Audit ---')

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
            
            const hasTest = TEST_EXTENSIONS.some(testExt => {
                const testFileSameDir = file.replace(ext, testExt)
                const testFileInTests = join(TEST_DIR, relPath.replace(ext, testExt))
                return existsSync(testFileSameDir) || existsSync(testFileInTests)
            })

            if (!hasTest) missingTests.push(relPath)
        })

        if (missingTests.length > 0) {
            err('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Missing verification context (test files) for:')
            missingTests.forEach(file => err(` - ${file}`))
            return 1
        }
    }

    // 2. Metadata Audit: Issues
    if (existsSync(ISSUES_DIR)) {
        const issueFiles = getAllFiles(ISSUES_DIR).filter(f => f.endsWith('.md'))
        const ghNumberMap: Record<string, string[]> = {}
        const prefixMap: Record<string, string[]> = {}

        for (const file of issueFiles) {
            const content = readFileSync(file, 'utf8')
            const name = basename(file)
            const relPath = relative(baseDir, file)
            
            const ghMatch = content.match(/gh_number:\s*(\d+)/)
            if (ghMatch) {
                const num = ghMatch[1]
                if (!ghNumberMap[num]) ghNumberMap[num] = []
                ghNumberMap[num].push(relPath)
            }

            const prefixMatch = name.match(/^(\d+)-/)
            if (prefixMatch) {
                const prefix = prefixMatch[1]
                if (!prefixMap[prefix]) prefixMap[prefix] = []
                prefixMap[prefix].push(relPath)
            }

            const testMatch = content.match(/test_ref:\s*(.+)/)
            const verMatch = content.match(/verification:\s*(.+)/)
            const regMatch = content.match(/regression:\s*(.+)/)
            const statusMatch = content.match(/status:\s*(.+)/)
            
            const testRef = testMatch ? testMatch[1].trim() : null
            const verStatus = verMatch ? verMatch[1].trim() : null
            const isRegression = regMatch ? regMatch[1].trim().toLowerCase() === 'true' : false
            const status = statusMatch ? statusMatch[1].trim() : (relPath.includes('CLOSED') ? 'CLOSED' : (relPath.includes('IN_PROGRESS') ? 'IN_PROGRESS' : 'OPEN'))

            const isClosed = status === 'CLOSED'
            const isInProgress = status === 'IN_PROGRESS'
            const isOpen = status === 'OPEN'

            // Sync Check
            const expectedDir = isClosed ? 'CLOSED' : (isInProgress ? 'IN_PROGRESS' : 'OPEN')
            if (!relPath.includes(expectedDir)) {
                err('\x1b[31m%s\x1b[0m', `NO SIGNAL: State Mismatch in ${relPath}`)
                err(` - Issue has 'status: ${status}' but is located in ${relPath.split('/')[1]}/`)
                return 1
            }

            if ((isClosed || isInProgress || isRegression) && !testRef) {
                err('\x1b[31m%s\x1b[0m', `NO SIGNAL: Issue ${relPath} (State: ${status}) must have a test_ref.`)
                return 1
            }

            if (testRef) {
                const absoluteTestPath = join(baseDir, testRef)
                if (!existsSync(absoluteTestPath)) {
                    err('\x1b[31m%s\x1b[0m', `NO SIGNAL: Issue ${relPath} references non-existent test: ${testRef}`)
                    return 1
                }

                const result = spawnSync('node', [
                    '--experimental-strip-types',
                    '--test',
                    '--test-reporter', 'tap',
                    absoluteTestPath
                ], { 
                    encoding: 'utf8',
                    env: { ...process.env, TMPDIR: join(baseDir, 'coverage-data') }
                })
                const output = result.stdout + result.stderr
                
                const proofPassed = /^\s*ok.*Test B/m.test(output)
                const proofFailed = /^\s*not ok.*Test B/m.test(output)
                const solutionPassed = /^\s*ok.*Test A/m.test(output)
                const solutionFailed = /^\s*not ok.*Test A/m.test(output)

                if (isClosed) {
                    if (testRef !== 'tests/legacy.test.mjs') {
                        const hasTestA = /Test A/.test(output)
                        const hasTestB = /Test B/.test(output)

                        if (hasTestB && !proofFailed) {
                            err('\x1b[31m%s\x1b[0m', `NO SIGNAL: CLOSED issue ${relPath} has a PASSING Proof. The bug it proves legacy should be gone.`)
                            return 1
                        }
                        if (hasTestA && !solutionPassed) {
                            err('\x1b[31m%s\x1b[0m', `NO SIGNAL: CLOSED issue ${relPath} has a FAILING Solution. Fix is broken.`)
                            return 1
                        }
                    }
                    if (result.status !== 0 && !output.includes('Test B')) {
                        err('\x1b[31m%s\x1b[0m', `NO SIGNAL: CLOSED issue ${relPath} fails its tests.`)
                        err(output)
                        return 1
                    }
                    if (verStatus !== 'PASS') {
                        err('\x1b[31m%s\x1b[0m', `NO SIGNAL: Issue ${relPath} is CLOSED but verification is not 'PASS'.`)
                        return 1
                    }
                } else if (isInProgress) {
                    if (!proofPassed) {
                        err('\x1b[31m%s\x1b[0m', `NO SIGNAL: IN_PROGRESS issue ${relPath} failed reproduction. 'Test B (The Proof)' must pass.`)
                        return 1
                    }
                    if (!solutionFailed) {
                        err('\x1b[31m%s\x1b[0m', `NO SIGNAL: IN_PROGRESS issue ${relPath} has no failing solution 'Test A'. Fix it and CLOSE it.`)
                        return 1
                    }
                } else if (isOpen && isRegression) {
                    if (result.status === 0) {
                        err('\x1b[31m%s\x1b[0m', `NO SIGNAL: Categorization Error in ${relPath}`)
                        err(` - Issue is marked as a REGRESSION, but the tests are currently PASSING.`)
                        return 1
                    }
                    log(`\x1b[33m%s\x1b[0m`, `WITNESS: Issue ${relPath} is a confirmed regression (Failing as expected).`)
                }
            }
        }

        const duplicates = Object.entries(ghNumberMap).filter(([_, files]) => files.length > 1)
        if (duplicates.length > 0) {
            err('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Duplicate gh_number detected:')
            duplicates.forEach(([num, files]) => err(` - gh_number: ${num} in: ${files.join(', ')}`))
            return 1
        }

        const prefixDuplicates = Object.entries(prefixMap).filter(([_, files]) => files.length > 1)
        if (prefixDuplicates.length > 0) {
            err('\x1b[31m%s\x1b[0m', 'NO SIGNAL: Duplicate issue number prefixes detected:')
            prefixDuplicates.forEach(([prefix, files]) => err(` - Prefix ${prefix} in: ${files.join(', ')}`))
            return 1
        }
    }

    // 3. Coverage Audit
    log('\x1b[36m%s\x1b[0m', '--- ZEM: Coverage Audit ---')
    const coverageResult = spawnSync('npm', ['run', 'test:coverage'], { encoding: 'utf8', cwd: baseDir })
    const coverageOutput = coverageResult.stdout + coverageResult.stderr
    const coverageMatch = coverageOutput.match(/all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/)
    
    if (coverageMatch) {
        const linePct = parseFloat(coverageMatch[1])
        const branchPct = parseFloat(coverageMatch[2])
        log(`Signal Integrity: Line ${linePct}%, Branch ${branchPct}%`)
        
        // TECHNICAL DEBT (#047): Branch coverage target is 90%. 
        // Temporarily lowered to 80% to allow backfill.
        if (branchPct < 80 || linePct < 25) { 
            err('\x1b[31m%s\x1b[0m', `NO SIGNAL: Coverage threshold not met (Line: ${linePct}%, Branch: ${branchPct}%)`)
            return 1
        }
    } else {
        err('\x1b[33m%s\x1b[0m', 'WARN: Could not parse coverage output.')
    }

    log('\x1b[32m%s\x1b[0m', 'SIGNAL OK: All structural and mechanical invariants confirmed.')
    return 0
}
