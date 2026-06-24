import Foundation
import SwiftUI

@MainActor
class CheckoutViewModel: ObservableObject {
    @Published var products: [Product] = Product.samples
    @Published var cart: [String: Int] = [:]
    @Published var showCheckout = false
    @Published var checkoutSession: String?
    @Published var isLoading = false
    @Published var errorMessage: String?

    var canCheckout: Bool {
        totalAmount > 0
    }

    var totalAmount: Double {
        products.reduce(0) { total, product in
            let qty = cart[product.id] ?? 0
            return total + (product.price * Double(qty))
        }
    }

    var formattedSubtotal: String {
        formatCurrency(totalAmount)
    }

    var formattedTotal: String {
        formatCurrency(totalAmount)
    }

    // MARK: - Cart Actions / Acoes do Carrinho
    func quantity(for product: Product) -> Int {
        cart[product.id] ?? 0
    }

    func increaseQuantity(for product: Product) {
        cart[product.id, default: 0] += 1
    }

    func decreaseQuantity(for product: Product) {
        if let current = cart[product.id], current > 0 {
            cart[product.id] = current - 1
        }
    }

    // MARK: - Checkout / Finalizar Compra
    func startCheckout() {
        guard canCheckout else { return }

        Task {
            await createCheckoutSession()
        }
    }

    func createCheckoutSession() async {
        isLoading = true
        errorMessage = nil

        do {
            let session = try await ApiService.shared.createCheckoutSession(amount: totalAmount)
            checkoutSession = session
            showCheckout = true
        } catch {
            errorMessage = "Erro ao criar sessao: \(error.localizedDescription)" // Error creating session
        }

        isLoading = false
    }

    // MARK: - Helpers / Auxiliares
    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "BRL"
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSNumber(value: value)) ?? "R$ \(value)"
    }
}
