/**
 * @fileoverview Operações de pagamento com a API Yuno
 *               Payment operations with the Yuno API
 * @module integrations/yuno/payments
 */

import { yunoClient } from './client.js'
import { env } from '../../config/environment.js'

/**
 * Cria um novo pagamento
 * Creates a new payment
 *
 * @param {string} idempotencyKey - Chave de idempotência (UUID) / Idempotency key (UUID)
 * @param {Object} payment - Dados do pagamento / Payment data
 * @returns {Promise<Object>} Resposta da criação do pagamento / Payment creation response
 */
export async function createPayment(idempotencyKey, payment) {
    const payload = {
        account_id: env.YUNO_ACCOUNT_CODE,
        ...payment
    }

    return yunoClient.post('/v1/payments', payload, {
        name: 'CREATE_PAYMENT',
        headers: {
            'X-idempotency-key': idempotencyKey
        }
    })
}

/**
 * Cria um link de pagamento
 * Creates a payment link
 *
 * @param {Object} data - Dados do link de pagamento / Payment link data
 * @param {string} data.merchant_order_id - ID do pedido / Order ID
 * @param {string} data.description - Descrição / Description
 * @param {string} data.country - País / Country
 * @param {Object} data.amount - Valor / Amount
 * @param {Array<string>} data.payment_method_types - Tipos de pagamento aceitos / Accepted payment types
 *
 * @returns {Promise<Object>} Resposta com checkout_url / Response with checkout_url
 */
export async function createPaymentLink(data) {
    const payload = {
        account_id: env.YUNO_ACCOUNT_CODE,
        ...data
    }

    return yunoClient.post('/v1/payment-links', payload, {
        name: 'CREATE_PAYMENT_LINK'
    })
}

/**
 * Obtém condições de pagamento do NuPay
 * Gets NuPay payment conditions
 * @note Em produção, integrar com SpinPay API
 *       In production, integrate with SpinPay API
 *
 * @param {number} amount - Valor do pagamento / Payment amount
 * @param {string} document - Documento do cliente / Customer document
 * @returns {Promise<Array>} Condições de pagamento / Payment conditions
 */
export async function getNuPayPaymentConditions(amount, document) {
    // Mock - em produção integrar com SpinPay / Mock - in production integrate with SpinPay
    return [
        {
            type: 'debit',
            installmentPlans: [
                { amount, number: 1 }
            ]
        },
        {
            type: 'credit',
            installmentPlans: [
                { amount, number: 1 },
                { amount: amount / 2, number: 2 },
                {
                    amount: amount / 3,
                    number: 3,
                    interest: 0.05,
                    interestAmount: amount * 0.05,
                    iof: amount * 0.008,
                    iofPercentage: 0.008,
                    totalAmount: amount * 1.08,
                    cet: 0.88
                }
            ]
        },
        {
            type: 'credit_with_additional_limit',
            amount,
            additionalLimitMessage: 'Nao consome o limite do cartao',
            installmentPlans: [
                {
                    amount: amount * 1.01,
                    interestAmount: amount * 0.02,
                    number: 1,
                    interest: 0.0499,
                    iof: amount * 0.0038,
                    iofPercentage: 0.0055,
                    cet: 0.939,
                    totalAmount: amount * 1.039
                }
            ]
        }
    ]
}
