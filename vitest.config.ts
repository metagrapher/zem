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
                'src/eslint/rules/**', // TODO: Expand rule suites for deep coverage
                'src/logic/web.ts', // TODO: Add tests for formatDate and safeURL
                'src/logic/choice.ts',
                'src/logic/transform.ts',
                'src/binary/hex.ts',
                '**/Indexer.ts',
            ],
        },
    },
})
