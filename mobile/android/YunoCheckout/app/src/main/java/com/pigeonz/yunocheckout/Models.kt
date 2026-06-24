package com.pigeonz.yunocheckout

import java.text.NumberFormat
import java.util.Locale

// MARK: - Product / Produto
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val image: String
) {
    // Preco formatado em moeda brasileira / Price formatted in Brazilian currency
    val formattedPrice: String
        get() {
            val format = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
            return format.format(price)
        }

    companion object {
        // Produtos de exemplo / Sample products
        val samples = listOf(
            Product(
                id = "urban-tee",
                name = "Urban Textures Tee",
                description = "Camiseta streetwear premium", // Premium streetwear t-shirt
                price = 89.90,
                image = "camisa"
            ),
            Product(
                id = "stussy-tee",
                name = "Stussy T-Shirt",
                description = "Camiseta classica Stussy", // Classic Stussy t-shirt
                price = 129.90,
                image = "stussy"
            )
        )
    }
}

// MARK: - API Request/Response Models / Modelos de Requisicao/Resposta da API
data class CheckoutSessionRequest(
    val amount: AmountRequest,
    val customer_id: String,
    val account_code: String
)

data class AmountRequest(
    val currency: String,
    val value: Int // em centavos / in cents
)

data class CheckoutSessionResponse(
    val checkout_session: String
)

data class PaymentRequest(
    val checkout_session: String,
    val one_time_token: String,
    val amount: AmountRequest,
    val customer_id: String
)

data class PaymentResponse(
    val id: String,
    val status: String,
    val sdk_action_required: Boolean?
)
