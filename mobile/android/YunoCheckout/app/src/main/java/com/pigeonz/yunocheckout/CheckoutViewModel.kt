package com.pigeonz.yunocheckout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

/**
 * Estado da UI do checkout
 * Checkout UI state
 */
data class CheckoutUiState(
    val products: List<Product> = Product.samples,  // Lista de produtos / Product list
    val cart: Map<String, Int> = emptyMap(),        // Carrinho (id -> quantidade) / Cart (id -> quantity)
    val isLoading: Boolean = false,                  // Indicador de carregamento / Loading indicator
    val checkoutSession: String? = null,             // Sessao de checkout / Checkout session
    val showCheckout: Boolean = false,               // Mostrar tela de checkout / Show checkout screen
    val errorMessage: String? = null,                // Mensagem de erro / Error message
    val paymentCompleted: Boolean = false            // Pagamento concluido / Payment completed
)

/**
 * ViewModel para gerenciar o estado do checkout
 * ViewModel to manage checkout state
 */
class CheckoutViewModel : ViewModel() {

    // Estado interno mutavel / Mutable internal state
    private val _uiState = MutableStateFlow(CheckoutUiState())
    // Estado publico imutavel / Immutable public state
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    // Servico de API / API service
    private val apiService = ApiService.getInstance()

    // Valor total do carrinho / Cart total value
    val totalAmount: Double
        get() {
            val state = _uiState.value
            return state.products.sumOf { product ->
                val qty = state.cart[product.id] ?: 0
                product.price * qty
            }
        }

    // Total formatado em moeda brasileira / Total formatted in Brazilian currency
    val formattedTotal: String
        get() {
            val format = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
            return format.format(totalAmount)
        }

    // Verificar se pode fazer checkout (carrinho nao vazio) / Check if can checkout (cart not empty)
    val canCheckout: Boolean
        get() = totalAmount > 0

    // MARK: - Cart Actions / Acoes do Carrinho

    // Obter quantidade de um produto no carrinho / Get quantity of a product in cart
    fun getQuantity(productId: String): Int {
        return _uiState.value.cart[productId] ?: 0
    }

    // Aumentar quantidade de um produto / Increase product quantity
    fun increaseQuantity(product: Product) {
        val currentCart = _uiState.value.cart.toMutableMap()
        currentCart[product.id] = (currentCart[product.id] ?: 0) + 1
        _uiState.value = _uiState.value.copy(cart = currentCart)
    }

    // Diminuir quantidade de um produto / Decrease product quantity
    fun decreaseQuantity(product: Product) {
        val currentCart = _uiState.value.cart.toMutableMap()
        val current = currentCart[product.id] ?: 0
        if (current > 0) {
            currentCart[product.id] = current - 1
            _uiState.value = _uiState.value.copy(cart = currentCart)
        }
    }

    // MARK: - Checkout / Finalizacao de Compra

    // Iniciar processo de checkout / Start checkout process
    fun startCheckout() {
        if (!canCheckout) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            try {
                // Criar requisicao de sessao / Create session request
                val request = CheckoutSessionRequest(
                    amount = AmountRequest(
                        currency = Config.CURRENCY,
                        value = (totalAmount * 100).toInt() // centavos / cents
                    ),
                    customer_id = Config.CUSTOMER_ID,
                    account_code = Config.ACCOUNT_CODE
                )

                // Chamar API para criar sessao / Call API to create session
                val response = apiService.createCheckoutSession(request)

                if (response.isSuccessful && response.body() != null) {
                    // Sucesso - mostrar tela de checkout / Success - show checkout screen
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        checkoutSession = response.body()!!.checkout_session,
                        showCheckout = true
                    )
                } else {
                    // Erro na criacao da sessao / Error creating session
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Erro ao criar sessao: ${response.code()}" // Error creating session
                    )
                }
            } catch (e: Exception) {
                // Excecao durante requisicao / Exception during request
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Erro: ${e.message}" // Error
                )
            }
        }
    }

    // Criar pagamento com token unico / Create payment with one-time token
    fun createPayment(oneTimeToken: String) {
        val session = _uiState.value.checkoutSession ?: return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            try {
                // Criar requisicao de pagamento / Create payment request
                val request = PaymentRequest(
                    checkout_session = session,
                    one_time_token = oneTimeToken,
                    amount = AmountRequest(
                        currency = Config.CURRENCY,
                        value = (totalAmount * 100).toInt()
                    ),
                    customer_id = Config.CUSTOMER_ID
                )

                // Chamar API para criar pagamento / Call API to create payment
                val response = apiService.createPayment(request)

                if (response.isSuccessful) {
                    // Pagamento bem sucedido / Payment successful
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        paymentCompleted = true
                    )
                } else {
                    // Erro no pagamento / Payment error
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Erro no pagamento: ${response.code()}" // Payment error
                    )
                }
            } catch (e: Exception) {
                // Excecao durante pagamento / Exception during payment
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Erro: ${e.message}" // Error
                )
            }
        }
    }

    // Fechar tela de checkout / Close checkout screen
    fun dismissCheckout() {
        _uiState.value = _uiState.value.copy(showCheckout = false)
    }

    // Limpar mensagem de erro / Clear error message
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
