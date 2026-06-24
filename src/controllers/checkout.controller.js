/**
 * @fileoverview Controller de checkout - handlers HTTP
 * @fileoverview Checkout controller - HTTP handlers
 * @module controllers/checkout
 */

import { checkoutService } from '../services/checkout.service.js'

/**
 * Cria uma sessão de checkout
 * Creates a checkout session
 * POST /checkout/sessions
 */
export async function createSession(req, res, next) {
    try {
        const { country, currency, amount } = req.body || {}
        const result = await checkoutService.createSession({ country, currency, amount })
        res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Cria sessão de checkout específica para BR
 * Creates Brazil-specific checkout session
 * POST /checkout/sessions/br
 */
export async function createBrSession(req, res, next) {
    try {
        const result = await checkoutService.createSession({
            country: 'BR',
            currency: 'BRL',
            amount: 2000,
            description: 'Test BR checkout'
        })
        res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Obtém métodos de pagamento disponíveis
 * Gets available payment methods
 * GET /payment-methods/:checkoutSession
 */
export async function getPaymentMethods(req, res, next) {
    try {
        const { checkoutSession } = req.params
        const result = await checkoutService.getAvailablePaymentMethods(checkoutSession)
        res.json(result)
    } catch (error) {
        next(error)
    }
}
