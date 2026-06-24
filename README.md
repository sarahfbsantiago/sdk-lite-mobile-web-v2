# Yuno Integration - Web + Mobile

> **[Versao em Portugues](#yuno-integration---web--mobile-1)**

Complete SDK integration for Apple Pay and Google Pay using Yuno across Web, iOS, and Android platforms.

---

## Table of Contents

- [SDK Types Overview](#sdk-types-overview)
- [Current Integration](#current-integration)
- [Official Documentation](#official-documentation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Architecture Overview](#architecture-overview)
- [Web SDK Integration](#web-sdk-integration)
- [iOS SDK Integration](#ios-sdk-integration)
- [Android SDK Integration](#android-sdk-integration)
- [Token Types: DPAN vs FPAN](#token-types-dpan-vs-fpan)
- [Web SDK vs Mobile SDKs](#web-sdk-vs-mobile-sdks---key-differences)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## SDK Types Overview

Yuno offers multiple SDK integration patterns for different use cases:

### Web SDK Types

| Type | Method | Description | UI Control |
|------|--------|-------------|------------|
| **Seamless Checkout** | `mountSeamlessCheckout()` | Complete checkout UI managed by SDK | SDK |
| **Seamless Checkout Lite** | `mountSeamlessCheckoutLite()` | Merchant controls payment method selection | Hybrid |
| **Checkout Full** | `mountCheckout()` | SDK provides payment method list UI | SDK |
| **Checkout Lite** | `mountCheckoutLite()` | Merchant controls UI, SDK handles payment logic | Merchant |
| **External Buttons** | `mountExternalButtons()` | Apple Pay, Google Pay, PayPal buttons | SDK buttons |
| **Secure Fields** | `secureFields()` | Custom card form with SDK tokenization | Merchant |
| **Headless** | Direct API | Full API-level control, no SDK UI | Merchant |

### Mobile SDK Types

| Platform | Type | Description |
|----------|------|-------------|
| **iOS** | Full | Complete UI managed by SDK |
| **iOS** | Lite | Merchant-controlled UI with SDK payment logic |
| **iOS** | Headless | Full API-level control |
| **Android** | Checkout Complete | SDK provides payment method list |
| **Android** | Checkout Lite | Merchant controls payment method selection |
| **Android** | Payment Render | SDK renders form in merchant layout |
| **Android** | Headless | Full API-level control |

---

## Current Integration

This project uses the following SDK configuration:

| Aspect | Value |
|--------|-------|
| **Web SDK Version** | v1.5 |
| **Integration Type** | **Checkout Lite** + **External Buttons** |
| **Methods Used** | `startCheckout()`, `mountCheckoutLite()`, `mountExternalButtons()` |

### What This Means

- **Checkout Lite**: We control the payment method selection UI, while the SDK handles the payment processing logic
- **External Buttons**: The SDK renders native Apple Pay, Google Pay, and PayPal buttons

### Available for Future Expansion

The `yuno-official-sdks/` folder contains official SDK examples for:
- All Web SDK integration types (Seamless, Full, Lite, Secure Fields, Headless)
- iOS SDK (Full, Lite, Headless modes)
- Android SDK (all patterns including Enrollment)

### SDK Version Comparison

| Platform | Our Version | Latest Official |
|----------|-------------|-----------------|
| Web | v1.5 | v1.9 |
| iOS | 2.18.0 | 2.18.0 |
| Android | 2.11.0 | 2.17.0 |

---

## Official Documentation

### Yuno Documentation

- **What is Yuno:** https://docs.y.uno/docs/how-yuno-works/what-is-yuno
- **Full Documentation:** https://docs.y.uno

### Official SDK Repositories

| Platform | Repository |
|----------|------------|
| **Web SDK** | https://github.com/yuno-payments/yuno-sdk-web |
| **iOS SDK** | https://github.com/yuno-payments/yuno-sdk-ios |
| **Android SDK** | https://github.com/yuno-payments/yuno-sdk-android |

### Dashboards

- **Sandbox:** https://dashboard-sandbox.y.uno
- **Production:** https://dashboard.y.uno

---

## Quick Start

### 1. Configure Environment

```bash
# Copy example .env
cp .env.example .env

# Edit with your Yuno credentials
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

Server runs at `http://localhost:8082`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_URL` | Yuno API URL (`https://api-sandbox.y.uno` or `https://api.y.uno`) | Yes |
| `PUBLIC_API_KEY` | Public API key | Yes |
| `PRIVATE_SECRET_KEY` | Private secret key | Yes |
| `ACCOUNT_CODE` | Account code | Yes |
| `CUSTOMER_ID` | Customer ID | No |
| `PORT` | Server port | No (default: 8082) |

---

## Project Structure

```
SDK lite 1.5/
├── src/                          # Source code
│   ├── config/                   # Configuration
│   │   ├── environment.js        # Environment variables
│   │   └── index.js
│   ├── controllers/              # HTTP handlers
│   │   ├── checkout.controller.js
│   │   ├── payment.controller.js
│   │   └── webhook.controller.js
│   ├── services/                 # Business logic
│   │   ├── checkout.service.js
│   │   └── payment.service.js
│   ├── routes/                   # Route definitions
│   │   ├── checkout.routes.js
│   │   ├── payment.routes.js
│   │   └── webhook.routes.js
│   ├── middlewares/              # Express middlewares
│   │   ├── logger.middleware.js
│   │   └── error.middleware.js
│   ├── utils/                    # Utilities
│   │   ├── errors.js             # Error classes
│   │   └── logger.js             # Logging system
│   ├── integrations/             # External clients
│   │   └── yuno/
│   │       ├── client.js         # HTTP client
│   │       ├── checkout.js       # Checkout operations
│   │       └── payments.js       # Payment operations
│   └── app.js                    # Application entry
│
├── public/                       # Static files (frontend)
├── docs/                         # Documentation
├── mobile/                       # Mobile SDK examples
│   ├── ios/                      # iOS Swift examples
│   └── android/                  # Android Kotlin examples
└── package.json
```

---

## API Endpoints

### Checkout

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/checkout/sessions` | Create checkout session |
| POST | `/checkout/sessions/br` | Create BR session (convenience) |
| GET | `/payment-methods/:session` | List available methods |

### Payments

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/payments` | Process payment |
| POST | `/payments/paypal/redirect` | PayPal with redirect |
| POST | `/payment-link` | Create payment link |
| POST | `/nupay/payment-conditions` | NuPay conditions |

### Webhook

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/webhook/yuno` | Receive Yuno events |
| GET | `/webhook/yuno` | Health check |

---

## Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   CLIENT    │ ──── │  YUNO SDK   │ ──── │   BACKEND   │ ──── │  YUNO API   │
│ Web/Mobile  │      │             │      │  (Node.js)  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

### Payment Flow

1. **Client** requests Checkout Session from **Backend**
2. **Backend** creates session via **Yuno API** and returns it
3. **Client** initializes **Yuno SDK** with the session
4. **SDK** renders Apple Pay / Google Pay buttons
5. **User** taps the payment button
6. **SDK** opens native payment interface
7. **User** authenticates (Face ID / Touch ID / Biometrics)
8. **SDK** generates **One-Time Token (OTT)**
9. **Client** sends OTT to **Backend**
10. **Backend** creates payment via **Yuno API**
11. **Result** returns to client

---

## Web SDK Integration

### Step 1: Load SDK

```html
<script src="https://sdk-web.y.uno/v1.5/main.js" defer></script>
```

### Step 2: Add Button Containers

```html
<div id="apple-pay-button"></div>
<div id="google-pay-button"></div>
```

### Step 3: Initialize SDK

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

    // Called when SDK generates the OTT
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
      const payment = await result.json();
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

---

## iOS SDK Integration

### Step 1: Add SDK via Swift Package Manager

```swift
dependencies: [
    .package(url: "https://github.com/yuno-payments/yuno-sdk-ios", from: "2.18.0")
]
```

### Step 2: Configure Capabilities

In Xcode > Target > Signing & Capabilities:
1. Add **"Apple Pay"** capability
2. Select your Merchant ID

### Step 3: Initialize and Implement

```swift
import YunoSDK

// Initialize in AppDelegate
Yuno.initialize(apiKey: "your-public-api-key", environment: .sandbox)

// Implement delegate
extension PaymentViewController: YunoPaymentDelegate {
    func yunoCreatePayment(oneTimeToken: String) {
        // Send OTT to backend
        Task {
            let result = try await createPayment(oneTimeToken: oneTimeToken)
            Yuno.continuePayment()
        }
    }

    func yunoPaymentResult(_ result: YunoPaymentResult) {
        // Handle result
    }
}
```

> **Note:** Apple Pay **does NOT work** in Simulator — requires **physical iOS device**.

---

## Android SDK Integration

### Step 1: Add SDK via Gradle

```groovy
dependencies {
    implementation "com.yuno.payments:android-sdk:2.11.0"
}
```

### Step 2: Configure AndroidManifest.xml

```xml
<meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
```

### Step 3: Initialize and Implement

```kotlin
import com.yuno.payments.core.Yuno

// Initialize in Application
Yuno.initialize(
    application = this,
    apiKey = "your-public-api-key",
    config = YunoConfig(environment = YunoEnvironment.SANDBOX)
)

// Implement delegate
class PaymentActivity : AppCompatActivity(), YunoPaymentDelegate {
    override fun onPaymentTokenGenerated(oneTimeToken: String) {
        // Send OTT to backend
        lifecycleScope.launch {
            val result = createPayment(oneTimeToken)
            Yuno.continuePayment()
        }
    }
}
```

---

## Token Types: DPAN vs FPAN

When processing payments with digital wallets, the card information is tokenized.

| Term | Full Name | Description |
|------|-----------|-------------|
| **FPAN** | Funding Primary Account Number | The actual card number printed on the physical card |
| **DPAN** | Device Primary Account Number | A tokenized card number tied to a specific device/wallet |

### Token Type by Payment Method

| Payment Method | Token Type | Notes |
|----------------|------------|-------|
| **Apple Pay** | **Always DPAN** | Apple always uses network tokenization |
| **Google Pay** | **DPAN or FPAN** | Depends on card/issuer configuration |
| Click to Pay | DPAN | Network tokenized |
| Card (manual entry) | FPAN | Actual card number |

### How to Identify DPAN vs FPAN

Yuno does **not** return an explicit `token_type` field. Check `parent_payment_method_type`:

| `parent_payment_method_type` | Token Type | Meaning |
|------------------------------|------------|---------|
| `"APPLE_PAY"` | **Always DPAN** | Apple Pay always uses network tokenization |
| `"GOOGLE_PAY"` | **DPAN or FPAN** | Check `card_data.network_token` |
| `null` or absent | **FPAN** | Direct card entry |

**For Google Pay:** Check `card_data.network_token`:
- `null` → **FPAN**
- `{ iin, lfd, ... }` → **DPAN**

### Production Response Example (Google Pay)

```json
{
  "status": "SUCCEEDED",
  "payment_method": {
    "parent_payment_method_type": "GOOGLE_PAY",
    "type": "CARD",
    "payment_method_detail": {
      "card": {
        "card_data": {
          "brand": "VISA",
          "iin": "48315006",
          "lfd": "9829",
          "network_token": null,
          "type": "CREDIT"
        }
      }
    }
  }
}
```

> `network_token: null` indicates **FPAN**. If populated, would be **DPAN**.

### Sandbox vs Production

| Aspect | Sandbox | Production |
|--------|---------|------------|
| **Apple Pay** | **Cannot be tested** | Full support, always DPAN |
| **Google Pay** | Can be tested | DPAN or FPAN depending on issuer |

---

## Web SDK vs Mobile SDKs - Key Differences

The **payment logic is identical** across all platforms. Only the UI rendering differs.

| Aspect | Web SDK | iOS SDK | Android SDK |
|--------|---------|---------|-------------|
| **Checkout Session** | Same | Same | Same |
| **Initialize** | `Yuno.initialize()` | `Yuno.initialize()` | `Yuno.initialize()` |
| **OTT Callback** | `yunoCreatePayment()` | `yunoCreatePayment()` | `onPaymentTokenGenerated()` |
| **Backend Payload** | Same | Same | Same |

> **The backend is 100% shared** — no changes needed to support Web, iOS, or Android.

### Key Differences

| Platform | Button Rendering | Testing |
|----------|------------------|---------|
| **Web SDK** | Requires HTML containers + `mountExternalButtons()` | Works in any browser |
| **iOS SDK** | Native automatic rendering | Requires **physical device** |
| **Android SDK** | Native automatic rendering | Works in emulator |

---

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
| Production error | Request Google Pay production approval |

### Common Errors

| Error | Solution |
|-------|----------|
| `INVALID_CHECKOUT_SESSION` | Generate new session with unique `merchant_order_id` |
| `PAYMENT_METHOD_NOT_AVAILABLE` | Enable method in Yuno dashboard |
| `INVALID_TOKEN` | Generate new OTT (new payment attempt) |

---

## SDK Versions

| Platform | Repository | Recommended Version |
|----------|------------|---------------------|
| Web | CDN | v1.5 |
| iOS | [yuno-sdk-ios](https://github.com/yuno-payments/yuno-sdk-ios) | 2.18.0+ |
| Android | Maven Central / JitPack | 2.11.0+ |

---

## Support

- **Documentation:** https://docs.y.uno
- **Support:** support@y.uno
- **Sandbox Dashboard:** https://dashboard-sandbox.y.uno
- **Production Dashboard:** https://dashboard.y.uno

---

---

# Yuno Integration - Web + Mobile

> **[English Version](#yuno-integration---web--mobile)**

SDK completo para integrar Apple Pay e Google Pay usando Yuno nas plataformas Web, iOS e Android.

---

## Indice

- [Visao Geral dos Tipos de SDK](#visao-geral-dos-tipos-de-sdk)
- [Integracao Atual](#integracao-atual)
- [Documentacao Oficial](#documentacao-oficial)
- [Inicio Rapido](#inicio-rapido)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Visao Geral da Arquitetura](#visao-geral-da-arquitetura)
- [Integracao Web SDK](#integracao-web-sdk)
- [Integracao iOS SDK](#integracao-ios-sdk)
- [Integracao Android SDK](#integracao-android-sdk)
- [Tipos de Token: DPAN vs FPAN](#tipos-de-token-dpan-vs-fpan)
- [Web SDK vs Mobile SDKs](#web-sdk-vs-mobile-sdks---diferencas-principais)
- [Solucao de Problemas](#solucao-de-problemas)
- [Suporte](#suporte)

---

## Visao Geral dos Tipos de SDK

A Yuno oferece multiplos padroes de integracao para diferentes casos de uso:

### Tipos de Web SDK

| Tipo | Metodo | Descricao | Controle de UI |
|------|--------|-----------|----------------|
| **Seamless Checkout** | `mountSeamlessCheckout()` | UI completa gerenciada pelo SDK | SDK |
| **Seamless Checkout Lite** | `mountSeamlessCheckoutLite()` | Merchant controla selecao de metodo | Hibrido |
| **Checkout Full** | `mountCheckout()` | SDK fornece lista de metodos de pagamento | SDK |
| **Checkout Lite** | `mountCheckoutLite()` | Merchant controla UI, SDK processa pagamento | Merchant |
| **External Buttons** | `mountExternalButtons()` | Botoes Apple Pay, Google Pay, PayPal | Botoes SDK |
| **Secure Fields** | `secureFields()` | Formulario customizado com tokenizacao SDK | Merchant |
| **Headless** | API direta | Controle total via API, sem UI do SDK | Merchant |

### Tipos de Mobile SDK

| Plataforma | Tipo | Descricao |
|------------|------|-----------|
| **iOS** | Full | UI completa gerenciada pelo SDK |
| **iOS** | Lite | UI controlada pelo merchant com logica de pagamento do SDK |
| **iOS** | Headless | Controle total via API |
| **Android** | Checkout Complete | SDK fornece lista de metodos de pagamento |
| **Android** | Checkout Lite | Merchant controla selecao de metodo |
| **Android** | Payment Render | SDK renderiza formulario no layout do merchant |
| **Android** | Headless | Controle total via API |

---

## Integracao Atual

Este projeto usa a seguinte configuracao de SDK:

| Aspecto | Valor |
|---------|-------|
| **Versao Web SDK** | v1.5 |
| **Tipo de Integracao** | **Checkout Lite** + **External Buttons** |
| **Metodos Utilizados** | `startCheckout()`, `mountCheckoutLite()`, `mountExternalButtons()` |

### O Que Isso Significa

- **Checkout Lite**: Nos controlamos a UI de selecao de metodo de pagamento, enquanto o SDK processa a logica de pagamento
- **External Buttons**: O SDK renderiza botoes nativos de Apple Pay, Google Pay e PayPal

### Disponivel para Expansao Futura

A pasta `yuno-official-sdks/` contem exemplos oficiais de SDK para:
- Todos os tipos de integracao Web SDK (Seamless, Full, Lite, Secure Fields, Headless)
- iOS SDK (modos Full, Lite, Headless)
- Android SDK (todos os padroes incluindo Enrollment)

### Comparacao de Versoes do SDK

| Plataforma | Nossa Versao | Ultima Oficial |
|------------|--------------|----------------|
| Web | v1.5 | v1.9 |
| iOS | 2.18.0 | 2.18.0 |
| Android | 2.11.0 | 2.17.0 |

---

## Documentacao Oficial

### Documentacao Yuno

- **O que e a Yuno:** https://docs.y.uno/docs/how-yuno-works/what-is-yuno
- **Documentacao Completa:** https://docs.y.uno

### Repositorios Oficiais dos SDKs

| Plataforma | Repositorio |
|------------|-------------|
| **Web SDK** | https://github.com/yuno-payments/yuno-sdk-web |
| **iOS SDK** | https://github.com/yuno-payments/yuno-sdk-ios |
| **Android SDK** | https://github.com/yuno-payments/yuno-sdk-android |

### Dashboards

- **Sandbox:** https://dashboard-sandbox.y.uno
- **Producao:** https://dashboard.y.uno

---

## Inicio Rapido

### 1. Configurar Ambiente

```bash
# Copiar exemplo de .env
cp .env.example .env

# Editar com suas credenciais Yuno
nano .env
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar Servidor

```bash
npm start
```

Servidor roda em `http://localhost:8082`

### Variaveis de Ambiente

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `API_URL` | URL da API Yuno (`https://api-sandbox.y.uno` ou `https://api.y.uno`) | Sim |
| `PUBLIC_API_KEY` | Chave publica | Sim |
| `PRIVATE_SECRET_KEY` | Chave privada | Sim |
| `ACCOUNT_CODE` | Codigo da conta | Sim |
| `CUSTOMER_ID` | ID do cliente | Nao |
| `PORT` | Porta do servidor | Nao (default: 8082) |

---

## Estrutura do Projeto

```
SDK lite 1.5/
├── src/                          # Codigo fonte
│   ├── config/                   # Configuracoes
│   │   ├── environment.js        # Variaveis de ambiente
│   │   └── index.js
│   ├── controllers/              # Handlers HTTP
│   │   ├── checkout.controller.js
│   │   ├── payment.controller.js
│   │   └── webhook.controller.js
│   ├── services/                 # Logica de negocio
│   │   ├── checkout.service.js
│   │   └── payment.service.js
│   ├── routes/                   # Definicao de rotas
│   │   ├── checkout.routes.js
│   │   ├── payment.routes.js
│   │   └── webhook.routes.js
│   ├── middlewares/              # Middlewares Express
│   │   ├── logger.middleware.js
│   │   └── error.middleware.js
│   ├── utils/                    # Utilitarios
│   │   ├── errors.js             # Classes de erro
│   │   └── logger.js             # Sistema de log
│   ├── integrations/             # Clientes externos
│   │   └── yuno/
│   │       ├── client.js         # Cliente HTTP
│   │       ├── checkout.js       # Operacoes checkout
│   │       └── payments.js       # Operacoes pagamento
│   └── app.js                    # Entrada da aplicacao
│
├── public/                       # Arquivos estaticos (frontend)
├── docs/                         # Documentacao
├── mobile/                       # Exemplos de SDK Mobile
│   ├── ios/                      # Exemplos iOS Swift
│   └── android/                  # Exemplos Android Kotlin
└── package.json
```

---

## Endpoints da API

### Checkout

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/checkout/sessions` | Cria sessao de checkout |
| POST | `/checkout/sessions/br` | Cria sessao BR (conveniente) |
| GET | `/payment-methods/:session` | Lista metodos disponiveis |

### Pagamentos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/payments` | Processa pagamento |
| POST | `/payments/paypal/redirect` | PayPal com redirect |
| POST | `/payment-link` | Cria link de pagamento |
| POST | `/nupay/payment-conditions` | Condicoes NuPay |

### Webhook

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/webhook/yuno` | Recebe eventos Yuno |
| GET | `/webhook/yuno` | Health check |

---

## Visao Geral da Arquitetura

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   CLIENTE   │ ──── │  YUNO SDK   │ ──── │   BACKEND   │ ──── │  YUNO API   │
│  Web/Mobile │      │             │      │  (Node.js)  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

### Fluxo de Pagamento

1. **Cliente** solicita Checkout Session do **Backend**
2. **Backend** cria sessao via **Yuno API** e retorna
3. **Cliente** inicializa **Yuno SDK** com a sessao
4. **SDK** renderiza botoes Apple Pay / Google Pay
5. **Usuario** toca no botao de pagamento
6. **SDK** abre interface nativa de pagamento
7. **Usuario** autentica (Face ID / Touch ID / Biometria)
8. **SDK** gera **One-Time Token (OTT)**
9. **Cliente** envia OTT para o **Backend**
10. **Backend** cria pagamento via **Yuno API**
11. **Resultado** retorna ao cliente

---

## Integracao Web SDK

### Passo 1: Carregar SDK

```html
<script src="https://sdk-web.y.uno/v1.5/main.js" defer></script>
```

### Passo 2: Adicionar Containers dos Botoes

```html
<div id="apple-pay-button"></div>
<div id="google-pay-button"></div>
```

### Passo 3: Inicializar SDK

```javascript
window.addEventListener("yuno-sdk-ready", async () => {
  // 1. Buscar checkout session do backend
  const response = await fetch("/checkout/sessions", { method: "POST" });
  const { checkout_session, country } = await response.json();

  // 2. Inicializar Yuno SDK
  const yuno = await Yuno.initialize("sua-public-api-key");

  // 3. Iniciar checkout
  await yuno.startCheckout({
    checkoutSession: checkout_session,
    elementSelector: "#checkout-container",
    countryCode: country,
    currency: "BRL",
    language: "pt",

    // Chamado quando SDK gera o OTT
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
      const payment = await result.json();
      yuno.continuePayment({ showPaymentStatus: true });
    },

    yunoPaymentResult: (data) => console.log("Resultado:", data),
    yunoError: (error) => console.error("Erro:", error)
  });

  // 4. Montar botoes Apple Pay e Google Pay
  await yuno.mountExternalButtons([
    { paymentMethodType: "APPLE_PAY", elementSelector: "#apple-pay-button" },
    { paymentMethodType: "GOOGLE_PAY", elementSelector: "#google-pay-button" }
  ]);
});
```

---

## Integracao iOS SDK

### Passo 1: Adicionar SDK via Swift Package Manager

```swift
dependencies: [
    .package(url: "https://github.com/yuno-payments/yuno-sdk-ios", from: "2.18.0")
]
```

### Passo 2: Configurar Capabilities

No Xcode > Target > Signing & Capabilities:
1. Adicionar capability **"Apple Pay"**
2. Selecionar seu Merchant ID

### Passo 3: Inicializar e Implementar

```swift
import YunoSDK

// Inicializar no AppDelegate
Yuno.initialize(apiKey: "sua-public-api-key", environment: .sandbox)

// Implementar delegate
extension PaymentViewController: YunoPaymentDelegate {
    func yunoCreatePayment(oneTimeToken: String) {
        // Enviar OTT para o backend
        Task {
            let result = try await createPayment(oneTimeToken: oneTimeToken)
            Yuno.continuePayment()
        }
    }

    func yunoPaymentResult(_ result: YunoPaymentResult) {
        // Tratar resultado
    }
}
```

> **Nota:** Apple Pay **NAO funciona** no Simulator — requer **dispositivo iOS fisico**.

---

## Integracao Android SDK

### Passo 1: Adicionar SDK via Gradle

```groovy
dependencies {
    implementation "com.yuno.payments:android-sdk:2.11.0"
}
```

### Passo 2: Configurar AndroidManifest.xml

```xml
<meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
```

### Passo 3: Inicializar e Implementar

```kotlin
import com.yuno.payments.core.Yuno

// Inicializar no Application
Yuno.initialize(
    application = this,
    apiKey = "sua-public-api-key",
    config = YunoConfig(environment = YunoEnvironment.SANDBOX)
)

// Implementar delegate
class PaymentActivity : AppCompatActivity(), YunoPaymentDelegate {
    override fun onPaymentTokenGenerated(oneTimeToken: String) {
        // Enviar OTT para o backend
        lifecycleScope.launch {
            val result = createPayment(oneTimeToken)
            Yuno.continuePayment()
        }
    }
}
```

---

## Tipos de Token: DPAN vs FPAN

Ao processar pagamentos com carteiras digitais, as informacoes do cartao sao tokenizadas.

| Termo | Nome Completo | Descricao |
|-------|---------------|-----------|
| **FPAN** | Funding Primary Account Number | O numero real do cartao impresso no cartao fisico |
| **DPAN** | Device Primary Account Number | Um numero de cartao tokenizado vinculado a um dispositivo/carteira especifico |

### Tipo de Token por Metodo de Pagamento

| Metodo de Pagamento | Tipo de Token | Observacoes |
|---------------------|---------------|-------------|
| **Apple Pay** | **Sempre DPAN** | Apple sempre usa tokenizacao de rede |
| **Google Pay** | **DPAN ou FPAN** | Depende da configuracao do cartao/emissor |
| Click to Pay | DPAN | Tokenizado pela rede |
| Cartao (digitacao manual) | FPAN | Numero real do cartao |

### Como Identificar DPAN vs FPAN

A Yuno **nao** retorna um campo explicito `token_type`. Verifique `parent_payment_method_type`:

| `parent_payment_method_type` | Tipo de Token | Significado |
|------------------------------|---------------|-------------|
| `"APPLE_PAY"` | **Sempre DPAN** | Apple Pay sempre usa tokenizacao de rede |
| `"GOOGLE_PAY"` | **DPAN ou FPAN** | Verifique `card_data.network_token` |
| `null` ou ausente | **FPAN** | Digitacao direta do cartao |

**Para Google Pay:** Verifique `card_data.network_token`:
- `null` → **FPAN**
- `{ iin, lfd, ... }` → **DPAN**

### Exemplo de Response em Producao (Google Pay)

```json
{
  "status": "SUCCEEDED",
  "payment_method": {
    "parent_payment_method_type": "GOOGLE_PAY",
    "type": "CARD",
    "payment_method_detail": {
      "card": {
        "card_data": {
          "brand": "VISA",
          "iin": "48315006",
          "lfd": "9829",
          "network_token": null,
          "type": "CREDIT"
        }
      }
    }
  }
}
```

> `network_token: null` indica **FPAN**. Se preenchido, seria **DPAN**.

### Sandbox vs Producao

| Aspecto | Sandbox | Producao |
|---------|---------|----------|
| **Apple Pay** | **Nao pode ser testado** | Suporte completo, sempre DPAN |
| **Google Pay** | Pode ser testado | DPAN ou FPAN dependendo do emissor |

---

## Web SDK vs Mobile SDKs - Diferencas Principais

A **logica de pagamento e identica** em todas as plataformas. Apenas a renderizacao de UI difere.

| Aspecto | Web SDK | iOS SDK | Android SDK |
|---------|---------|---------|-------------|
| **Checkout Session** | Igual | Igual | Igual |
| **Inicializar** | `Yuno.initialize()` | `Yuno.initialize()` | `Yuno.initialize()` |
| **Callback OTT** | `yunoCreatePayment()` | `yunoCreatePayment()` | `onPaymentTokenGenerated()` |
| **Payload Backend** | Igual | Igual | Igual |

> **O backend e 100% compartilhado** — nao precisa mudar nada para suportar Web, iOS ou Android.

### Diferencas Principais

| Plataforma | Renderizacao de Botoes | Testes |
|------------|------------------------|--------|
| **Web SDK** | Requer containers HTML + `mountExternalButtons()` | Funciona em qualquer browser |
| **iOS SDK** | Renderizacao nativa automatica | Requer **dispositivo fisico** |
| **Android SDK** | Renderizacao nativa automatica | Funciona no emulador |

---

## Solucao de Problemas

### Problemas com Apple Pay

| Problema | Solucao |
|----------|---------|
| Botao nao aparece | Verifique navegador Safari ou dispositivo iOS com Apple Pay configurado |
| "Merchant ID invalid" | Verifique Merchant ID no Apple Developer Portal |
| "Domain not verified" | Registre o dominio no Apple Developer Portal |

### Problemas com Google Pay

| Problema | Solucao |
|----------|---------|
| Botao nao aparece | Verifique navegador Chrome ou dispositivo Android com Google Pay |
| "Merchant not enabled" | Configure Merchant ID no Google Pay Console |
| Erro em producao | Solicite aprovacao de producao do Google Pay |

### Erros Comuns

| Erro | Solucao |
|------|---------|
| `INVALID_CHECKOUT_SESSION` | Gere nova sessao com `merchant_order_id` unico |
| `PAYMENT_METHOD_NOT_AVAILABLE` | Habilite o metodo no painel Yuno |
| `INVALID_TOKEN` | Gere novo OTT (nova tentativa de pagamento) |

---

## Versoes do SDK

| Plataforma | Repositorio | Versao Recomendada |
|------------|-------------|-------------------|
| Web | CDN | v1.5 |
| iOS | [yuno-sdk-ios](https://github.com/yuno-payments/yuno-sdk-ios) | 2.18.0+ |
| Android | Maven Central / JitPack | 2.11.0+ |

---

## Suporte

- **Documentacao:** https://docs.y.uno
- **Suporte:** support@y.uno
- **Dashboard Sandbox:** https://dashboard-sandbox.y.uno
- **Dashboard Producao:** https://dashboard.y.uno

---

## License

MIT
