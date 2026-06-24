# Payment Methods Guide

Complete reference for payment methods supported by Yuno SDK across platforms and integration types.

---

## Quick Compatibility Matrix

| Method | Web | iOS | Android | Sandbox | Production |
|--------|:---:|:---:|:-------:|:-------:|:----------:|
| **Apple Pay** | Safari | Physical Device | - | No | Yes |
| **Google Pay** | Chrome | - | Yes | Yes | Yes |
| **PayPal** | Yes | Yes | Yes | Yes | Yes |
| **NuPay** | Yes | - | - | Limited | Yes |
| **PIX** | Yes | Yes | Yes | Yes | Yes |
| **Card** | Yes | Yes | Yes | Yes | Yes |

---

## Integration Type Support

| Method | SDK Lite | SDK Full | SDK Seamless | Headless | Direct API |
|--------|:--------:|:--------:|:------------:|:--------:|:----------:|
| **Apple Pay** | Yes | Yes | Yes | Yes | No |
| **Google Pay** | Yes | Yes | Yes | Yes | No |
| **PayPal** | Yes | Yes | Yes | Yes | Yes |
| **NuPay** | Yes | Yes | Yes | Yes | Yes |
| **PIX** | Yes | Yes | Yes | Yes | Yes |
| **Card** | Yes | Yes | Yes | Yes | Yes |

---

## Apple Pay

### Overview
Digital wallet by Apple. Uses network tokenization (DPAN) for secure transactions.

### Platform Support

| Platform | Support | Notes |
|----------|:-------:|-------|
| **Web** | Safari only | Requires domain verification |
| **iOS** | Physical device only | Simulator NOT supported |
| **Android** | Not available | - |

### Sandbox vs Production

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Sandbox** | Not testable | Apple Pay cannot be tested in sandbox |
| **Production** | Full support | Requires Apple Developer account |

### Requirements

**Web:**
- Safari browser
- Apple Pay configured on device
- Domain registered in Apple Developer Portal
- Valid Merchant ID

**iOS:**
- Physical iOS device (NOT simulator)
- Apple Pay capability in Xcode
- Merchant ID configured
- iOS 13.0+

### Token Type
- **Always DPAN** - Apple Pay always uses network tokenization

### Common Issues

| Issue | Solution |
|-------|----------|
| Button not showing | Verify Safari browser or iOS device with Apple Pay configured |
| "Merchant ID invalid" | Check Merchant ID in Apple Developer Portal |
| "Domain not verified" | Register domain in Apple Developer Portal |
| Not working in simulator | Use physical iOS device - simulator not supported |

### Testing Notes
- **Cannot test in sandbox** - Only production testing available
- Requires real Apple Pay credentials
- Use test cards provided by Apple for development

---

## Google Pay

### Overview
Digital wallet by Google. May return DPAN or FPAN depending on card issuer configuration.

### Platform Support

| Platform | Support | Notes |
|----------|:-------:|-------|
| **Web** | Chrome recommended | Works on other browsers with Google Pay support |
| **iOS** | Not available | - |
| **Android** | Full support | Emulator supported |

### Sandbox vs Production

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Sandbox** | Full support | Can test with test cards |
| **Production** | Full support | Requires Google Pay Console approval |

### Requirements

**Web:**
- Browser with Google Pay support (Chrome recommended)
- Google account with Google Pay configured

**Android:**
- Google Pay app installed
- Google account configured
- Android 5.0+ (API level 21)
- Works in emulator

### Token Type
- **DPAN or FPAN** - Depends on card/issuer configuration
- Check `card_data.network_token`:
  - `null` → FPAN
  - `{ iin, lfd, ... }` → DPAN

### Common Issues

| Issue | Solution |
|-------|----------|
| Button not showing | Verify Chrome browser or Android device with Google Pay |
| "Merchant not enabled" | Configure Merchant ID in Google Pay Console |
| Production error | Request Google Pay production approval |

### Testing Notes
- **Can test in sandbox** with Google test cards
- Emulator works for Android testing
- Production requires Google approval process

---

## PayPal

### Overview
Global payment platform supporting checkout and redirect flows.

### Platform Support

| Platform | Support | Notes |
|----------|:-------:|-------|
| **Web** | Full support | Redirect or embedded flow |
| **iOS** | Full support | Opens PayPal app or web |
| **Android** | Full support | Opens PayPal app or web |

### Sandbox vs Production

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Sandbox** | Full support | Use PayPal sandbox accounts |
| **Production** | Full support | Real PayPal accounts |

### Requirements
- PayPal account (sandbox or production)
- PayPal configured in Yuno dashboard
- Redirect URL configured for web

### Integration Methods
- **SDK Lite/Full:** `mountExternalButtons()` with `PAYPAL` type
- **Direct API:** Redirect flow with callback URL

### Common Issues

| Issue | Solution |
|-------|----------|
| Redirect not working | Verify callback URL configuration |
| Payment not completing | Check PayPal account status |

### Testing Notes
- Create PayPal sandbox accounts at developer.paypal.com
- Test both buyer and seller flows

---

## NuPay

### Overview
Brazilian payment method by Nubank. Allows installment payments.

### Platform Support

| Platform | Support | Notes |
|----------|:-------:|-------|
| **Web** | Full support | - |
| **iOS** | Limited | Check availability |
| **Android** | Limited | Check availability |

### Sandbox vs Production

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Sandbox** | Limited testing | Some features may not work |
| **Production** | Full support | Requires Nubank partnership |

### Requirements
- Nubank partnership configured in Yuno
- Brazilian merchant account
- BRL currency

### Specific Endpoints
- `POST /nupay/payment-conditions` - Get installment conditions

### Common Issues

| Issue | Solution |
|-------|----------|
| Method not appearing | Verify NuPay enabled in Yuno dashboard |
| Installments not loading | Check payment conditions endpoint |

### Testing Notes
- Sandbox testing is limited
- Contact Yuno support for NuPay sandbox credentials

---

## PIX

### Overview
Brazilian instant payment system by Central Bank. Real-time transfers 24/7.

### Platform Support

| Platform | Support | Notes |
|----------|:-------:|-------|
| **Web** | Full support | QR Code or copy/paste |
| **iOS** | Full support | QR Code or deep link |
| **Android** | Full support | QR Code or deep link |

### Sandbox vs Production

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Sandbox** | Full support | Simulated PIX transactions |
| **Production** | Full support | Real PIX transfers |

### Requirements
- Brazilian merchant account
- PIX key configured
- BRL currency

### Payment Flow
1. Generate PIX QR Code
2. User scans with banking app
3. User confirms payment
4. Webhook notification received
5. Payment confirmed

### Common Issues

| Issue | Solution |
|-------|----------|
| QR Code not generating | Verify PIX enabled in Yuno dashboard |
| Payment not confirming | Check webhook configuration |

### Testing Notes
- Sandbox simulates full PIX flow
- Test QR Code scanning and manual code entry

---

## Card (Credit/Debit)

### Overview
Traditional card payments. Supports credit and debit cards from multiple brands.

### Platform Support

| Platform | Support | Notes |
|----------|:-------:|-------|
| **Web** | Full support | Secure Fields or SDK form |
| **iOS** | Full support | Native SDK form |
| **Android** | Full support | Native SDK form |

### Sandbox vs Production

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Sandbox** | Full support | Use test card numbers |
| **Production** | Full support | Real card processing |

### Supported Brands
- Visa
- Mastercard
- American Express
- Elo
- Hipercard
- Others (region dependent)

### Integration Methods
- **SDK Lite:** `mountCheckoutLite()` for card form
- **SDK Full:** Card form included in payment list
- **Secure Fields:** Custom card form with tokenization
- **Direct API:** Server-side card processing (PCI required)

### Test Cards (Sandbox)

| Brand | Number | CVV | Expiry |
|-------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |

### Common Issues

| Issue | Solution |
|-------|----------|
| Card declined | Use valid test card numbers in sandbox |
| 3DS challenge failing | Verify 3DS configuration |
| Form not loading | Check SDK initialization |

### Testing Notes
- Use Yuno test cards for sandbox
- Test 3DS flows when available
- Test different card brands

---

## SDK Method Reference

### Web SDK

```javascript
// Mount external buttons (Apple Pay, Google Pay, PayPal)
await yuno.mountExternalButtons([
  { paymentMethodType: "APPLE_PAY", elementSelector: "#apple-pay" },
  { paymentMethodType: "GOOGLE_PAY", elementSelector: "#google-pay" },
  { paymentMethodType: "PAYPAL", elementSelector: "#paypal" }
]);

// Mount card form
await yuno.mountCheckoutLite({
  paymentMethodType: "CARD",
  elementSelector: "#card-form"
});
```

### iOS SDK

```swift
// Start payment with specific method
Yuno.startPaymentLite(
  paymentMethodType: .applePay,
  // ... configuration
)
```

### Android SDK

```kotlin
// Start payment with specific method
Yuno.startPaymentLite(
  paymentMethodType = PaymentMethodType.GOOGLE_PAY,
  // ... configuration
)
```

---

## Documentation Links

- **Yuno Docs:** https://docs.y.uno
- **Web SDK:** https://github.com/yuno-payments/yuno-sdk-web
- **iOS SDK:** https://github.com/yuno-payments/yuno-sdk-ios
- **Android SDK:** https://github.com/yuno-payments/yuno-sdk-android
