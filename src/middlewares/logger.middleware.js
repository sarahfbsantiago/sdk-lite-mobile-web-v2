/**
 * @fileoverview Middleware de logging de requisições HTTP
 * @module middlewares/logger
 */

import { logger } from '../utils/logger.js'

/**
 * Middleware que loga todas as requisições e respostas
 */
export function requestLoggerMiddleware(req, res, next) {
    const startTime = Date.now()

    // Log da requisição
    logger.request(req)

    // Interceptar resposta para logar
    const originalJson = res.json.bind(res)
    res.json = (data) => {
        const duration = Date.now() - startTime
        logger.response(res.statusCode, duration)
        return originalJson(data)
    }

    next()
}

export default requestLoggerMiddleware
