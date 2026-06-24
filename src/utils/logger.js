/**
 * @fileoverview Sistema de logging estruturado / Structured logging system
 * @module utils/logger
 */

import { env } from '../config/environment.js'

/**
 * Níveis de log disponíveis / Available log levels
 */
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}

const currentLevel = LOG_LEVELS[env.LOG_LEVEL] ?? LOG_LEVELS.INFO

/**
 * Formata uma mensagem de log como JSON estruturado
 * Formats a log message as structured JSON
 * @param {string} level - Nível do log / Log level
 * @param {string|Object} data - Dados a serem logados / Data to be logged
 * @returns {string} JSON formatado / Formatted JSON
 */
function formatLog(level, data) {
    const timestamp = new Date().toISOString()
    const message = typeof data === 'string' ? { message: data } : data

    return JSON.stringify({
        timestamp,
        level,
        ...message
    })
}

/**
 * Formata log visualmente para desenvolvimento
 * Formats log visually for development
 * @param {string} level - Nível do log / Log level
 * @param {string|Object} data - Dados a serem logados / Data to be logged
 */
function formatDevLog(level, data) {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    const icons = {
        ERROR: '\u274C',
        WARN: '\u26A0\uFE0F',
        INFO: '\u2139\uFE0F',
        DEBUG: '\uD83D\uDD0D'
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    return `[${timestamp}] ${icons[level] || ''} ${level}: ${message}`
}

/**
 * Determina se deve usar formato JSON ou legível
 * Determines whether to use JSON or readable format
 */
const useStructuredLogs = env.isProduction

/**
 * Logger centralizado da aplicação
 * Centralized application logger
 */
export const logger = {
    /**
     * Log de erro - para falhas que precisam de atenção
     * Error log - for failures that need attention
     * @param {string|Object} data - Dados do erro / Error data
     */
    error(data) {
        if (currentLevel >= LOG_LEVELS.ERROR) {
            const output = useStructuredLogs
                ? formatLog('ERROR', data)
                : formatDevLog('ERROR', data)
            console.error(output)
        }
    },

    /**
     * Log de aviso - para situações potencialmente problemáticas
     * Warning log - for potentially problematic situations
     * @param {string|Object} data - Dados do aviso / Warning data
     */
    warn(data) {
        if (currentLevel >= LOG_LEVELS.WARN) {
            const output = useStructuredLogs
                ? formatLog('WARN', data)
                : formatDevLog('WARN', data)
            console.warn(output)
        }
    },

    /**
     * Log informativo - para eventos importantes do fluxo
     * Info log - for important flow events
     * @param {string|Object} data - Dados informativos / Informative data
     */
    info(data) {
        if (currentLevel >= LOG_LEVELS.INFO) {
            const output = useStructuredLogs
                ? formatLog('INFO', data)
                : formatDevLog('INFO', data)
            console.log(output)
        }
    },

    /**
     * Log de debug - para detalhes durante desenvolvimento
     * Debug log - for details during development
     * @param {string|Object} data - Dados de debug / Debug data
     */
    debug(data) {
        if (currentLevel >= LOG_LEVELS.DEBUG) {
            const output = useStructuredLogs
                ? formatLog('DEBUG', data)
                : formatDevLog('DEBUG', data)
            console.log(output)
        }
    },

    /**
     * Log de requisição HTTP (entrada)
     * HTTP request log (input)
     * @param {Object} req - Objeto de requisição Express / Express request object
     */
    request(req) {
        this.info({
            type: 'HTTP_REQUEST',
            method: req.method,
            path: req.path,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            ip: req.ip || req.connection?.remoteAddress
        })
    },

    /**
     * Log de resposta HTTP (saída)
     * HTTP response log (output)
     * @param {number} statusCode - Código de status / Status code
     * @param {number} duration - Duração em ms / Duration in ms
     */
    response(statusCode, duration) {
        this.info({
            type: 'HTTP_RESPONSE',
            statusCode,
            duration: `${duration}ms`
        })
    },

    /**
     * Log de chamada à API externa
     * External API call log
     * @param {Object} options - Opções da chamada / Call options
     */
    externalApi(options) {
        const { name, method, url, requestBody, statusCode, responseData, duration } = options

        this.info({
            type: 'EXTERNAL_API',
            name,
            method,
            url,
            statusCode,
            duration: duration ? `${duration}ms` : undefined
        })

        if (env.isDevelopment) {
            if (requestBody) {
                this.debug({ type: 'API_REQUEST_BODY', body: requestBody })
            }
            if (responseData) {
                this.debug({ type: 'API_RESPONSE_BODY', body: responseData })
            }
        }
    },

    /**
     * Log de webhook recebido
     * Received webhook log
     * @param {Object} payload - Payload do webhook / Webhook payload
     */
    webhook(payload) {
        this.info({
            type: 'WEBHOOK_RECEIVED',
            eventType: payload.event_type || payload.type,
            paymentId: payload.payment_id || payload.id,
            status: payload.status
        })
    }
}

export default logger
