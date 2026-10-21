package com.viralscript.ai.data.api

import com.viralscript.ai.data.model.AnalyzeRequest
import com.viralscript.ai.data.model.AnalyzeResponse
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

object ApiClient {
    // 10.0.2.2 is the Android Emulator alias for host machine's localhost (127.0.0.1)
    private var baseUrl = "http://10.0.2.2:8000"

    fun setServerUrl(url: String) {
        baseUrl = url.trimEnd('/')
    }

    fun getServerUrl(): String = baseUrl

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
                encodeDefaults = true
            })
        }
    }

    suspend fun analyzeVideo(request: AnalyzeRequest): AnalyzeResponse {
        return try {
            client.post("$baseUrl/api/analyze") {
                contentType(ContentType.Application.Json)
                setBody(request)
            }.body()
        } catch (e: Exception) {
            AnalyzeResponse(
                success = false,
                error = "Connection failed: ${e.localizedMessage ?: "Unable to connect to $baseUrl. Make sure the server is running."}"
            )
        }
    }
}
