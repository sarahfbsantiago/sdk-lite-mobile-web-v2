# Yuno Checkout - iOS

Native iOS app for checkout using Yuno SDK.

## Requirements

- Xcode 15+
- iOS 15+
- Swift 5.9+

## Installation

1. Open the project in Xcode:
   ```bash
   cd mobile/ios/YunoCheckout
   open Package.swift
   ```

2. Wait for Xcode to resolve dependencies (Yuno SDK)

3. Configure the Development Team in Signing & Capabilities

4. Run on simulator or device

## Configuration

Credentials are in `YunoCheckout/Config.swift` and are the same as the web project:

- `publicApiKey`: Yuno public key (sandbox)
- `accountCode`: Account code
- `customerId`: Customer ID
- `backendUrl`: Server URL (http://localhost:8082)

## Backend

The app uses the same backend as the web project (`server.js`).
Make sure the server is running:

```bash
cd "/Users/sarahsantiago/Desktop/SDK lite 1.5"
node server.js
```

## Structure

```
YunoCheckout/
├── YunoCheckoutApp.swift   # Entry point, initializes SDK
├── Config.swift            # Shared credentials
├── ContentView.swift       # Main screen with products
├── CheckoutView.swift      # Payment screen with Yuno SDK
├── CheckoutViewModel.swift # Cart logic
├── ApiService.swift        # Backend communication
├── Models.swift            # Data models
└── Info.plist              # App settings
```
