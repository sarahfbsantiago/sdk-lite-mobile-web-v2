/**
 * @fileoverview Ponto de entrada da aplicação / Application entry point
 * @module app
 *
 * Yuno Integration - Web + Mobile
 * Supports multiple SDK types: Lite, Full, Seamless, Headless
 *
 * @author Pigeonz Street Wear
 * @version 2.0.0
 * @see https://docs.y.uno
 */

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'

// Configuração / Configuration
import { env, validateEnv } from './config/index.js'

// Middlewares
import { requestLoggerMiddleware, errorHandlerMiddleware, notFoundMiddleware } from './middlewares/index.js'

// Rotas / Routes
import routes from './routes/index.js'

// Utils / Utilities
import { logger } from './utils/logger.js'

// Validar variáveis de ambiente / Validate environment variables
validateEnv()

// Diretorios (seguindo protocolo de estrutura) / Directories (following structure protocol)
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const webSdkLiteDir = resolve(rootDir, 'web', 'sdk-lite')
const publicDir = resolve(webSdkLiteDir, 'public')
const docsDir = resolve(rootDir, 'docs', 'guides')
const indexPage = resolve(webSdkLiteDir, 'index.html')
const checkoutPage = resolve(webSdkLiteDir, 'checkout.html')

// Verificar arquivos necessarios / Verify required files
function verifyPaths() {
    const paths = [
        { path: indexPage, label: 'web/sdk-lite/index.html' },
        { path: checkoutPage, label: 'web/sdk-lite/checkout.html' },
        { path: publicDir, label: 'web/sdk-lite/public/' },
        { path: docsDir, label: 'docs/guides/' }
    ]

    paths.forEach(({ path, label }) => {
        const exists = fs.existsSync(path)
        logger.info({ type: 'PATH_CHECK', label, exists })
    })
}

// Criar aplicação Express / Create Express application
const app = express()

// Middlewares globais / Global middlewares
app.use(express.json())
app.use(requestLoggerMiddleware)

// Arquivos estaticos / Static files
app.use('/static', express.static(resolve(publicDir, 'images')))
app.use('/public', express.static(publicDir))
app.use('/css', express.static(resolve(publicDir, 'css')))
app.use('/images', express.static(resolve(publicDir, 'images')))

// Documentacao / Documentation
app.get('/doc/paypal-integracao-yuno.html', (req, res) => {
    res.sendFile(resolve(docsDir, 'paypal-integracao-yuno.html'))
})
app.get('/doc/paypal-integracao-yuno.en.html', (req, res) => {
    res.sendFile(resolve(docsDir, 'paypal-integracao-yuno.en.html'))
})
app.get('/doc/payment-links-yuno.html', (req, res) => {
    res.sendFile(resolve(docsDir, 'payment-links-yuno.html'))
})
app.get('/doc/payment-links-yuno.en.html', (req, res) => {
    res.sendFile(resolve(docsDir, 'payment-links-yuno.en.html'))
})
app.use('/doc', express.static(docsDir))

// Páginas principais / Main pages
app.get('/', (req, res, next) => {
    if (!fs.existsSync(indexPage)) {
        return next(new Error('index.html nao encontrado'))
    }
    res.sendFile(indexPage)
})

app.get('/checkout', (req, res, next) => {
    if (!fs.existsSync(checkoutPage)) {
        return next(new Error('checkout.html nao encontrado'))
    }
    res.sendFile(checkoutPage)
})

// Legacy route for backwards compatibility
app.get('/sdk-lite.html', (req, res) => {
    res.redirect('/checkout')
})

// Página de sucesso de pagamento / Payment success page
app.get('/payment-success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pagamento Realizado</title>
            <style>
                body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
                .success { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .success h1 { color: #4CAF50; }
                .success a { color: #333; text-decoration: none; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="success">
                <h1>Pagamento Realizado!</h1>
                <p>Obrigado pela sua compra.</p>
                <a href="/">Voltar para a loja</a>
            </div>
        </body>
        </html>
    `)
})

// Rotas da API / API routes
app.use('/', routes)

// Tratamento de erros / Error handling
app.use(errorHandlerMiddleware)

// Iniciar servidor / Start server
function startServer() {
    verifyPaths()

    app.listen(env.PORT, env.HOST, () => {
        logger.info({
            type: 'SERVER_START',
            message: `Server rodando em http://localhost:${env.PORT}`,
            host: env.HOST,
            port: env.PORT,
            environment: env.NODE_ENV
        })
    })
}

// Exportar para uso como módulo ou executar diretamente
// Export for use as module or run directly
export { app, startServer }

// Executar se chamado diretamente / Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer()
}
