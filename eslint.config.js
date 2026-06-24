import js from '@eslint/js'
import globals from 'globals'

export default [
    // Ignorados / Ignored paths
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'yuno-official-sdks/**',
            'web/**',
            'public/**',
            'docs/**'
        ]
    },

    // Regras base recomendadas / Recommended base rules
    js.configs.recommended,

    // Configuração do código-fonte / Source code configuration
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node
            }
        },
        rules: {
            // Foco em bugs e código morto / Focus on bugs and dead code
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-console': 'off'
        }
    },

    // Arquivos de teste / Test files (jest globals via @jest/globals import)
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
    }
]
