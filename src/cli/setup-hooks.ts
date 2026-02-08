import { writeFileSync, chmodSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const HOOKS_DIR = join(process.cwd(), '.git', 'hooks')

export const setupHooks = () => {
    const HOOK_PATH = join(HOOKS_DIR, 'pre-commit')

    const hookContent = `#!/bin/sh
# ZEM: Zero Exception Method Terminal Gating
echo "[\\x1b[34mZEM\\x1b[0m] Initiating Full Audit..."
npm run zem
if [ $? -ne 0 ]; then
    echo "\\x1b[31mFAIL: Verification Failed. Commit Aborted.\\x1b[0m"
    exit 1
fi
echo "\\x1b[32mPASS: Full Audit Successful. Committing...\\x1b[0m"
`

    if (!existsSync(HOOKS_DIR)) {
        console.error('ERROR: .git/hooks directory not found. Are you in a git repository?')
        return
    }

    try {
        writeFileSync(HOOK_PATH, hookContent)
        chmodSync(HOOK_PATH, '755')
        console.log('\\x1b[32m%s\\x1b[0m', '✓ ZEM Terminal Gating installed successfully at .git/hooks/pre-commit')
    } catch (err: any) {
        console.error('FAIL: Could not install git hook:', err.message)
    }
}
