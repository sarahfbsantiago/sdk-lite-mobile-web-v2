package com.pigeonz.yunocheckout.ui

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pigeonz.yunocheckout.CheckoutViewModel
import com.pigeonz.yunocheckout.Product

/**
 * Tela principal com lista de produtos e carrinho
 * Main screen with product list and cart
 */
@Composable
fun MainScreen(
    viewModel: CheckoutViewModel,
    activity: Activity
) {
    val uiState by viewModel.uiState.collectAsState()

    // Mostrar checkout se sessao estiver ativa / Show checkout if session is active
    if (uiState.showCheckout && uiState.checkoutSession != null) {
        CheckoutScreen(
            viewModel = viewModel,
            activity = activity,
            onDismiss = { viewModel.dismissCheckout() }
        )
    } else {
        Scaffold { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header / Cabecalho
                item {
                    HeaderSection()
                }

                // Products / Produtos
                items(uiState.products) { product ->
                    ProductCard(
                        product = product,
                        quantity = viewModel.getQuantity(product.id),
                        onIncrease = { viewModel.increaseQuantity(product) },
                        onDecrease = { viewModel.decreaseQuantity(product) }
                    )
                }

                // Order Summary / Resumo do Pedido
                item {
                    OrderSummary(
                        subtotal = viewModel.formattedTotal,
                        total = viewModel.formattedTotal
                    )
                }

                // Checkout Button / Botao de Checkout
                item {
                    CheckoutButton(
                        enabled = viewModel.canCheckout && !uiState.isLoading,
                        isLoading = uiState.isLoading,
                        onClick = { viewModel.startCheckout() }
                    )
                }

                // Error Message / Mensagem de Erro
                if (uiState.errorMessage != null) {
                    item {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        ) {
                            Text(
                                text = uiState.errorMessage!!,
                                modifier = Modifier.padding(16.dp),
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Secao de cabecalho com logo e titulo
 * Header section with logo and title
 */
@Composable
fun HeaderSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "🐦",
            fontSize = 48.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Pigeonz Street Wear",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Finish your order",
            color = Color.Gray
        )
    }
}

/**
 * Card de produto com controles de quantidade
 * Product card with quantity controls
 */
@Composable
fun ProductCard(
    product: Product,
    quantity: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Image Placeholder / Placeholder da Imagem do Produto
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.LightGray),
                contentAlignment = Alignment.Center
            ) {
                Text("👕", fontSize = 32.sp)
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Product Info / Informacoes do Produto
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = product.description,
                    color = Color.Gray,
                    fontSize = 12.sp
                )
                Text(
                    text = product.formattedPrice,
                    color = Color(0xFF4CAF50),
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Quantity Controls / Controles de Quantidade
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onDecrease) {
                    Icon(
                        Icons.Default.Remove,
                        contentDescription = "Diminuir", // Decrease
                        tint = Color(0xFF9C27B0)
                    )
                }
                Text(
                    text = "$quantity",
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.width(30.dp),
                    textAlign = TextAlign.Center
                )
                IconButton(onClick = onIncrease) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Aumentar", // Increase
                        tint = Color(0xFF9C27B0)
                    )
                }
            }
        }
    }
}

/**
 * Resumo do pedido com subtotal e total
 * Order summary with subtotal and total
 */
@Composable
fun OrderSummary(
    subtotal: String,
    total: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Subtotal")
                Text(subtotal)
            }
            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Total", fontWeight = FontWeight.Bold)
                Text(
                    total,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF9C27B0)
                )
            }
        }
    }
}

/**
 * Botao de checkout com indicador de carregamento
 * Checkout button with loading indicator
 */
@Composable
fun CheckoutButton(
    enabled: Boolean,
    isLoading: Boolean,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF9C27B0)
        )
    ) {
        if (isLoading) {
            // Indicador de carregamento / Loading indicator
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = Color.White
            )
        } else {
            // Texto do botao / Button text
            Text(
                "Pagar com Yuno", // Pay with Yuno
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("💳")
        }
    }
}
