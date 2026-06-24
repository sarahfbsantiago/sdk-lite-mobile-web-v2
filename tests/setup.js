/**
 * @fileoverview Configuracao global de testes
 */

import { jest } from '@jest/globals'

// Configurar variaveis de ambiente para testes
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'ERROR' // Reduzir logs durante testes
process.env.API_URL = 'https://api-sandbox.y.uno'
process.env.PUBLIC_API_KEY = 'test_public_key'
process.env.PRIVATE_SECRET_KEY = 'test_private_key'
process.env.ACCOUNT_CODE = 'test_account'
process.env.CUSTOMER_ID = 'test_customer'

// Timeout global para testes async
jest.setTimeout(10000)
