/**
 * @fileoverview Middleware de tratamento de erros / Error handling middleware
 * @module middlewares/error
 */

import { AppError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/environment.js'

/**
 * Middleware de tratamento de erros centralizado
 * Centralized error handling middleware
 *
 * @param {Error} err - Erro capturado / Caught error
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next function
 */
export function errorHandlerMiddleware(err, req, res, next) {
    // Se já enviou resposta, delega ao handler padrão
    // If already sent response, delegate to default handler
    if (res.headersSent) {
        return next(err)
    }

    // Erros operacionais (esperados e tratáveis)
    // Operational errors (expected and handleable)
    if (err instanceof AppError) {
        logger.warn({
            type: err.name,
            code: err.code,
            message: err.message,
            path: req.path,
            method: req.method
        })

        return res.status(err.statusCode).json(err.toJSON())
    }

    // Erros de programação (inesperados) / Programming errors (unexpected)
    logger.error({
        type: 'UnhandledError',
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    })

    // Em produção, não expor detalhes do erro / In production, don't expose error details
    const message = env.isProduction
        ? 'Erro interno do servidor'
        : err.message

    return res.status(500).json({
        error: 'InternalError',
        code: 'INTERNAL_ERROR',
        message,
        statusCode: 500
    })
}

/**
 * Middleware para rotas não encontradas (404)
 * Middleware for routes not found (404)
 */
export function notFoundMiddleware(req, res) {
    res.status(404).json({
        error: 'NotFoundError',
        code: 'NOT_FOUND',
        message: `Rota ${req.method} ${req.path} nao encontrada`,
        statusCode: 404
    })
}

export default errorHandlerMiddleware
