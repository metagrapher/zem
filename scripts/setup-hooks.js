import { writeFileSync, chmodSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const HOOKS_DIR = join(process.cwd(), '.git', 'hooks')
const PRE_COMMIT_PATH = join(HOOKS_DIR, 'pre-commit')

const PRE_COMMIT_CONTENT = `#!/bin/sh
# ZEM Terminal Gating Hook

echo "[\x1b[34mZEM\x1b[0m] Initiating Full Audit..."

# 1. Structural Integrity Check
npm run structural-check
if [ $? -ne 0 ]; then
    echo "\x1b[31mFAIL: Structural Integrity Check Failed.\x1b[0m"
    exit 1
fi

# 2. Type Check
npm run typecheck
if [ $? -ne 0 ]; then
    echo "\x1b[31mFAIL: Type Check Failed.\x1b[0m"
    exit 1
fi

# 3. Lint
npm run lint
if [ $? -ne 0 ]; then
    echo "\x1b[31mFAIL: Linting Failed.\x1b[0m"
    exit 1
fi

# 4. Test with Coverage
npm run test:coverage
if [ $? -ne 0 ]; then
    echo "\x1b[31mFAIL: Tests or Coverage Failed.\x1b[0m"
    exit 1
fi

echo "\x1b[32mPASS: Full Audit Successful. Committing...\x1b[0m"
exit 0
`

const setupHooks = () => {
    if (!existsSync(HOOKS_DIR)) {
        console.error('Error: .git directory not found. Please run this in the project root.')
        process.exit(1)
    }

    writeFileSync(PRE_COMMIT_PATH, PRE_COMMIT_CONTENT)
    chmodSync(PRE_COMMIT_PATH, '755')
    console.log('\x1b[32m%s\x1b[0m', 'SIGNAL OK: ZEM Terminal Gating Hook installed.')
}

setupHooks()
