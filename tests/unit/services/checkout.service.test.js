/**
 * @fileoverview Testes unitarios do CheckoutService
 */

import { jest } from '@jest/globals'

// Mock do modulo de integracao
jest.unstable_mockModule('../../../src/integrations/yuno/index.js', () => ({
    createCheckoutSession: jest.fn(),
    getPaymentMethods: jest.fn()
}))

// Import apos mock
const { createCheckoutSession, getPaymentMethods } = await import('../../../src/integrations/yuno/index.js')
const { checkoutService } = await import('../../../src/services/checkout.service.js')

describe('CheckoutService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createSession', () => {
        it('deve criar uma sessao de checkout com sucesso', async () => {
            // Arrange
            const mockResponse = {
                checkout_session: 'session_123',
                country: 'BR',
                amount: { currency: 'BRL', value: 2000 }
            }
            createCheckoutSession.mockResolvedValue(mockResponse)

            // Act
            const result = await checkoutService.createSession({
                country: 'BR',
                currency: 'BRL',
                amount: 2000
            })

            // Assert
            expect(result.checkout_session).toBe('session_123')
            expect(createCheckoutSession).toHaveBeenCalledTimes(1)
        })

        it('deve lancar ValidationError para valor zero', async () => {
            // Act & Assert
            await expect(
                checkoutService.createSession({ amount: 0 })
            ).rejects.toThrow('Valor deve ser maior que zero')
        })

        it('deve lancar ValidationError para valor negativo', async () => {
            // Act & Assert
            await expect(
                checkoutService.createSession({ amount: -100 })
            ).rejects.toThrow('Valor deve ser maior que zero')
        })

        it('deve lancar InvalidCheckoutSessionError quando API nao retorna sessao', async () => {
            // Arrange
            createCheckoutSession.mockResolvedValue({ messages: ['Erro de configuracao'] })

            // Act & Assert
            await expect(
                checkoutService.createSession()
            ).rejects.toThrow('Erro de configuracao')
        })
    })

    describe('getAvailablePaymentMethods', () => {
        it('deve retornar metodos de pagamento', async () => {
            // Arrange
            const mockMethods = [
                { type: 'CARD', name: 'Cartao' },
                { type: 'PIX', name: 'PIX' }
            ]
            getPaymentMethods.mockResolvedValue(mockMethods)

            // Act
            const result = await checkoutService.getAvailablePaymentMethods('session_123')

            // Assert
            expect(result).toEqual(mockMethods)
            expect(getPaymentMethods).toHaveBeenCalledWith('session_123')
        })

        it('deve lancar ValidationError sem checkoutSession', async () => {
            // Act & Assert
            await expect(
                checkoutService.getAvailablePaymentMethods('')
            ).rejects.toThrow('Sessao de checkout e obrigatoria')
        })
    })
})
