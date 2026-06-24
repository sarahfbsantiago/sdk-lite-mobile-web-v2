/**
 * @fileoverview Mock da API Yuno para testes
 */

import fixtures from '../fixtures/payments.json' assert { type: 'json' }

/**
 * Mock do cliente Yuno
 */
export const mockYunoClient = {
    post: jest.fn(),
    get: jest.fn(),
    request: jest.fn()
}

/**
 * Configura mock para retornar sessao de checkout valida
 */
export function mockSuccessfulCheckoutSession() {
    mockYunoClient.post.mockResolvedValue(fixtures.checkoutSession.success)
}

/**
 * Configura mock para retornar erro de checkout
 */
export function mockFailedCheckoutSession() {
    mockYunoClient.post.mockResolvedValue(fixtures.checkoutSession.error)
}

/**
 * Configura mock para retornar pagamento aprovado
 */
export function mockApprovedPayment() {
    mockYunoClient.post.mockResolvedValue(fixtures.paymentResponse.approved)
}

/**
 * Configura mock para retornar pagamento recusado
 */
export function mockDeclinedPayment() {
    mockYunoClient.post.mockResolvedValue(fixtures.paymentResponse.declined)
}

/**
 * Configura mock para simular erro de rede
 */
export function mockNetworkError() {
    mockYunoClient.post.mockRejectedValue(new Error('Network error'))
}

/**
 * Reseta todos os mocks
 */
export function resetMocks() {
    mockYunoClient.post.mockReset()
    mockYunoClient.get.mockReset()
    mockYunoClient.request.mockReset()
}

export default mockYunoClient
