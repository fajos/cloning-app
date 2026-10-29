package com.viralscript.ai.data.api

import com.viralscript.ai.data.model.AnalyzeRequest
import com.viralscript.ai.data.model.AnalyzeResponse
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

object ApiClient {
    private var baseUrl = "http://10.0.2.2:8000"

    fun setServerUrl(url: String) {
        baseUrl = url.trimEnd('/')
    }

    fun getServerUrl(): String = baseUrl

    suspend fun checkHealth(): Boolean {
        return try {
            val response = client.get("$baseUrl/health")
            response.status.value in 200..299
        } catch (e: Exception) {
            false
        }
    }

    private val client = HttpClient {
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
                error = "Connection failed: ${e.message ?: "Unable to connect to $baseUrl. Check network/server URL."}"
            )
        }
    }
}
