/**
 * @fileoverview Operações de checkout com a API Yuno
 *               Checkout operations with the Yuno API
 * @module integrations/yuno/checkout
 */

import { yunoClient } from './client.js'
import { env } from '../../config/environment.js'

/**
 * Cria uma nova sessão de checkout
 * Creates a new checkout session
 *
 * @param {Object} order - Dados do pedido / Order data
 * @param {string} order.merchant_order_id - ID único do pedido no merchant / Unique order ID in merchant
 * @param {string} order.payment_description - Descrição do pagamento / Payment description
 * @param {string} order.country - Código do país (ex: 'BR') / Country code (e.g., 'BR')
 * @param {Object} order.amount - Valor do pedido / Order amount
 * @param {number} order.amount.value - Valor em centavos / Amount in cents
 * @param {string} order.amount.currency - Moeda (ex: 'BRL') / Currency (e.g., 'BRL')
 * @param {string} [order.customer_id] - ID do cliente / Customer ID
 *
 * @returns {Promise<Object>} Resposta com checkout_session / Response with checkout_session
 */
export async function createCheckoutSession(order) {
    const payload = {
        account_id: env.YUNO_ACCOUNT_CODE,
        ...order
    }

    if (!payload.customer_id && env.YUNO_CUSTOMER_ID) {
        payload.customer_id = env.YUNO_CUSTOMER_ID
    }

    return yunoClient.post('/v1/checkout/sessions', payload, {
        name: 'CREATE_CHECKOUT_SESSION'
    })
}

/**
 * Obtém os métodos de pagamento disponíveis para uma sessão
 * Gets the available payment methods for a session
 *
 * @param {string} checkoutSession - ID da sessão de checkout / Checkout session ID
 * @returns {Promise<Array>} Lista de métodos de pagamento / List of payment methods
 */
export async function getPaymentMethods(checkoutSession) {
    return yunoClient.get(`/v1/checkout/sessions/${checkoutSession}/payment-methods`, {
        name: 'GET_PAYMENT_METHODS'
    })
}
