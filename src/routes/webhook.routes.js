/**
 * @fileoverview Rotas de webhook
 *               Webhook routes
 * @module routes/webhook
 */

import { Router } from 'express'
import * as webhookController from '../controllers/webhook.controller.js'

const router = Router()

/**
 * @route POST /webhook/yuno
 * @description Recebe webhooks da Yuno
 *              Receives webhooks from Yuno
 */
router.post('/yuno', webhookController.handleYunoWebhook)

/**
 * @route GET /webhook/yuno
 * @description Health check do webhook
 *              Webhook health check
 */
router.get('/yuno', webhookController.webhookHealthCheck)

export default router
