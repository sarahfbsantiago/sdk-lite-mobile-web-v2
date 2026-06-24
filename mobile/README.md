# Yuno Checkout - Mobile

Apps mobile nativos para checkout usando Yuno SDK, compartilhando as mesmas credenciais do projeto web.

## Estrutura

```
mobile/
├── shared/
│   └── config.json        # Credenciais compartilhadas (referencia)
├── ios/
│   └── YunoCheckout/      # Projeto iOS (SwiftUI)
└── android/
    └── YunoCheckout/      # Projeto Android (Jetpack Compose)
```

## Credenciais Compartilhadas

Ambos os apps usam as mesmas credenciais do `.env` do projeto principal:

| Credencial | Valor |
|------------|-------|
| API URL | `https://api-sandbox.y.uno` |
| Account Code | `b48d0a7f-3874-498a-98ca-4ee429612893` |
| Customer ID | `7ab03456-833c-4c8d-8a83-833b777363c6` |
| Public API Key | `sandbox_gAAAAA...` (mesma do web) |

## Backend

Ambos os apps consomem o mesmo backend (`server.js`) que ja existe no projeto:

```bash
# Inicie o servidor
cd "/Users/sarahsantiago/Desktop/SDK lite 1.5"
node server.js
# Server rodando em http://localhost:8082
```

### Endpoints utilizados:
- `POST /checkout-session` - Criar sessao de checkout
- `POST /payments` - Criar pagamento
- `GET /payment-methods` - Listar metodos de pagamento

## iOS

```bash
cd mobile/ios/YunoCheckout
open Package.swift  # Abre no Xcode
```

Requisitos: Xcode 15+, iOS 15+

## Android

Abra o Android Studio e selecione:
```
mobile/android/YunoCheckout
```

Requisitos: Android Studio 2023.1.1+, SDK 34

### Nota para Emulador Android
O emulador usa `10.0.2.2` para acessar localhost da maquina host.
Ja esta configurado no codigo.
