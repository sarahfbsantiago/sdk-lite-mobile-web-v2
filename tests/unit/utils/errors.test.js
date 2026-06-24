/**
 * @fileoverview Testes unitarios das classes de erro
 */

import {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    ExternalServiceError,
    PaymentError,
    InvalidCheckoutSessionError
} from '../../../src/utils/errors.js'

describe('Classes de Erro', () => {
    describe('AppError', () => {
        it('deve criar erro com valores padrao', () => {
            const error = new AppError('Erro generico')

            expect(error.message).toBe('Erro generico')
            expect(error.statusCode).toBe(500)
            expect(error.code).toBe('INTERNAL_ERROR')
            expect(error.isOperational).toBe(true)
            expect(error.name).toBe('AppError')
        })

        it('deve serializar para JSON corretamente', () => {
            const error = new AppError('Teste', 400, 'TEST_ERROR')
            const json = error.toJSON()

            expect(json).toEqual({
                error: 'AppError',
                code: 'TEST_ERROR',
                message: 'Teste',
                statusCode: 400
            })
        })
    })

    describe('ValidationError', () => {
        it('deve criar erro com status 400', () => {
            const error = new ValidationError('Campo invalido', { field: 'email' })

            expect(error.statusCode).toBe(400)
            expect(error.code).toBe('VALIDATION_ERROR')
            expect(error.details).toEqual({ field: 'email' })
        })

        it('deve incluir details no JSON', () => {
            const error = new ValidationError('Invalido', { campo: 'teste' })
            const json = error.toJSON()

            expect(json.details).toEqual({ campo: 'teste' })
        })
    })

    describe('AuthenticationError', () => {
        it('deve criar erro com status 401', () => {
            const error = new AuthenticationError()

            expect(error.statusCode).toBe(401)
            expect(error.code).toBe('AUTHENTICATION_ERROR')
            expect(error.message).toBe('Não autenticado')
        })
    })

    describe('AuthorizationError', () => {
        it('deve criar erro com status 403', () => {
            const error = new AuthorizationError()

            expect(error.statusCode).toBe(403)
            expect(error.code).toBe('AUTHORIZATION_ERROR')
        })
    })

    describe('NotFoundError', () => {
        it('deve criar erro com status 404', () => {
            const error = new NotFoundError('Usuario')

            expect(error.statusCode).toBe(404)
            expect(error.code).toBe('NOT_FOUND')
            expect(error.message).toBe('Usuario não encontrado')
        })
    })

    describe('ConflictError', () => {
        it('deve criar erro com status 409', () => {
            const error = new ConflictError('Recurso ja existe')

            expect(error.statusCode).toBe(409)
            expect(error.code).toBe('CONFLICT')
        })
    })

    describe('ExternalServiceError', () => {
        it('deve criar erro com status 502', () => {
            const originalError = new Error('Connection refused')
            const error = new ExternalServiceError('Yuno', originalError)

            expect(error.statusCode).toBe(502)
            expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
            expect(error.service).toBe('Yuno')
            expect(error.originalError).toBe(originalError)
        })

        it('deve incluir service e originalMessage no JSON', () => {
            const originalError = new Error('Timeout')
            const error = new ExternalServiceError('API', originalError)
            const json = error.toJSON()

            expect(json.service).toBe('API')
            expect(json.originalMessage).toBe('Timeout')
        })
    })

    describe('PaymentError', () => {
        it('deve criar erro com status 400', () => {
            const response = { code: 'INSUFFICIENT_FUNDS' }
            const error = new PaymentError('Saldo insuficiente', response)

            expect(error.statusCode).toBe(400)
            expect(error.code).toBe('PAYMENT_ERROR')
            expect(error.paymentResponse).toEqual(response)
        })
    })

    describe('InvalidCheckoutSessionError', () => {
        it('deve criar erro com status 400', () => {
            const error = new InvalidCheckoutSessionError()

            expect(error.statusCode).toBe(400)
            expect(error.code).toBe('INVALID_CHECKOUT_SESSION')
        })
    })
})
