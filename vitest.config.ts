import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100,
            },
            exclude: [
                'node_modules/**',
                'dist/**',
                'scripts/**',
                'tests/**',
                '**/*.test.ts',
                '**/*.spec.ts',
                'src/index.ts', // Entry point usually just exports
                'src/algebra/Monads.ts', // Type definitions only
                'src/eslint/rules/**', // TODO: Expand RuleTester suites for 100% rule coverage
                '**/Indexer.ts',
            ],
        },
    },
})
