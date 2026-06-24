/**
 * @fileoverview Serviço de checkout - lógica de negócio
 * @fileoverview Checkout service - business logic
 * @module services/checkout
 */

import { env } from '../config/environment.js'
import { createCheckoutSession, getPaymentMethods } from '../integrations/yuno/index.js'
import { ValidationError, InvalidCheckoutSessionError } from '../utils/errors.js'

/**
 * Serviço responsável pela lógica de checkout
 * Service responsible for checkout logic
 */
class CheckoutService {
    /**
     * Cria uma nova sessão de checkout
     * Creates a new checkout session
     *
     * @param {Object} options - Opções / Options
     * @param {string} [options.country='BR'] - País / Country
     * @param {string} [options.currency='BRL'] - Moeda / Currency
     * @param {number} [options.amount=2000] - Valor em centavos / Value in cents
     * @param {string} [options.description] - Descrição do pagamento / Payment description
     *
     * @returns {Promise<Object>} Dados da sessão criada / Created session data
     */
    async createSession({ country = 'BR', currency = 'BRL', amount = 2000, description } = {}) {
        if (amount <= 0) {
            throw new ValidationError('Valor deve ser maior que zero', {
                field: 'amount',
                received: amount
            })
        }

        const order = {
            merchant_order_id: `order-${Date.now()}`,
            payment_description: description || 'Pigeonz Street Wear - Checkout',
            country,
            amount: {
                value: amount,
                currency
            }
        }

        const response = await createCheckoutSession(order)

        const sessionId = response?.checkout_session ||
                         response?.data?.checkout_session ||
                         response?.id

        if (!sessionId) {
            throw new InvalidCheckoutSessionError(
                response?.messages?.[0] || 'Sessao de checkout invalida ou vazia'
            )
        }

        return {
            checkout_session: sessionId,
            country: response.country ?? country,
            currency: response.amount?.currency ?? currency,
            ...response
        }
    }

    /**
     * Obtém métodos de pagamento disponíveis para uma sessão
     * Gets available payment methods for a session
     *
     * @param {string} checkoutSession - ID da sessão / Session ID
     * @returns {Promise<Array>} Métodos de pagamento / Payment methods
     */
    async getAvailablePaymentMethods(checkoutSession) {
        if (!checkoutSession) {
            throw new ValidationError('Sessao de checkout e obrigatoria', {
                field: 'checkoutSession'
            })
        }

        return getPaymentMethods(checkoutSession)
    }
}

export const checkoutService = new CheckoutService()
export default checkoutService
