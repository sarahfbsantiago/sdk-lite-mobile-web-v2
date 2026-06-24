# Mobile Integrations

Select your platform and integration type:

## iOS

| Integration | Status | Link |
|-------------|--------|------|
| **SDK Lite** | Available | [Open](ios/sdk-lite/) |
| SDK Full | Coming Soon | [Open](ios/sdk-full/) |
| SDK Headless | Coming Soon | [Open](ios/sdk-headless/) |

## Android

| Integration | Status | Link |
|-------------|--------|------|
| **SDK Lite** | Available | [Open](android/sdk-lite/) |
| SDK Complete | Coming Soon | [Open](android/sdk-complete/) |
| SDK Headless | Coming Soon | [Open](android/sdk-headless/) |

---

## Shared Configuration

Both apps use the same credentials from the main project's `.env`:

| Credential | Value |
|------------|-------|
| API URL | `https://api-sandbox.y.uno` |
| Account Code | From `.env` |
| Public API Key | From `.env` |

## Backend

Both apps consume the same backend (`src/app.js`):

```bash
# Start server
npm start
# Server running at http://localhost:8081
```

### Endpoints:
- `POST /checkout/sessions` - Create checkout session
- `POST /payments` - Create payment
- `GET /payment-methods/:session` - List payment methods

---

## SDK Versions

| Platform | Version |
|----------|---------|
| iOS | 2.18.0 |
| Android | 2.17.0 |

## Documentation

- [iOS SDK Repository](https://github.com/yuno-payments/yuno-sdk-ios)
- [Android SDK Repository](https://github.com/yuno-payments/yuno-sdk-android)
