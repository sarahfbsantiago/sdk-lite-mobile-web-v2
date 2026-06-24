import Foundation

/// Configuracoes compartilhadas - mesmas credenciais do projeto web
/// Shared configurations - same credentials from the web project
struct Config {
    static let shared = Config()

    // MARK: - Yuno Credentials (do .env do projeto principal) / Yuno Credentials (from the main project .env)
    let apiUrl = "https://api-sandbox.y.uno"
    let publicApiKey = "sandbox_gAAAAABmsPEk3FoharvZ2w_FCTu61C9i6T2h8_OktdR6ABPoo0ZKOfvR3hLvR_STblCfA7X769CXTCu24jUbEhuL4J8ZzaRHPkYFCeyENFeJ_o5yo6KXWldzFCBBm5W3WGyWkjnJourLuEsi59CJ_6qlUZIDwhL4SGBmiySCf_eyiUEGSL1326eyrwfzhXpqAH3LWST4i1TTx-T3SQTeb4dUJ3I22CnKNQ2psxa7Xf-v5mVLRfAveQPrvW0UeIEgajARpUIbCemH"
    let accountCode = "b48d0a7f-3874-498a-98ca-4ee429612893"
    let customerId = "7ab03456-833c-4c8d-8a83-833b777363c6"

    // MARK: - Backend (server.js do projeto principal) / Backend (server.js from the main project)
    let backendUrl = "http://localhost:8082"

    // MARK: - Checkout Settings / Configuracoes de Checkout
    let countryCode = "BR"
    let currency = "BRL"
    let language = "pt"

    private init() {}
}
