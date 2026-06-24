# Yuno Checkout - Android

Native Android app for checkout using Yuno SDK.

## Requirements

- Android Studio Hedgehog (2023.1.1) or higher
- Android SDK 34
- Kotlin 1.9+
- JDK 17

## Installation

1. Open Android Studio

2. Select "Open" and navigate to:
   ```
   mobile/android/YunoCheckout
   ```

3. Wait for Gradle to sync dependencies

4. Run on emulator or device

## Configuration

Credentials are in `app/src/main/java/.../Config.kt` and are the same as the web project:

- `PUBLIC_API_KEY`: Yuno public key (sandbox)
- `ACCOUNT_CODE`: Account code
- `CUSTOMER_ID`: Customer ID
- `BACKEND_URL`: Server URL

### Important for Emulator

The Android emulator uses `10.0.2.2` to access the host machine's `localhost`.
This is already configured in `Config.kt`.

For physical device, change to your machine's IP:
```kotlin
const val BACKEND_URL = "http://192.168.x.x:8082"
```

## Backend

The app uses the same backend as the web project (`server.js`).
Make sure the server is running:

```bash
cd "/Users/sarahsantiago/Desktop/SDK lite 1.5"
node server.js
```

## Structure

```
app/src/main/java/com/pigeonz/yunocheckout/
├── YunoCheckoutApp.kt     # Application, initializes SDK
├── MainActivity.kt        # Main activity
├── Config.kt              # Shared credentials
├── Models.kt              # Data models
├── ApiService.kt          # Retrofit service
├── CheckoutViewModel.kt   # ViewModel
└── ui/
    ├── MainScreen.kt      # Main screen with products
    ├── CheckoutScreen.kt  # Yuno payment screen
    └── theme/
        └── Theme.kt       # Material 3 theme
```

## Dependencies

- Yuno SDK: `com.yuno.payments:android-sdk:2.17.0`
- Jetpack Compose
- Retrofit + OkHttp
- Kotlin Coroutines
