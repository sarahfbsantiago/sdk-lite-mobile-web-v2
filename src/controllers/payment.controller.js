/**
 * @fileoverview Controller de pagamentos - handlers HTTP
 * @fileoverview Payment controller - HTTP handlers
 * @module controllers/payment
 */

import { paymentService } from '../services/payment.service.js'

/**
 * Processa um pagamento
 * Processes a payment
 * POST /payments
 */
export async function processPayment(req, res, next) {
    try {
        const result = await paymentService.processPayment(req.body, req)
        res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Cria pagamento PayPal com redirect
 * Creates PayPal payment with redirect
 * POST /payments/paypal/redirect
 */
export async function createPayPalRedirect(req, res, next) {
    try {
        const { amount, currency } = req.body || {}
        const result = await paymentService.createPayPalRedirect({ amount, currency }, req)
        res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Cria um link de pagamento
 * Creates a payment link
 * POST /payment-link
 */
export async function createPaymentLink(req, res, next) {
    try {
        const { productName, amount, currency, payment_method_types } = req.body || {}
        const result = await paymentService.createLink({
            productName,
            amount: amount != null ? Number(amount) : undefined,
            currency,
            paymentMethodTypes: payment_method_types
        })
        res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Obtém condições de pagamento NuPay
 * Gets NuPay payment conditions
 * POST /nupay/payment-conditions
 */
export async function getNuPayConditions(req, res, next) {
    try {
        const { amount, document } = req.body
        const result = await paymentService.getNuPayConditions(amount, document)
        res.json(result)
    } catch (error) {
        next(error)
    }
}
