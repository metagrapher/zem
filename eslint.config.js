import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.eslint-rules/**', 'test-project/**'],
    },
    {
        files: ['**/*.{ts,js,mjs,cjs}'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                process: 'readonly',
                console: 'readonly',
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-unsafe-function-type': 'off',
        },
    },
);
