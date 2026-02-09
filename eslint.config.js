import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'supabase/**', '*.cjs', 'test_token.js', 'debug_*.js', 'debug_*.cjs']
    },
    {
        ...js.configs.recommended,
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node
            }
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'react': react,
            'react-hooks': reactHooks
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'react/prop-types': 'off',
            'no-unused-vars': 'off'
        },
        settings: {
            react: {
                version: 'detect'
            }
        }
    }
];
