package com.pigeonz.yunocheckout

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

/**
 * Servico de API para comunicacao com o backend
 * API service for backend communication
 */
interface ApiService {

    // Criar sessao de checkout / Create checkout session
    @POST("checkout-session")
    suspend fun createCheckoutSession(
        @Body request: CheckoutSessionRequest
    ): Response<CheckoutSessionResponse>

    // Criar pagamento / Create payment
    @POST("payments")
    suspend fun createPayment(
        @Body request: PaymentRequest
    ): Response<PaymentResponse>

    companion object {
        // Instancia singleton do servico / Singleton service instance
        private var instance: ApiService? = null

        // Obter instancia do servico / Get service instance
        fun getInstance(): ApiService {
            if (instance == null) {
                // Configurar logging para debug / Configure logging for debug
                val logging = HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                }

                // Configurar cliente HTTP com timeouts / Configure HTTP client with timeouts
                val client = OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build()

                // Criar instancia do Retrofit / Create Retrofit instance
                val retrofit = Retrofit.Builder()
                    .baseUrl(Config.BACKEND_URL + "/")
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()

                instance = retrofit.create(ApiService::class.java)
            }
            return instance!!
        }
    }
}
