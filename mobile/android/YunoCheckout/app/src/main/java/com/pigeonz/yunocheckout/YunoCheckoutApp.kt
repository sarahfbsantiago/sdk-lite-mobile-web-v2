package com.pigeonz.yunocheckout

import android.app.Application
import com.yuno.payments.core.Yuno
import com.yuno.payments.core.YunoConfig

/**
 * Classe de aplicacao para inicializacao do SDK Yuno
 * Application class for Yuno SDK initialization
 */
class YunoCheckoutApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // Inicializar Yuno SDK com a PUBLIC_API_KEY / Initialize Yuno SDK with PUBLIC_API_KEY
        // Mesma chave do projeto web (.env) / Same key as web project (.env)
        Yuno.initialize(
            context = this,
            apiKey = Config.PUBLIC_API_KEY,
            config = YunoConfig(
                saveCardEnabled = true,  // Permitir salvar cartao / Allow saving card
                keepLoader = true        // Manter loader visivel / Keep loader visible
            )
        )
    }
}
