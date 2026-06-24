# Yuno Integration - Web + Mobile

> Select your platform and integration type

---

## Web Integrations

| Integration | Port | Status | Link |
|-------------|------|--------|------|
| **SDK Lite** | `:8081` | Available | [Open](web/sdk-lite/) |
| SDK Full | `:8082` | Coming Soon | - |
| SDK Seamless | `:8083` | Coming Soon | - |
| SDK Headless | `:8084` | Coming Soon | - |
| Secure Fields | `:8085` | Coming Soon | - |

---

## iOS Integrations

| Integration | Status | Link |
|-------------|--------|------|
| **SDK Lite** | Available | [Open](mobile/ios/sdk-lite/) |
| SDK Full | Coming Soon | - |
| SDK Headless | Coming Soon | - |

---

## Android Integrations

| Integration | Status | Link |
|-------------|--------|------|
| **SDK Lite** | Available | [Open](mobile/android/sdk-lite/) |
| SDK Complete | Coming Soon | - |
| SDK Headless | Coming Soon | - |

---

## Project Structure

```
/
├── web/
│   ├── sdk-lite/           # Checkout Lite + External Buttons
│   │   ├── views/          # HTML templates (index.html, checkout.html)
│   │   └── public/         # Static assets (css/, images/)
│   ├── sdk-full/           # Checkout Full (coming soon)
│   ├── sdk-seamless/       # Seamless Checkout (coming soon)
│   ├── sdk-headless/       # Headless API (coming soon)
│   └── secure-fields/      # Secure Fields (coming soon)
│
├── mobile/
│   ├── ios/
│   │   ├── sdk-lite/       # iOS SDK Lite (SwiftUI)
│   │   ├── sdk-full/       # iOS SDK Full (coming soon)
│   │   └── sdk-headless/   # iOS Headless (coming soon)
│   └── android/
│       ├── sdk-lite/       # Android SDK Lite (Jetpack Compose)
│       ├── sdk-complete/   # Android SDK Complete (coming soon)
│       └── sdk-headless/   # Android Headless (coming soon)
│
├── src/                    # Backend (shared)
│   ├── config/             # Environment config
│   ├── controllers/        # HTTP entry points
│   ├── services/           # Business logic
│   ├── routes/             # Route definitions
│   ├── integrations/yuno/  # Yuno API client
│   ├── middlewares/        # Logging, error handling
│   └── utils/              # Logger, error classes
│
├── tests/                  # Unit tests (jest)
├── docs/                   # ADRs, guides, payment methods
└── yuno-official-sdks/     # Official SDK references
```

---

## Quick Start (Web SDK Lite)

```bash
# 1. Configure
cp .env.example .env

# 2. Install
npm install

# 3. Run
npm start

# 4. Open
# http://localhost:8081
```

---

## Development

```bash
npm run dev       # Run with auto-reload (node --watch)
npm test          # Run the test suite
npm run lint      # Lint the source code
npm run lint:fix  # Lint and auto-fix
```

---

## SDK Versions

| Platform | Version |
|----------|---------|
| Web | v1.9 |
| iOS | 2.18.0 |
| Android | 2.17.0 |

---

## Payment Methods

See the complete **[Payment Methods Guide](docs/PAYMENT_METHODS.md)** for:
- Compatibility matrix (Web/iOS/Android)
- Sandbox vs Production support
- Requirements per method
- Testing instructions

### Quick Reference

| Method | Web | iOS | Android | Sandbox |
|--------|:---:|:---:|:-------:|:-------:|
| Apple Pay | Safari | Device | - | No |
| Google Pay | Chrome | - | Yes | Yes |
| PayPal | Yes | Yes | Yes | Yes |
| PIX | Yes | Yes | Yes | Yes |
| Card | Yes | Yes | Yes | Yes |

---

## Official Documentation

- **Yuno Docs:** https://docs.y.uno
- **What is Yuno:** https://docs.y.uno/docs/how-yuno-works/what-is-yuno

### SDK Repositories

| Platform | Repository |
|----------|------------|
| Web | https://github.com/yuno-payments/yuno-sdk-web |
| iOS | https://github.com/yuno-payments/yuno-sdk-ios |
| Android | https://github.com/yuno-payments/yuno-sdk-android |

---

## Support

- **Documentation:** https://docs.y.uno
- **Sandbox Dashboard:** https://dashboard-sandbox.y.uno
- **Production Dashboard:** https://dashboard.y.uno
