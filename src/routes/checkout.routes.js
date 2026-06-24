/**
 * @fileoverview Rotas de checkout
 *               Checkout routes
 * @module routes/checkout
 */

import { Router } from 'express'
import * as checkoutController from '../controllers/checkout.controller.js'

const router = Router()

/**
 * @route POST /checkout/sessions
 * @description Cria uma nova sessão de checkout
 *              Creates a new checkout session
 * @body {string} [country] - País (default: BR) / Country (default: BR)
 * @body {string} [currency] - Moeda (default: BRL) / Currency (default: BRL)
 * @body {number} [amount] - Valor em centavos (default: 2000) / Amount in cents (default: 2000)
 */
router.post('/sessions', checkoutController.createSession)

/**
 * @route POST /checkout/sessions/br
 * @description Cria sessão específica para Brasil
 *              Creates Brazil-specific session
 */
router.post('/sessions/br', checkoutController.createBrSession)

export default router
