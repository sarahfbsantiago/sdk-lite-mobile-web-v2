# Web SDK Lite (Checkout Lite + External Buttons)

This integration uses **Checkout Lite** pattern with **External Buttons** for Apple Pay, Google Pay, and PayPal.

## Quick Start

### 1. Configure Environment

```bash
# From project root
cp .env.example .env
nano .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Server

```bash
npm start
```

Server runs at `http://localhost:8081`

## Files

| File | Description |
|------|-------------|
| `index.html` | Main checkout page with Apple Pay, Google Pay, PayPal |
| `checkout.html` | Alternative checkout page |
| `public/` | Static assets (CSS, images) |

## SDK Configuration

**Version:** v1.9

```html
<script src="https://sdk-web.y.uno/v1.9/main.js" defer></script>
```

**Methods Used:**
- `Yuno.initialize()` - Initialize SDK
- `yuno.startCheckout()` - Start checkout session
- `yuno.mountCheckoutLite()` - Mount payment form for specific method
- `yuno.mountExternalButtons()` - Mount Apple Pay, Google Pay, PayPal buttons

## Integration Flow

```
1. Client requests Checkout Session from Backend
2. Backend creates session via Yuno API
3. Client initializes Yuno SDK with session
4. SDK renders Apple Pay / Google Pay / PayPal buttons
5. User taps payment button
6. SDK opens native payment interface
7. User authenticates (Face ID / Touch ID / Biometrics)
8. SDK generates One-Time Token (OTT)
9. Client sends OTT to Backend
10. Backend creates payment via Yuno API
11. Result returns to client
```

## Code Example

```javascript
window.addEventListener("yuno-sdk-ready", async () => {
  // 1. Get checkout session from backend
  const response = await fetch("/checkout/sessions", { method: "POST" });
  const { checkout_session, country } = await response.json();

  // 2. Initialize Yuno SDK
  const yuno = await Yuno.initialize("your-public-api-key");

  // 3. Start checkout
  await yuno.startCheckout({
    checkoutSession: checkout_session,
    elementSelector: "#checkout-container",
    countryCode: country,
    currency: "BRL",
    language: "en",

    async yunoCreatePayment(oneTimeToken) {
      const result = await fetch("/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oneTimeToken,
          checkoutSession: checkout_session,
          paymentMethodType: "APPLE_PAY"
        })
      });
      yuno.continuePayment({ showPaymentStatus: true });
    },

    yunoPaymentResult: (data) => console.log("Payment result:", data),
    yunoError: (error) => console.error("Payment error:", error)
  });

  // 4. Mount Apple Pay and Google Pay buttons
  await yuno.mountExternalButtons([
    { paymentMethodType: "APPLE_PAY", elementSelector: "#apple-pay-button" },
    { paymentMethodType: "GOOGLE_PAY", elementSelector: "#google-pay-button" }
  ]);
});
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/checkout/sessions` | Create checkout session |
| GET | `/payment-methods/:session` | List available methods |
| POST | `/payments` | Process payment |

## Token Types: DPAN vs FPAN

| Payment Method | Token Type | Notes |
|----------------|------------|-------|
| **Apple Pay** | Always DPAN | Apple always uses network tokenization |
| **Google Pay** | DPAN or FPAN | Depends on card/issuer configuration |

## Troubleshooting

### Apple Pay Issues

| Problem | Solution |
|---------|----------|
| Button not showing | Verify Safari browser or iOS device with Apple Pay configured |
| "Merchant ID invalid" | Check Merchant ID in Apple Developer Portal |
| "Domain not verified" | Register domain in Apple Developer Portal |

### Google Pay Issues

| Problem | Solution |
|---------|----------|
| Button not showing | Verify Chrome browser or Android device with Google Pay |
| "Merchant not enabled" | Configure Merchant ID in Google Pay Console |

## Documentation

- [Payment Methods Guide](../../docs/PAYMENT_METHODS.md) - Sandbox/Production compatibility, requirements
- [Yuno Docs](https://docs.y.uno)
- [Web SDK Repository](https://github.com/yuno-payments/yuno-sdk-web)
