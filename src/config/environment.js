/**
 * @fileoverview Gerenciamento de variáveis de ambiente / Environment variables management
 * @module config/environment
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

/**
 * Configurações do ambiente
 * Environment settings
 */
export const env = {
    // Ambiente / Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',

    // Servidor / Server
    PORT: Number(process.env.PORT) || 8081,
    HOST: process.env.HOST || '0.0.0.0',
    BASE_URL: process.env.BASE_URL || 'http://localhost:8081',

    // Yuno API
    YUNO_API_URL: process.env.API_URL,
    YUNO_PUBLIC_API_KEY: process.env.PUBLIC_API_KEY,
    YUNO_PRIVATE_SECRET_KEY: process.env.PRIVATE_SECRET_KEY,
    YUNO_ACCOUNT_CODE: process.env.ACCOUNT_CODE,
    YUNO_CUSTOMER_ID: process.env.CUSTOMER_ID || '7ab03456-833c-4c8d-8a83-833b777363c6',

    // Webhook
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'INFO'
}

/**
 * Valida se todas as variáveis obrigatórias estão presentes
 * Validates if all required variables are present
 * @throws {Error} Se alguma variável obrigatória estiver faltando / If any required variable is missing
 */
export function validateEnv() {
    const required = [
        'YUNO_API_URL',
        'YUNO_PUBLIC_API_KEY',
        'YUNO_PRIVATE_SECRET_KEY',
        'YUNO_ACCOUNT_CODE'
    ]

    const missing = required.filter(key => !env[key])

    if (missing.length > 0) {
        console.error('Variáveis de ambiente obrigatórias faltando:', missing)
        console.error('Verifique seu arquivo .env')
    }
}

export default env
