/**
 * @fileoverview Agregador de rotas
 *               Routes aggregator
 * @module routes
 */

import { Router } from 'express'
import checkoutRoutes from './checkout.routes.js'
import paymentRoutes from './payment.routes.js'
import webhookRoutes from './webhook.routes.js'
import * as paymentController from '../controllers/payment.controller.js'

const router = Router()

// Montar rotas / Mount routes
router.use('/checkout', checkoutRoutes)
router.use('/payments', paymentRoutes)
router.use('/webhook', webhookRoutes)

// Rotas adicionais (legado - manter compatibilidade) / Additional routes (legacy - maintain compatibility)
router.post('/payment-link', paymentController.createPaymentLink)
router.post('/nupay/payment-conditions', paymentController.getNuPayConditions)

// Rota legada de payment-methods / Legacy payment-methods route
router.get('/payment-methods/:checkoutSession', async (req, res, next) => {
    const { checkoutService } = await import('../services/checkout.service.js')
    try {
        const result = await checkoutService.getAvailablePaymentMethods(req.params.checkoutSession)
        res.json(result)
    } catch (error) {
        next(error)
    }
})

export default router
