package com.pigeonz.yunocheckout.ui

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.pigeonz.yunocheckout.CheckoutViewModel
import com.pigeonz.yunocheckout.Config
import com.yuno.payments.core.Yuno
import com.yuno.payments.features.payment.ui.views.PaymentMethodListViewComponent

/**
 * Tela de checkout com integracao do SDK Yuno
 * Checkout screen with Yuno SDK integration
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    viewModel: CheckoutViewModel,
    activity: Activity,
    onDismiss: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    // Controle se o checkout Yuno foi inicializado / Control if Yuno checkout was initialized
    var yunoInitialized by remember { mutableStateOf(false) }

    // Inicializar checkout da Yuno quando a tela aparecer / Initialize Yuno checkout when screen appears
    LaunchedEffect(uiState.checkoutSession) {
        uiState.checkoutSession?.let { session ->
            // Iniciar checkout com a sessao / Start checkout with session
            Yuno.startCheckout(
                activity = activity,
                checkoutSession = session,
                countryCode = Config.COUNTRY_CODE,
                // Callback quando o estado do pagamento mudar / Callback when payment state changes
                callbackPaymentState = { state ->
                    when (state.name) {
                        "SUCCEEDED" -> {
                            // Pagamento bem sucedido / Payment successful
                        }
                        "FAIL", "REJECT" -> {
                            // Pagamento falhou / Payment failed
                        }
                    }
                },
                // Callback quando receber o one-time token / Callback when receiving one-time token
                callbackOTT = { ottState ->
                    // Recebeu o one-time token / Received one-time token
                    ottState.oneTimeToken?.let { token ->
                        viewModel.createPayment(token)
                    }
                }
            )
            yunoInitialized = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pagamento") }, // Payment
                navigationIcon = {
                    // Botao de fechar / Close button
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Fechar") // Close
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            if (uiState.isLoading) {
                // Estado de carregamento / Loading state
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = Color(0xFF9C27B0))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Processando pagamento...") // Processing payment...
                    }
                }
            } else if (uiState.paymentCompleted) {
                // Sucesso / Success
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("✅", style = MaterialTheme.typography.displayLarge)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Pagamento Realizado!", // Payment Completed!
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF4CAF50)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Obrigado pela sua compra.") // Thank you for your purchase.
                        Spacer(modifier = Modifier.height(24.dp))
                        Button(
                            onClick = onDismiss,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF9C27B0)
                            )
                        ) {
                            Text("Voltar para a loja") // Back to store
                        }
                    }
                }
            } else if (yunoInitialized) {
                // Componente de metodos de pagamento da Yuno / Yuno payment methods component
                // Este componente eh fornecido pelo SDK da Yuno / This component is provided by Yuno SDK
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        "Selecione o metodo de pagamento:", // Select payment method:
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // O SDK da Yuno vai renderizar os metodos aqui / Yuno SDK will render methods here
                    // usando PaymentMethodListViewComponent / using PaymentMethodListViewComponent
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        // Placeholder - o SDK vai substituir isso / Placeholder - SDK will replace this
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(300.dp)
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "Metodos de pagamento Yuno", // Yuno payment methods
                                color = Color.Gray
                            )
                        }
                    }
                }

                // Botao de confirmar / Confirm button
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = {
                        // Iniciar pagamento via SDK / Start payment via SDK
                        Yuno.startPayment(activity = activity)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF9C27B0)
                    )
                ) {
                    Text(
                        "Confirmar Pagamento ${viewModel.formattedTotal}", // Confirm Payment
                        fontWeight = FontWeight.SemiBold
                    )
                }
            } else {
                // Carregando / Loading
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = Color(0xFF9C27B0))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Carregando metodos de pagamento...") // Loading payment methods...
                    }
                }
            }

            // Error / Erro
            uiState.errorMessage?.let { error ->
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            error,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(onClick = { viewModel.clearError() }) {
                            Text("OK")
                        }
                    }
                }
            }
        }
    }
}
