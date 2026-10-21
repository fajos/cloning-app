package com.viralscript.ai.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DarkBg = Color(0xFF0B0F19)
val CardBg = Color(0xFF111827)
val PurplePrimary = Color(0xFFA855F7)
val IndigoSecondary = Color(0xFF6366F1)
val CyanAccent = Color(0xFF06B6D4)
val TextWhite = Color(0xFFF3F4F6)
val TextMuted = Color(0xFF9CA3AF)

private val DarkColorScheme = darkColorScheme(
    primary = PurplePrimary,
    secondary = IndigoSecondary,
    tertiary = CyanAccent,
    background = DarkBg,
    surface = CardBg,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = TextWhite,
    onSurface = TextWhite
)

@Composable
fun ViralScriptTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
