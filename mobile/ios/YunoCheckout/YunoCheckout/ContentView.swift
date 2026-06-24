import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = CheckoutViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header / Cabecalho
                    HeaderView()

                    // Produtos / Products
                    ProductListView(viewModel: viewModel)

                    // Resumo do pedido / Order summary
                    OrderSummaryView(viewModel: viewModel)

                    // Botao de checkout / Checkout button
                    CheckoutButton(viewModel: viewModel)
                }
                .padding()
            }
            .navigationBarHidden(true)
            .background(Color(.systemGroupedBackground))
        }
        .sheet(isPresented: $viewModel.showCheckout) {
            CheckoutView(viewModel: viewModel)
        }
    }
}

// MARK: - Header / Cabecalho
struct HeaderView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "bird.fill")
                .font(.system(size: 50))
                .foregroundColor(.purple)

            Text("Pigeonz Street Wear")
                .font(.title)
                .fontWeight(.bold)

            Text("Finish your order")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.vertical)
    }
}

// MARK: - Product List / Lista de Produtos
struct ProductListView: View {
    @ObservedObject var viewModel: CheckoutViewModel

    var body: some View {
        VStack(spacing: 16) {
            ForEach(viewModel.products) { product in
                ProductCard(product: product, viewModel: viewModel)
            }
        }
    }
}

struct ProductCard: View {
    let product: Product
    @ObservedObject var viewModel: CheckoutViewModel

    var body: some View {
        HStack(spacing: 16) {
            // Imagem do produto / Product image
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.2))
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: "tshirt.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.gray)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.headline)

                Text(product.description)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(product.formattedPrice)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
            }

            Spacer()

            // Quantidade / Quantity
            HStack(spacing: 12) {
                Button(action: { viewModel.decreaseQuantity(for: product) }) {
                    Image(systemName: "minus.circle.fill")
                        .foregroundColor(.purple)
                }

                Text("\(viewModel.quantity(for: product))")
                    .font(.headline)
                    .frame(width: 30)

                Button(action: { viewModel.increaseQuantity(for: product) }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.purple)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

// MARK: - Order Summary / Resumo do Pedido
struct OrderSummaryView: View {
    @ObservedObject var viewModel: CheckoutViewModel

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Subtotal")
                Spacer()
                Text(viewModel.formattedSubtotal)
            }

            Divider()

            HStack {
                Text("Total")
                    .fontWeight(.bold)
                Spacer()
                Text(viewModel.formattedTotal)
                    .fontWeight(.bold)
                    .foregroundColor(.purple)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

// MARK: - Checkout Button / Botao de Checkout
struct CheckoutButton: View {
    @ObservedObject var viewModel: CheckoutViewModel

    var body: some View {
        Button(action: { viewModel.startCheckout() }) {
            HStack {
                Text("Pagar com Yuno")
                    .fontWeight(.semibold)
                Image(systemName: "creditcard.fill")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(viewModel.canCheckout ? Color.purple : Color.gray)
            .foregroundColor(.white)
            .cornerRadius(12)
        }
        .disabled(!viewModel.canCheckout)
    }
}

#Preview {
    ContentView()
}
