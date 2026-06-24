package com.pigeonz.yunocheckout

/**
 * Configuracoes compartilhadas - mesmas credenciais do projeto web (.env)
 * Shared configurations - same credentials as the web project (.env)
 */
object Config {
    // Yuno Credentials (do .env do projeto principal) / Yuno Credentials (from main project .env)
    const val API_URL = "https://api-sandbox.y.uno"
    const val PUBLIC_API_KEY = "sandbox_gAAAAABmsPEk3FoharvZ2w_FCTu61C9i6T2h8_OktdR6ABPoo0ZKOfvR3hLvR_STblCfA7X769CXTCu24jUbEhuL4J8ZzaRHPkYFCeyENFeJ_o5yo6KXWldzFCBBm5W3WGyWkjnJourLuEsi59CJ_6qlUZIDwhL4SGBmiySCf_eyiUEGSL1326eyrwfzhXpqAH3LWST4i1TTx-T3SQTeb4dUJ3I22CnKNQ2psxa7Xf-v5mVLRfAveQPrvW0UeIEgajARpUIbCemH"
    const val ACCOUNT_CODE = "b48d0a7f-3874-498a-98ca-4ee429612893"
    const val CUSTOMER_ID = "7ab03456-833c-4c8d-8a83-833b777363c6"

    // Backend (server.js do projeto principal) / Backend (server.js from main project)
    // Para emulador Android use 10.0.2.2 em vez de localhost / For Android emulator use 10.0.2.2 instead of localhost
    const val BACKEND_URL = "http://10.0.2.2:8082"

    // Para dispositivo fisico na mesma rede, use o IP da maquina / For physical device on same network, use machine's IP
    // const val BACKEND_URL = "http://192.168.x.x:8082"

    // Checkout Settings / Configuracoes do Checkout
    const val COUNTRY_CODE = "BR"
    const val CURRENCY = "BRL"
    const val LANGUAGE = "pt"
}
