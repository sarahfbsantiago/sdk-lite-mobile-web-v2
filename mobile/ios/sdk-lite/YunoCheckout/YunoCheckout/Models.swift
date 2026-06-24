import Foundation

// MARK: - Product / Produto
struct Product: Identifiable {
    let id: String
    let name: String
    let description: String
    let price: Double
    let image: String

    var formattedPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "BRL"
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSNumber(value: price)) ?? "R$ \(price)"
    }

    static let samples: [Product] = [
        Product(
            id: "urban-tee",
            name: "Urban Textures Tee",
            description: "Camiseta streetwear premium", // Premium streetwear t-shirt
            price: 89.90,
            image: "camisa"
        ),
        Product(
            id: "stussy-tee",
            name: "Stussy T-Shirt",
            description: "Camiseta classica Stussy", // Classic Stussy t-shirt
            price: 129.90,
            image: "stussy"
        )
    ]
}

// MARK: - Checkout Session Response / Resposta da Sessao de Checkout
struct CheckoutSessionResponse: Codable {
    let checkoutSession: String

    enum CodingKeys: String, CodingKey {
        case checkoutSession = "checkout_session"
    }
}

// MARK: - Payment Response / Resposta do Pagamento
struct PaymentResponse: Codable {
    let id: String
    let status: String
    let sdkActionRequired: Bool?

    enum CodingKeys: String, CodingKey {
        case id
        case status
        case sdkActionRequired = "sdk_action_required"
    }
}

// MARK: - Cart Item / Item do Carrinho
struct CartItem {
    let product: Product
    var quantity: Int
}
