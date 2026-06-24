package com.pigeonz.yunocheckout

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pigeonz.yunocheckout.ui.MainScreen
import com.pigeonz.yunocheckout.ui.theme.YunoCheckoutTheme

/**
 * Activity principal do app de checkout
 * Main activity of the checkout app
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configurar conteudo com Jetpack Compose / Setup content with Jetpack Compose
        setContent {
            YunoCheckoutTheme {
                // Container com cor de fundo do tema / Container with theme background color
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Criar ViewModel e passar para tela principal / Create ViewModel and pass to main screen
                    val viewModel: CheckoutViewModel = viewModel()
                    MainScreen(
                        viewModel = viewModel,
                        activity = this
                    )
                }
            }
        }
    }
}
