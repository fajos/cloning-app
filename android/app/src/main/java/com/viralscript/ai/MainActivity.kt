package com.viralscript.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.viralscript.ai.ui.screens.MainScreen
import com.viralscript.ai.ui.theme.ViralScriptTheme
import com.viralscript.ai.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ViralScriptTheme {
                MainScreen(viewModel = viewModel)
            }
        }
    }
}
