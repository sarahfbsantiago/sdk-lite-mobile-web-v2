/**
 * @fileoverview Controller de webhooks - handlers HTTP
 * @fileoverview Webhook controller - HTTP handlers
 * @module controllers/webhook
 */

import { logger } from '../utils/logger.js'

/**
 * Eventos suportados pelo webhook
 * Events supported by the webhook
 */
const SUPPORTED_EVENTS = [
    'PAYMENT.CREATED',
    'PAYMENT.SUCCEEDED',
    'PAYMENT.APPROVED',
    'PAYMENT.DECLINED',
    'PAYMENT.FAILED',
    'PAYMENT.PENDING',
    'PAYMENT.REFUNDED',
    'PAYMENT.CANCELLED'
]

/**
 * Processa webhook da Yuno
 * Processes Yuno webhook
 * POST /webhook/yuno
 */
export async function handleYunoWebhook(req, res) {
    const payload = req.body

    logger.webhook(payload)

    // Extrair dados do evento / Extract event data
    const eventType = payload.event_type || payload.type || req.headers['x-event-type']
    const paymentId = payload.payment_id || payload.id || payload.data?.id
    const status = payload.status || payload.data?.status
    const merchantOrderId = payload.merchant_order_id || payload.data?.merchant_order_id

    // Processar por tipo de evento / Process by event type
    switch (eventType) {
        case 'PAYMENT.CREATED':
        case 'payment.created':
            logger.info({ type: 'WEBHOOK_EVENT', event: 'payment_created', paymentId })
            // TODO: Salvar no banco de dados / Save to database
            break

        case 'PAYMENT.SUCCEEDED':
        case 'PAYMENT.APPROVED':
        case 'payment.succeeded':
        case 'payment.approved':
            logger.info({ type: 'WEBHOOK_EVENT', event: 'payment_approved', paymentId })
            // TODO: Liberar produto/serviço, enviar email / Release product/service, send email
            break

        case 'PAYMENT.DECLINED':
        case 'PAYMENT.FAILED':
        case 'payment.declined':
        case 'payment.failed':
            logger.warn({ type: 'WEBHOOK_EVENT', event: 'payment_failed', paymentId })
            // TODO: Notificar cliente / Notify customer
            break

        case 'PAYMENT.PENDING':
        case 'payment.pending':
            logger.info({ type: 'WEBHOOK_EVENT', event: 'payment_pending', paymentId })
            break

        case 'PAYMENT.REFUNDED':
        case 'payment.refunded':
            logger.info({ type: 'WEBHOOK_EVENT', event: 'payment_refunded', paymentId })
            break

        case 'PAYMENT.CANCELLED':
        case 'payment.cancelled':
            logger.info({ type: 'WEBHOOK_EVENT', event: 'payment_cancelled', paymentId })
            break

        default:
            logger.info({ type: 'WEBHOOK_EVENT', event: 'unknown', eventType, paymentId })
    }

    // Responder 200 OK para confirmar recebimento / Respond 200 OK to confirm receipt
    res.status(200).json({
        success: true,
        message: 'Webhook recebido com sucesso',
        received_at: new Date().toISOString(),
        event_type: eventType,
        payment_id: paymentId
    })
}

/**
 * Health check do webhook
 * Webhook health check
 * GET /webhook/yuno
 */
export function webhookHealthCheck(req, res) {
    res.json({
        status: 'active',
        message: 'Webhook endpoint esta ativo. Use POST para receber eventos.',
        endpoint: '/webhook/yuno',
        supported_events: SUPPORTED_EVENTS
    })
}
