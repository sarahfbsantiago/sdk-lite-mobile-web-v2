import SwiftUI
import YunoSDK

struct CheckoutView: View {
    @ObservedObject var viewModel: CheckoutViewModel
    @StateObject private var yunoManager = YunoManager()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack {
                if yunoManager.isLoading {
                    ProgressView("Carregando metodos de pagamento...") // Loading payment methods...
                        .padding()
                } else if let error = yunoManager.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)

                        Text(error)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)

                        Button("Tentar novamente") { // Try again
                            startYunoCheckout()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    // Container para o SDK da Yuno / Container for the Yuno SDK
                    YunoPaymentMethodsView(manager: yunoManager)

                    Spacer()

                    // Botao de pagar / Pay button
                    Button(action: { yunoManager.initiatePayment() }) {
                        HStack {
                            Text("Confirmar Pagamento")
                                .fontWeight(.semibold)
                            Text(viewModel.formattedTotal)
                                .fontWeight(.bold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.purple)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .padding()
                    .disabled(!yunoManager.canPay)
                }
            }
            .navigationTitle("Pagamento")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            startYunoCheckout()
        }
        .onChange(of: yunoManager.paymentCompleted) { completed in
            if completed {
                dismiss()
            }
        }
    }

    private func startYunoCheckout() {
        guard let session = viewModel.checkoutSession else { return }
        yunoManager.startCheckout(
            session: session,
            amount: viewModel.totalAmount
        )
    }
}

// MARK: - Yuno Payment Methods View / Visualizacao dos Metodos de Pagamento Yuno
struct YunoPaymentMethodsView: UIViewControllerRepresentable {
    @ObservedObject var manager: YunoManager

    func makeUIViewController(context: Context) -> UIViewController {
        let vc = UIViewController()
        vc.view.backgroundColor = .systemBackground
        return vc
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        // O SDK da Yuno vai renderizar os metodos de pagamento aqui / The Yuno SDK will render payment methods here
        manager.hostViewController = uiViewController
    }
}

// MARK: - Yuno Manager / Gerenciador Yuno
@MainActor
class YunoManager: NSObject, ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var canPay = false
    @Published var paymentCompleted = false
    @Published var selectedPaymentMethod: String?

    weak var hostViewController: UIViewController?

    private var checkoutSession: String?
    private var amount: Double = 0

    func startCheckout(session: String, amount: Double) {
        self.checkoutSession = session
        self.amount = amount
        isLoading = true
        errorMessage = nil

        // Configurar e iniciar o SDK da Yuno / Configure and start the Yuno SDK
        Task {
            do {
                try await loadPaymentMethods()
                isLoading = false
                canPay = true
            } catch {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    private func loadPaymentMethods() async throws {
        // Aqui o SDK da Yuno carrega os metodos de pagamento / Here the Yuno SDK loads the payment methods
        // usando Yuno.getPaymentMethodViewAsync(delegate: self) / using Yuno.getPaymentMethodViewAsync(delegate: self)
        guard let session = checkoutSession else {
            throw ApiError.noData
        }

        // Simulando carregamento (o SDK real faria isso) / Simulating loading (the real SDK would do this)
        try await Task.sleep(nanoseconds: 1_000_000_000)
    }

    func initiatePayment() {
        guard let session = checkoutSession else { return }

        // Chamar Yuno.startPayment() / Call Yuno.startPayment()
        // O SDK vai retornar o one-time token via delegate / The SDK will return the one-time token via delegate
        Yuno.startPayment(showPaymentStatus: true)
    }
}

// MARK: - YunoPaymentDelegate / Delegado de Pagamento Yuno
extension YunoManager: YunoPaymentDelegate {
    var countryCode: String { Config.shared.countryCode }
    var language: String? { Config.shared.language }

    nonisolated var viewController: UIViewController? {
        // Return the host view controller on main thread / Retorna o view controller hospedeiro na thread principal
        DispatchQueue.main.sync {
            return hostViewController
        }
    }

    nonisolated func yunoCreatePayment(with token: String) {
        // Recebeu o token do SDK, agora criar o pagamento no backend / Received the SDK token, now create the payment in the backend
        Task { @MainActor in
            do {
                guard let session = checkoutSession else { return }

                let response = try await ApiService.shared.createPayment(
                    checkoutSession: session,
                    oneTimeToken: token,
                    amount: amount
                )

                if response.sdkActionRequired == true {
                    // Continuar com acoes adicionais (ex: 3DS) / Continue with additional actions (e.g.: 3DS)
                    Yuno.continuePayment()
                } else {
                    paymentCompleted = true
                }
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    nonisolated func yunoPaymentResult(_ result: Yuno.Result) {
        Task { @MainActor in
            switch result {
            case .success:
                paymentCompleted = true
            case .fail:
                errorMessage = "Pagamento falhou" // Payment failed
            case .processing:
                errorMessage = "Pagamento em processamento" // Payment processing
            case .reject:
                errorMessage = "Pagamento rejeitado" // Payment rejected
            case .internalError:
                errorMessage = "Erro interno" // Internal error
            case .userCancell:
                errorMessage = nil // Usuario cancelou / User cancelled
            @unknown default:
                errorMessage = "Erro desconhecido" // Unknown error
            }
        }
    }
}
