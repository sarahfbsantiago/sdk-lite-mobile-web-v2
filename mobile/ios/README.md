# Yuno Checkout - iOS

App iOS nativo para checkout usando Yuno SDK.

## Requisitos

- Xcode 15+
- iOS 15+
- Swift 5.9+

## Instalacao

1. Abra o projeto no Xcode:
   ```bash
   cd mobile/ios/YunoCheckout
   open Package.swift
   ```

2. Aguarde o Xcode resolver as dependencias (Yuno SDK)

3. Configure o Team de desenvolvimento em Signing & Capabilities

4. Rode no simulador ou dispositivo

## Configuracao

As credenciais estao em `YunoCheckout/Config.swift` e sao as mesmas do projeto web:

- `publicApiKey`: Chave publica Yuno (sandbox)
- `accountCode`: Codigo da conta
- `customerId`: ID do cliente
- `backendUrl`: URL do servidor (http://localhost:8082)

## Backend

O app usa o mesmo backend do projeto web (`server.js`).
Certifique-se que o servidor esta rodando:

```bash
cd "/Users/sarahsantiago/Desktop/SDK lite 1.5"
node server.js
```

## Estrutura

```
YunoCheckout/
├── YunoCheckoutApp.swift   # Entry point, inicializa SDK
├── Config.swift            # Credenciais compartilhadas
├── ContentView.swift       # Tela principal com produtos
├── CheckoutView.swift      # Tela de pagamento com Yuno SDK
├── CheckoutViewModel.swift # Logica do carrinho
├── ApiService.swift        # Comunicacao com backend
├── Models.swift            # Modelos de dados
└── Info.plist              # Configuracoes do app
```
