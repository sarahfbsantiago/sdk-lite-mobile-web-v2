/**
 * @fileoverview Rotas de pagamento
 *               Payment routes
 * @module routes/payment
 */

import { Router } from 'express'
import * as paymentController from '../controllers/payment.controller.js'
import * as checkoutController from '../controllers/checkout.controller.js'

const router = Router()

/**
 * @route POST /payments
 * @description Processa um pagamento
 *              Processes a payment
 * @body {string} checkoutSession - ID da sessão de checkout / Checkout session ID
 * @body {string} oneTimeToken - Token do método de pagamento / Payment method token
 * @body {string} paymentMethodType - Tipo (CARD, PIX, PAYPAL, etc) / Type (CARD, PIX, PAYPAL, etc)
 */
router.post('/', paymentController.processPayment)

/**
 * @route POST /payments/paypal/redirect
 * @description Cria pagamento PayPal com redirect
 *              Creates PayPal payment with redirect
 * @body {number} [amount] - Valor em centavos / Amount in cents
 * @body {string} [currency] - Moeda / Currency
 */
router.post('/paypal/redirect', paymentController.createPayPalRedirect)

/**
 * @route GET /payment-methods/:checkoutSession
 * @description Obtém métodos de pagamento disponíveis
 *              Gets available payment methods
 * @param {string} checkoutSession - ID da sessão / Session ID
 */
router.get('/payment-methods/:checkoutSession', checkoutController.getPaymentMethods)

export default router
