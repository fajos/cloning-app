package com.viralscript.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viralscript.ai.data.api.ApiClient
import com.viralscript.ai.data.model.AnalyzeRequest
import com.viralscript.ai.data.model.AnalyzeResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface UiState {
    object Idle : UiState
    object Loading : UiState
    data class Success(val response: AnalyzeResponse) : UiState
    data class Error(val message: String) : UiState
}

class MainViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    var aiProvider = MutableStateFlow("deepseek")
    var deepSeekApiKey = MutableStateFlow("")
    var geminiApiKey = MutableStateFlow("")
    var serverUrl = MutableStateFlow("http://10.0.2.2:8000")

    var selectedFormat = MutableStateFlow("Shorts")
    var selectedTone = MutableStateFlow("Punchy & Viral")

    fun updateSettings(provider: String, deepSeekKey: String, geminiKey: String, url: String) {
        aiProvider.value = provider
        deepSeekApiKey.value = deepSeekKey
        geminiApiKey.value = geminiKey
        serverUrl.value = url
        ApiClient.setServerUrl(url)
    }

    fun analyzeVideo(youtubeUrl: String) {
        if (youtubeUrl.isBlank()) {
            _uiState.value = UiState.Error("Please enter a valid YouTube URL")
            return
        }

        val provider = aiProvider.value
        val apiKey = if (provider == "deepseek") deepSeekApiKey.value else geminiApiKey.value

        if (apiKey.isBlank()) {
            _uiState.value = UiState.Error("API Key is missing for $provider. Please configure your key in Settings.")
            return
        }

        _uiState.value = UiState.Loading

        viewModelScope.launch {
            val req = AnalyzeRequest(
                youtubeUrl = youtubeUrl,
                apiKey = apiKey,
                aiProvider = provider,
                targetFormat = selectedFormat.value,
                targetTone = selectedTone.value
            )

            val result = ApiClient.analyzeVideo(req)
            if (result.success && result.data != null) {
                _uiState.value = UiState.Success(result)
            } else {
                _uiState.value = UiState.Error(result.error ?: "Failed to generate AI script")
            }
        }
    }

    fun resetState() {
        _uiState.value = UiState.Idle
    }
}
