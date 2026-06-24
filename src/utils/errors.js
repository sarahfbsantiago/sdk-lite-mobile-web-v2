/**
 * @fileoverview Classes de erro customizadas da aplicação / Custom application error classes
 * @module utils/errors
 */

/**
 * Erro base da aplicação
 * Base application error
 * Todos os erros customizados devem estender esta classe
 * All custom errors should extend this class
 */
export class AppError extends Error {
    /**
     * @param {string} message - Mensagem de erro / Error message
     * @param {number} statusCode - Código HTTP / HTTP code
     * @param {string} code - Código interno do erro / Internal error code
     */
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.code = code
        this.isOperational = true // Indica que é um erro esperado/tratável / Indicates it's an expected/handleable error

        Error.captureStackTrace(this, this.constructor)
    }

    /**
     * Serializa o erro para JSON / Serializes the error to JSON
     */
    toJSON() {
        return {
            error: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode
        }
    }
}

/**
 * Erro de validação (400 Bad Request)
 * Validation error (400 Bad Request)
 */
export class ValidationError extends AppError {
    /**
     * @param {string} message - Mensagem de erro / Error message
     * @param {Object} details - Detalhes da validação / Validation details
     */
    constructor(message, details = {}) {
        super(message, 400, 'VALIDATION_ERROR')
        this.details = details
    }

    toJSON() {
        return {
            ...super.toJSON(),
            details: this.details
        }
    }
}

/**
 * Erro de autenticação (401 Unauthorized)
 * Authentication error (401 Unauthorized)
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Não autenticado') {
        super(message, 401, 'AUTHENTICATION_ERROR')
    }
}

/**
 * Erro de autorização (403 Forbidden)
 * Authorization error (403 Forbidden)
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Sem permissão para esta operação') {
        super(message, 403, 'AUTHORIZATION_ERROR')
    }
}

/**
 * Recurso não encontrado (404 Not Found)
 * Resource not found (404 Not Found)
 */
export class NotFoundError extends AppError {
    /**
     * @param {string} resource - Nome do recurso / Resource name
     */
    constructor(resource = 'Recurso') {
        super(`${resource} não encontrado`, 404, 'NOT_FOUND')
        this.resource = resource
    }
}

/**
 * Conflito de estado (409 Conflict)
 * State conflict (409 Conflict)
 */
export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT')
    }
}

/**
 * Erro de serviço externo (502 Bad Gateway)
 * External service error (502 Bad Gateway)
 * Usado quando uma integração externa falha / Used when an external integration fails
 */
export class ExternalServiceError extends AppError {
    /**
     * @param {string} service - Nome do serviço externo / External service name
     * @param {Error} originalError - Erro original / Original error
     */
    constructor(service, originalError = null) {
        super(`Erro na integração com ${service}`, 502, 'EXTERNAL_SERVICE_ERROR')
        this.service = service
        this.originalError = originalError
    }

    toJSON() {
        return {
            ...super.toJSON(),
            service: this.service,
            originalMessage: this.originalError?.message
        }
    }
}

/**
 * Erro de pagamento / Payment error
 * Usado quando a API de pagamento rejeita uma transação
 * Used when the payment API rejects a transaction
 */
export class PaymentError extends AppError {
    /**
     * @param {string} message - Mensagem de erro / Error message
     * @param {Object} response - Resposta da API de pagamento / Payment API response
     */
    constructor(message, response = {}) {
        super(message, 400, 'PAYMENT_ERROR')
        this.paymentResponse = response
    }

    toJSON() {
        return {
            ...super.toJSON(),
            paymentResponse: this.paymentResponse
        }
    }
}

/**
 * Erro de sessão de checkout inválida
 * Invalid checkout session error
 */
export class InvalidCheckoutSessionError extends AppError {
    constructor(message = 'Sessão de checkout inválida ou expirada') {
        super(message, 400, 'INVALID_CHECKOUT_SESSION')
    }
}
