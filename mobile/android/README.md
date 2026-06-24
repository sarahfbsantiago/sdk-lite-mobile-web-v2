# Yuno Checkout - Android

App Android nativo para checkout usando Yuno SDK.

## Requisitos

- Android Studio Hedgehog (2023.1.1) ou superior
- Android SDK 34
- Kotlin 1.9+
- JDK 17

## Instalacao

1. Abra o Android Studio

2. Selecione "Open" e navegue ate:
   ```
   mobile/android/YunoCheckout
   ```

3. Aguarde o Gradle sincronizar as dependencias

4. Rode no emulador ou dispositivo

## Configuracao

As credenciais estao em `app/src/main/java/.../Config.kt` e sao as mesmas do projeto web:

- `PUBLIC_API_KEY`: Chave publica Yuno (sandbox)
- `ACCOUNT_CODE`: Codigo da conta
- `CUSTOMER_ID`: ID do cliente
- `BACKEND_URL`: URL do servidor

### Importante para Emulador

O emulador Android usa `10.0.2.2` para acessar `localhost` da maquina host.
Ja esta configurado no `Config.kt`.

Para dispositivo fisico, altere para o IP da sua maquina:
```kotlin
const val BACKEND_URL = "http://192.168.x.x:8082"
```

## Backend

O app usa o mesmo backend do projeto web (`server.js`).
Certifique-se que o servidor esta rodando:

```bash
cd "/Users/sarahsantiago/Desktop/SDK lite 1.5"
node server.js
```

## Estrutura

```
app/src/main/java/com/pigeonz/yunocheckout/
├── YunoCheckoutApp.kt     # Application, inicializa SDK
├── MainActivity.kt        # Activity principal
├── Config.kt              # Credenciais compartilhadas
├── Models.kt              # Modelos de dados
├── ApiService.kt          # Retrofit service
├── CheckoutViewModel.kt   # ViewModel
└── ui/
    ├── MainScreen.kt      # Tela principal com produtos
    ├── CheckoutScreen.kt  # Tela de pagamento Yuno
    └── theme/
        └── Theme.kt       # Tema Material 3
```

## Dependencias

- Yuno SDK: `com.yuno.payments:android-sdk:2.11.0`
- Jetpack Compose
- Retrofit + OkHttp
- Kotlin Coroutines
