# Yuno Checkout - Mobile

Native mobile apps for checkout using Yuno SDK, sharing the same credentials as the web project.

## Structure

```
mobile/
├── shared/
│   └── config.json        # Shared credentials (reference)
├── ios/
│   └── YunoCheckout/      # iOS Project (SwiftUI)
└── android/
    └── YunoCheckout/      # Android Project (Jetpack Compose)
```

## Shared Credentials

Both apps use the same credentials from the main project's `.env`:

| Credential | Value |
|------------|-------|
| API URL | `https://api-sandbox.y.uno` |
| Account Code | `b48d0a7f-3874-498a-98ca-4ee429612893` |
| Customer ID | `7ab03456-833c-4c8d-8a83-833b777363c6` |
| Public API Key | `sandbox_gAAAAA...` (same as web) |

## Backend

Both apps consume the same backend (`server.js`) that already exists in the project:

```bash
# Start the server
cd "/Users/sarahsantiago/Desktop/SDK lite 1.5"
node server.js
# Server running at http://localhost:8082
```

### Endpoints used:
- `POST /checkout-session` - Create checkout session
- `POST /payments` - Create payment
- `GET /payment-methods` - List payment methods

## iOS

```bash
cd mobile/ios/YunoCheckout
open Package.swift  # Opens in Xcode
```

Requirements: Xcode 15+, iOS 15+

## Android

Open Android Studio and select:
```
mobile/android/YunoCheckout
```

Requirements: Android Studio 2023.1.1+, SDK 34

### Note for Android Emulator
The emulator uses `10.0.2.2` to access the host machine's localhost.
This is already configured in the code.
