/**
 * @fileoverview Serviço de pagamentos - lógica de negócio
 * @fileoverview Payment service - business logic
 * @module services/payment
 */

import * as uuid from 'uuid'
import { env } from '../config/environment.js'
import { createPayment, createPaymentLink, getNuPayPaymentConditions } from '../integrations/yuno/index.js'
import { ValidationError, PaymentError } from '../utils/errors.js'

/**
 * Mapeamento de tipos de pagamento
 * Payment type mapping
 */
const PAYMENT_TYPE_MAP = {
    0: 'GOOGLE_PAY',
    1: 'APPLE_PAY',
    2: 'PAYPAL',
    '0': 'GOOGLE_PAY',
    '1': 'APPLE_PAY',
    '2': 'PAYPAL'
}

/**
 * Serviço responsável pela lógica de pagamentos
 * Service responsible for payment logic
 */
class PaymentService {
    /**
     * Processa um pagamento
     * Processes a payment
     *
     * @param {Object} data - Dados do pagamento / Payment data
     * @param {string} data.checkoutSession - ID da sessão de checkout / Checkout session ID
     * @param {string} data.oneTimeToken - Token do método de pagamento / Payment method token
     * @param {string} data.paymentMethodType - Tipo do método (CARD, PIX, etc) / Method type (CARD, PIX, etc)
     * @param {string} [data.documentNumber] - CPF/CNPJ do pagador / Payer's CPF/CNPJ
     * @param {Object} [data.nuPayData] - Dados específicos do NuPay / NuPay specific data
     * @param {Object} [data.clickToPayData] - Dados do Click to Pay / Click to Pay data
     * @param {number} [data.installments] - Número de parcelas / Number of installments
     * @param {string} [data.installmentsType] - Tipo de parcelamento / Installment type
     * @param {Object} req - Request Express (para construir callback_url) / Express Request (to build callback_url)
     *
     * @returns {Promise<Object>} Resultado do pagamento / Payment result
     */
    async processPayment(data, req) {
        const {
            checkoutSession,
            oneTimeToken,
            paymentMethodType: rawType = 'CARD',
            documentNumber = '35104075397',
            nuPayData,
            clickToPayData,
            installments,
            installmentsType
        } = data

        if (!checkoutSession) {
            throw new ValidationError('Sessao de checkout e obrigatoria', {
                field: 'checkoutSession'
            })
        }

        const paymentMethodType = this.normalizePaymentType(rawType)
        const cleanDocument = documentNumber.replace(/\D/g, '').slice(0, 11)

        const payment = this.buildPaymentPayload({
            checkoutSession,
            oneTimeToken,
            paymentMethodType,
            documentNumber: cleanDocument,
            nuPayData,
            clickToPayData,
            installments,
            installmentsType,
            req
        })

        const idempotencyKey = uuid.v4()
        const response = await createPayment(idempotencyKey, payment)

        // Log temporário para debug - mostra response completo da Yuno
        // Temporary debug log - shows full Yuno response
        console.log('\n========== YUNO PAYMENT RESPONSE ==========')
        console.log(JSON.stringify(response, null, 2))
        console.log('=============================================\n')

        if (response?.code || response?.error || response?.messages) {
            throw new PaymentError(
                response?.messages?.[0] || response?.message || 'Pagamento rejeitado',
                response
            )
        }

        // Adicionar redirect_url para PayPal/Smart PIX / Add redirect_url for PayPal/Smart PIX
        if (this.isRedirectPayment(paymentMethodType) && !response.redirect_url) {
            response.redirect_url = this.extractRedirectUrl(response)
        }

        return response
    }

    /**
     * Normaliza o tipo de pagamento
     * Normalizes the payment type
     */
    normalizePaymentType(rawType) {
        return PAYMENT_TYPE_MAP[rawType] ??
               (typeof rawType === 'string' ? rawType : String(rawType))
    }

    /**
     * Verifica se é pagamento com redirect
     * Checks if it's a redirect payment
     */
    isRedirectPayment(type) {
        const redirectTypes = ['PAYPAL', 'PAYPAL_WALLET', 'PAY_PAL', 'SMART_PIX', 'SMARTPIX']
        return redirectTypes.includes(type) || type.toUpperCase() === 'SMART_PIX'
    }

    /**
     * Extrai URL de redirect da resposta
     * Extracts redirect URL from response
     */
    extractRedirectUrl(response) {
        const pm = response.payment_method ?? response.data?.payment_method
        const detail = pm?.payment_method_detail ?? pm?.detail
        const wallet = detail?.wallet ?? detail?.paypal
        const smartPix = detail?.smart_pix

        return response.data?.redirect_url ||
               pm?.redirect_url ||
               detail?.redirect_url ||
               wallet?.redirect_url ||
               detail?.paypal?.redirect_url ||
               smartPix?.redirect_url ||
               response.approval_url ||
               pm?.approval_url ||
               response.checkout_url
    }

    /**
     * Constrói o payload de pagamento
     * Builds the payment payload
     */
    buildPaymentPayload({
        checkoutSession,
        oneTimeToken,
        paymentMethodType,
        documentNumber,
        nuPayData,
        clickToPayData,
        installments,
        installmentsType,
        req
    }) {
        const country = 'BR'
        const currency = 'BRL'
        const amount = 2000

        const payment = {
            description: 'Pigeonz Street Wear - Payment',
            merchant_order_id: `payment-${Date.now()}`,
            country,
            amount: { currency, value: amount },
            checkout: { session: checkoutSession },
            customer_payer: {
                billing_address: {
                    address_line_1: '123 Example St',
                    address_line_2: 'Apt 502',
                    city: 'New York',
                    country,
                    state: 'NY',
                    zip_code: '10001'
                },
                shipping_address: {
                    address_line_1: '123 Example St',
                    address_line_2: 'Apt 502',
                    city: 'New York',
                    country,
                    state: 'NY',
                    zip_code: '10001'
                },
                document: {
                    document_type: 'CPF',
                    document_number: documentNumber
                },
                id: env.YUNO_CUSTOMER_ID,
                nationality: 'BR'
            },
            payment_method: {
                type: paymentMethodType,
                token: oneTimeToken,
                vaulted_token: null
            }
        }

        // Adicionar detalhes específicos por tipo / Add specific details by type
        this.addPaymentTypeDetails(payment, {
            paymentMethodType,
            nuPayData,
            clickToPayData,
            installments,
            installmentsType,
            documentNumber,
            req
        })

        return payment
    }

    /**
     * Adiciona detalhes específicos por tipo de pagamento
     * Adds specific details by payment type
     */
    addPaymentTypeDetails(payment, options) {
        const { paymentMethodType, nuPayData, clickToPayData, installments, installmentsType, documentNumber, req } = options
        const baseUrl = env.BASE_URL || `${req?.protocol}://${req?.get?.('host')}`

        // NuPay
        if (nuPayData && paymentMethodType === 'NU_PAY') {
            payment.payment_method.detail = {
                nupay: {
                    funding_source: nuPayData.fundingSource,
                    installments: nuPayData.installments,
                    authorization_type: nuPayData.authorizationType
                }
            }
        }

        // Parcelamento cartão / Card installments
        if (installments && paymentMethodType === 'CARD') {
            payment.payment_method.detail = {
                card: {
                    installments,
                    installments_type: installmentsType || 'MERCHANT'
                }
            }
            payment.metadata = [
                { key: 'cpf', value: documentNumber },
                { key: 'type', value: 'card' }
            ]
        }

        // Smart PIX
        const isSmartPix = ['SMART_PIX', 'SMARTPIX'].includes(paymentMethodType) ||
                          paymentMethodType.toUpperCase() === 'SMART_PIX'
        if (isSmartPix) {
            payment.payment_method.type = 'SMART_PIX'
            payment.payment_method.detail = { smart_pix: {} }
            payment.workflow = 'REDIRECT'
            payment.callback_url = `${baseUrl}/payment-success?provider=smart_pix`
            payment.metadata = [
                { key: 'cpf', value: documentNumber },
                { key: 'payment_method', value: 'smart_pix' }
            ]
        }

        // PayPal
        const isPayPal = ['PAYPAL', 'PAYPAL_WALLET', 'PAY_PAL'].includes(paymentMethodType)
        if (isPayPal) {
            payment.payment_method.type = 'PAYPAL'
            payment.payment_method.detail = { paypal: {} }
            payment.workflow = 'REDIRECT'
            payment.callback_url = `${baseUrl}/payment-success?provider=paypal`
            payment.metadata = [
                { key: 'payment_method', value: 'paypal' },
                { key: 'type', value: 'wallet' }
            ]
        }

        // Click to Pay
        if (paymentMethodType === 'CLICK_TO_PAY') {
            const fundingSource = (clickToPayData?.fundingSource ?? 'debit').toLowerCase()
            payment.payment_method.type = 'CLICK_TO_PAY'
            payment.payment_method.detail = {
                click_to_pay: {
                    funding_source: fundingSource === 'credit' ? 'credit' : 'debit'
                }
            }
        }
    }

    /**
     * Cria pagamento PayPal com redirect
     * Creates PayPal payment with redirect
     */
    async createPayPalRedirect({ amount = 2000, currency = 'BRL' }, req) {
        const baseUrl = env.BASE_URL || `${req.protocol}://${req.get('host')}`
        const callbackUrl = `${baseUrl}/payment-success?provider=paypal`
        const merchantOrderId = `order-paypal-${Date.now()}`

        // Criar sessão primeiro / Create session first
        const { checkoutService } = await import('./checkout.service.js')
        const session = await checkoutService.createSession({
            country: 'BR',
            currency,
            amount,
            description: 'Pagamento PayPal - Pigeonz Street Wear'
        })

        const checkoutSession = session.checkout_session

        // Criar pagamento / Create payment
        const payment = {
            description: 'Pigeonz Street Wear - PayPal',
            merchant_order_id: merchantOrderId,
            country: 'BR',
            amount: { currency, value: amount },
            checkout: { session: checkoutSession },
            payment_method: { type: 'PAYPAL', detail: { paypal: {} } },
            callback_url: callbackUrl,
            workflow: 'REDIRECT',
            customer_payer: {
                id: env.YUNO_CUSTOMER_ID,
                document: { document_type: 'CPF', document_number: '35104075397' },
                nationality: 'BR'
            }
        }

        const idempotencyKey = uuid.v4()
        const response = await createPayment(idempotencyKey, payment)

        if (response?.code || response?.error) {
            throw new PaymentError(
                response?.messages || response?.message || 'Erro ao criar pagamento PayPal',
                response
            )
        }

        let redirectUrl = this.extractRedirectUrl(response)

        // Fallback: criar Payment Link / Fallback: create Payment Link
        if (!redirectUrl) {
            redirectUrl = await this.createPayPalFallbackLink(amount, currency)
        }

        if (!redirectUrl) {
            throw new PaymentError('Yuno nao retornou redirect_url', response)
        }

        return { success: true, redirect_url: redirectUrl }
    }

    /**
     * Cria Payment Link como fallback para PayPal
     * Creates Payment Link as fallback for PayPal
     */
    async createPayPalFallbackLink(amount, currency) {
        try {
            const amountValue = amount >= 100 ? amount / 100 : amount
            let linkResponse = await createPaymentLink({
                merchant_order_id: `paypal-${Date.now()}`,
                description: 'Pagamento PayPal - Pigeonz Street Wear',
                country: 'BR',
                amount: { value: amountValue, currency },
                payment_method_types: ['PAYPAL']
            })

            if (linkResponse?.code || linkResponse?.error) {
                linkResponse = await createPaymentLink({
                    merchant_order_id: `paypal-${Date.now()}`,
                    description: 'Pagamento PayPal - Pigeonz Street Wear',
                    country: 'BR',
                    amount: { value: amountValue, currency },
                    payment_method_types: ['CARD', 'PIX', 'SMART_PIX', 'BOLETO', 'PAYPAL']
                })
            }

            return linkResponse?.checkout_url ||
                   linkResponse?.payment_link ||
                   linkResponse?.url ||
                   linkResponse?.link
        } catch (error) {
            return null
        }
    }

    /**
     * Cria um link de pagamento
     * Creates a payment link
     */
    async createLink({ productName, amount, currency = 'BRL', paymentMethodTypes }) {
        const productAmount = amount ?? 20.00
        const methods = Array.isArray(paymentMethodTypes) && paymentMethodTypes.length > 0
            ? paymentMethodTypes
            : ['CARD', 'PIX', 'SMART_PIX', 'BOLETO']

        const response = await createPaymentLink({
            merchant_order_id: `ORDER-${Date.now()}`,
            description: `Payment ${productName || 'Urban Textures T-Shirt'} - Pigeonz Street Wear`,
            country: 'BR',
            amount: { value: productAmount, currency },
            payment_method_types: methods
        })

        if (response.code || response.error) {
            throw new PaymentError(
                response.messages || response.message || 'Erro ao criar link',
                response
            )
        }

        return {
            success: true,
            paymentLink: response.checkout_url || response.payment_link || response.url || response.link,
            linkId: response.id,
            amount: productAmount,
            currency,
            productName: productName || 'Urban Textures T-Shirt',
            fullResponse: response
        }
    }

    /**
     * Obtém condições de pagamento NuPay
     * Gets NuPay payment conditions
     */
    async getNuPayConditions(amount, document) {
        return getNuPayPaymentConditions(amount, document)
    }
}

export const paymentService = new PaymentService()
export default paymentService
