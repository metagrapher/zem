import { createInterface } from 'node:readline/promises'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { setupHooks } from './setup-hooks.ts'

// rl moved inside init
const isGitDirty = () => {
    try {
        const out = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString()
        return out.trim().length > 0
    } catch {
        return false // Not a git repo or git not found
    }
}

export async function init() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    console.log('\x1b[36m%s\x1b[0m', '--- ZEM: Zero Exception (Monad) Method Initialization ---')
    console.log('Automating your verification stack...\n')

    // 0. Dirty State Check
    if (isGitDirty()) {
        console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Your git repository has uncommitted changes.')
        const proceed = (await rl.question('It is recommended to run this on a clean state. Proceed anyway? [y/N]: ')).toLowerCase() === 'y'
        if (!proceed) {
            console.log('Aborting.')
            rl.close()
            return
        }
    }

    const isStrict = (await rl.question('Use Strict Mode? (75-line limit, 100% coverage) [Y/n]: ')).toLowerCase() !== 'n'
    const useCommaForward = (await rl.question('Use Comma-Forward notation? (Style preference) [Y/n]: ')).toLowerCase() !== 'n'
    const useGating = (await rl.question('Enable Terminal Gating? (Git pre-commit hooks) [Y/n]: ')).toLowerCase() !== 'n'
    const useTestWriter = (await rl.question('Enable Auto-TestWriter? (Automatically writes tests for you) [Y/n]: ')).toLowerCase() !== 'n'

    console.log('\n[ZEM] Configuring project...')

    // 1. Update package.json scripts
    const pkgPath = join(process.cwd(), 'package.json')
    if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        pkg.scripts = {
            ...pkg.scripts,
            "structural-check": "zem audit",
            "typecheck": "tsc --noEmit",
            "lint": "eslint .",
            "test:coverage": `vitest run --coverage${isStrict ? '' : ' --threshold 80'}`,
            "zem": "npm run structural-check && npm run typecheck && npm run test:coverage"
        }
        if (useTestWriter) {
            pkg.scripts["watch:tests"] = "node --loader ts-node/esm ./node_modules/@metagrapher/zem/scripts/scaffold-tests.ts"
        }
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 4))
        console.log('✓ Updated package.json scripts')
    }

    // 2. Setup Git Hooks
    if (useGating) {
        console.log('[ZEM] Installing Git Hooks...')
        try {
            setupHooks()
        } catch {
            console.log('! Failed to complete gating setup automatically')
        }
    }

    // 3. ESLint Config (simplified for init)
    const eslintPath = join(process.cwd(), 'eslint.config.js')
    if (!existsSync(eslintPath)) {
        const profile = isStrict ? 'strict' : 'relaxed'
        const baseConfig = `import { zem } from '@metagrapher/zem/eslint';\n\nexport default [\n  ...zem.${profile}`
        const config = useCommaForward
            ? `${baseConfig}\n];`
            : `${baseConfig},\n  { rules: { '@metagrapher/zem/leading-commas': 'off' } }\n];`

        writeFileSync(eslintPath, config)
        console.log('✓ Created eslint.config.js')
    }

    console.log('\n\x1b[32m%s\x1b[0m', 'ZEM Initialization Complete.')
    console.log('Recommended next step: Run "npm run zem" to verify your project.')

    rl.close()
}
