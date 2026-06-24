import SwiftUI
import YunoSDK

@main
struct YunoCheckoutApp: App {

    init() {
        // Inicializar Yuno SDK com a PUBLIC_API_KEY / Initialize Yuno SDK with the PUBLIC_API_KEY
        let config = YunoConfig()
        Yuno.initialize(
            apiKey: Config.shared.publicApiKey,
            config: config
        )
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
