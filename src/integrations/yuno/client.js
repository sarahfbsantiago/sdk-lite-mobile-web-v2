/**
 * @fileoverview Cliente HTTP para a API Yuno
 *               HTTP client for the Yuno API
 * @module integrations/yuno/client
 */

import { env } from '../../config/environment.js'
import { logger } from '../../utils/logger.js'
import { ExternalServiceError } from '../../utils/errors.js'

/**
 * Cliente para comunicação com a API Yuno
 * Client for communication with the Yuno API
 */
class YunoClient {
    constructor() {
        this.baseUrl = env.YUNO_API_URL
        this.publicApiKey = env.YUNO_PUBLIC_API_KEY
        this.privateSecretKey = env.YUNO_PRIVATE_SECRET_KEY
    }

    /**
     * Headers padrão para todas as requisições
     * Default headers for all requests
     * @returns {Object} Headers
     */
    getHeaders() {
        return {
            'public-api-key': this.publicApiKey,
            'private-secret-key': this.privateSecretKey,
            'Content-Type': 'application/json'
        }
    }

    /**
     * Realiza uma requisição à API Yuno
     * Performs a request to the Yuno API
     *
     * @param {Object} options - Opções da requisição / Request options
     * @param {string} options.method - Método HTTP / HTTP method
     * @param {string} options.endpoint - Endpoint (sem base URL) / Endpoint (without base URL)
     * @param {Object} [options.body] - Corpo da requisição / Request body
     * @param {Object} [options.headers] - Headers adicionais / Additional headers
     * @param {string} [options.name] - Nome da operação (para logging) / Operation name (for logging)
     *
     * @returns {Promise<Object>} Resposta da API / API response
     * @throws {ExternalServiceError} Se a requisição falhar / If the request fails
     */
    async request({ method, endpoint, body = null, headers = {}, name = 'API Call' }) {
        const url = `${this.baseUrl}${endpoint}`
        const startTime = Date.now()

        const requestOptions = {
            method,
            headers: {
                ...this.getHeaders(),
                ...headers
            }
        }

        if (body) {
            requestOptions.body = JSON.stringify(body)
        }

        try {
            const response = await fetch(url, requestOptions)
            const responseData = await response.json()
            const duration = Date.now() - startTime

            logger.externalApi({
                name,
                method,
                url,
                requestBody: body,
                statusCode: response.status,
                responseData,
                duration
            })

            if (!response.ok) {
                const error = new ExternalServiceError('Yuno')
                error.status = response.status
                error.code = responseData?.code
                error.body = responseData
                error.message = responseData?.messages?.[0] || responseData?.message || response.statusText
                throw error
            }

            return responseData
        } catch (error) {
            if (error instanceof ExternalServiceError) {
                throw error
            }

            logger.error({
                type: 'YUNO_API_ERROR',
                name,
                url,
                error: error.message
            })

            throw new ExternalServiceError('Yuno', error)
        }
    }

    /**
     * Requisição GET
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request({ method: 'GET', endpoint, ...options })
    }

    /**
     * Requisição POST
     * POST request
     */
    async post(endpoint, body, options = {}) {
        return this.request({ method: 'POST', endpoint, body, ...options })
    }

    /**
     * Requisição PUT
     * PUT request
     */
    async put(endpoint, body, options = {}) {
        return this.request({ method: 'PUT', endpoint, body, ...options })
    }

    /**
     * Requisição DELETE
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request({ method: 'DELETE', endpoint, ...options })
    }
}

// Singleton / Singleton instance
export const yunoClient = new YunoClient()
export default yunoClient
