package com.viralscript.ai.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AnalyzeRequest(
    @SerialName("youtube_url") val youtubeUrl: String,
    @SerialName("api_key") val apiKey: String? = null,
    @SerialName("ai_provider") val aiProvider: String = "deepseek",
    @SerialName("target_format") val targetFormat: String = "Shorts",
    @SerialName("target_tone") val targetTone: String = "Punchy & Viral"
)

@Serializable
data class AnalyzeResponse(
    val success: Boolean = false,
    val error: String? = null,
    @SerialName("video_metadata") val videoMetadata: VideoMetadata? = null,
    @SerialName("transcript_status") val transcriptStatus: TranscriptStatus? = null,
    val data: ClonedScriptData? = null
)

@Serializable
data class VideoMetadata(
    @SerialName("video_id") val videoId: String = "",
    val title: String = "",
    val author: String = "",
    val thumbnail: String = ""
)

@Serializable
data class TranscriptStatus(
    @SerialName("has_transcript") val hasTranscript: Boolean = false,
    @SerialName("word_count") val wordCount: Int = 0,
    val warning: String? = null
)

@Serializable
data class ClonedScriptData(
    @SerialName("original_analysis") val originalAnalysis: OriginalAnalysis? = null,
    @SerialName("cloned_content") val clonedContent: ClonedContent? = null,
    @SerialName("scene_visuals") val sceneVisuals: List<SceneVisual> = emptyList(),
    val titles: List<String> = emptyList(),
    @SerialName("seo_package") val seoPackage: SeoPackage? = null,
    @SerialName("thumbnail_concept") val thumbnailConcept: ThumbnailConcept? = null,
    @SerialName("monetization_growth_tips") val monetizationGrowthTips: List<String> = emptyList()
)

@Serializable
data class OriginalAnalysis(
    @SerialName("hook_strategy") val hookStrategy: String = "",
    val pacing: String = "",
    @SerialName("target_audience") val targetAudience: String = "",
    @SerialName("virality_triggers") val viralityTriggers: List<String> = emptyList()
)

@Serializable
data class ClonedContent(
    val hook: String = "",
    @SerialName("full_script") val fullScript: String = "",
    @SerialName("call_to_action") val callToAction: String = ""
)

@Serializable
data class SceneVisual(
    @SerialName("section_name") val sectionName: String = "",
    @SerialName("visual_description") val visualDescription: String = "",
    @SerialName("stock_broll_keywords") val stockBrollKeywords: List<String> = emptyList(),
    @SerialName("ai_image_prompt") val aiImagePrompt: String = ""
)

@Serializable
data class SeoPackage(
    val description: String = "",
    val tags: List<String> = emptyList(),
    val hashtags: List<String> = emptyList()
)

@Serializable
data class ThumbnailConcept(
    @SerialName("visual_description") val visualDescription: String = "",
    @SerialName("text_overlay") val textOverlay: String = "",
    @SerialName("ai_image_prompt") val aiImagePrompt: String = ""
)
