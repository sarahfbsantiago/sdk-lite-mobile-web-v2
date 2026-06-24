import Foundation

enum ApiError: Error {
    case invalidURL
    case noData
    case decodingError
    case serverError(String)
}

class ApiService {
    static let shared = ApiService()
    private let baseURL: String

    private init() {
        baseURL = Config.shared.backendUrl
    }

    // MARK: - Create Checkout Session / Criar Sessao de Checkout
    /// Chama o backend (server.js) para criar uma sessao de checkout
    /// Calls the backend (server.js) to create a checkout session
    func createCheckoutSession(amount: Double) async throws -> String {
        guard let url = URL(string: "\(baseURL)/checkout-session") else {
            throw ApiError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "amount": [
                "currency": Config.shared.currency,
                "value": Int(amount * 100) // centavos / cents
            ],
            "customer_id": Config.shared.customerId,
            "account_code": Config.shared.accountCode
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw ApiError.serverError("Erro do servidor") // Server error
        }

        let decoded = try JSONDecoder().decode(CheckoutSessionResponse.self, from: data)
        return decoded.checkoutSession
    }

    // MARK: - Create Payment / Criar Pagamento
    /// Cria o pagamento apos receber o token do SDK
    /// Creates the payment after receiving the SDK token
    func createPayment(
        checkoutSession: String,
        oneTimeToken: String,
        amount: Double
    ) async throws -> PaymentResponse {
        guard let url = URL(string: "\(baseURL)/payments") else {
            throw ApiError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "checkout_session": checkoutSession,
            "one_time_token": oneTimeToken,
            "amount": [
                "currency": Config.shared.currency,
                "value": Int(amount * 100)
            ],
            "customer_id": Config.shared.customerId
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(PaymentResponse.self, from: data)
    }
}
