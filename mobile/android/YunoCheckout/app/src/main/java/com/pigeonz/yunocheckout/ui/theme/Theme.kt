package com.pigeonz.yunocheckout.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Cores do tema / Theme colors
private val Purple = Color(0xFF9C27B0)       // Roxo principal / Primary purple
private val PurpleLight = Color(0xFFCE93D8)  // Roxo claro / Light purple
private val PurpleDark = Color(0xFF7B1FA2)   // Roxo escuro / Dark purple

// Esquema de cores para tema escuro / Dark theme color scheme
private val DarkColorScheme = darkColorScheme(
    primary = Purple,
    secondary = PurpleLight,
    tertiary = PurpleDark
)

// Esquema de cores para tema claro / Light theme color scheme
private val LightColorScheme = lightColorScheme(
    primary = Purple,
    secondary = PurpleLight,
    tertiary = PurpleDark
)

/**
 * Tema personalizado do app YunoCheckout
 * Custom theme for YunoCheckout app
 */
@Composable
fun YunoCheckoutTheme(
    darkTheme: Boolean = isSystemInDarkTheme(), // Usar tema do sistema / Use system theme
    content: @Composable () -> Unit
) {
    // Selecionar esquema de cores baseado no tema / Select color scheme based on theme
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        // Configurar cor da barra de status / Configure status bar color
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            // Ajustar icones da barra de status para tema claro/escuro / Adjust status bar icons for light/dark theme
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    // Aplicar tema Material / Apply Material theme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
