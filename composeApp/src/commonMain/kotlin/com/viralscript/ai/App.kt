package com.viralscript.ai

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.viralscript.ai.data.api.ApiClient
import com.viralscript.ai.data.model.*
import com.viralscript.ai.ui.theme.*
import kotlinx.coroutines.launch

sealed interface UiState {
    object Idle : UiState
    object Loading : UiState
    data class Success(val response: AnalyzeResponse) : UiState
    data class Error(val message: String) : UiState
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App() {
    ViralScriptTheme {
        val scope = rememberCoroutineScope()
        var uiState by remember { mutableStateOf<UiState>(UiState.Idle) }

        var youtubeUrl by remember { mutableStateOf("") }
        var aiProvider by remember { mutableStateOf("deepseek") }
        var deepseekApiKey by remember { mutableStateOf("") }
        var geminiApiKey by remember { mutableStateOf("") }

        var selectedFormat by remember { mutableStateOf("Shorts") }
        var selectedTone by remember { mutableStateOf("Punchy & Viral") }
        var showSettings by remember { mutableStateOf(false) }
        var isSystemReady by remember { mutableStateOf(true) }

        LaunchedEffect(Unit) {
            isSystemReady = ApiClient.checkHealth()
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(
                                        Brush.linearGradient(
                                            listOf(
                                                PurplePrimary,
                                                IndigoSecondary
                                            )
                                        )
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("⚡", fontSize = 18.sp)
                            }
                            Column {
                                Text(
                                    "ViralScript AI",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextWhite
                                )
                                Text(
                                    "Android & iOS Cross-Platform",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                        }
                    },
                    actions = {
                        Surface(
                            color = if (isSystemReady) Color(0xFF10B981).copy(alpha = 0.15f) else Color(0xFFEF4444).copy(alpha = 0.15f),
                            shape = androidx.compose.foundation.shape.CircleShape,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSystemReady) Color(0xFF10B981).copy(alpha = 0.3f) else Color(0xFFEF4444).copy(alpha = 0.3f)),
                            modifier = Modifier.padding(end = 4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(androidx.compose.foundation.shape.CircleShape)
                                        .background(if (isSystemReady) Color(0xFF34D399) else Color(0xFFF87171))
                                )
                                Text(
                                    text = if (isSystemReady) "System Ready" else "Connecting...",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = if (isSystemReady) Color(0xFF34D399) else Color(0xFFF87171)
                                )
                            }
                        }
                        TextButton(onClick = { showSettings = true }) {
                            Text("⚙️", color = TextWhite, fontSize = 14.sp)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkBg)
                )
            },
            containerColor = DarkBg
        ) { paddingValues ->

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Input Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = CardBg),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, PurplePrimary.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            "Deconstruct Videos & Clone Scripts",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = TextWhite
                        )

                        OutlinedTextField(
                            value = youtubeUrl,
                            onValueChange = { youtubeUrl = it },
                            placeholder = { Text("Paste YouTube URL or Shorts link", color = TextMuted, fontSize = 13.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                unfocusedBorderColor = Color.Gray.copy(alpha = 0.3f),
                                focusedBorderColor = PurplePrimary,
                                unfocusedContainerColor = DarkBg,
                                focusedContainerColor = DarkBg,
                                focusedTextColor = TextWhite,
                                unfocusedTextColor = TextWhite
                            )
                        )

                        // Target Format Chips
                        Text("Target Format", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            listOf("Shorts", "Long-form", "Explainer").forEach { fmt ->
                                FilterChip(
                                    selected = selectedFormat == fmt,
                                    onClick = { selectedFormat = fmt },
                                    label = { Text(fmt, fontSize = 11.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = PurplePrimary.copy(alpha = 0.2f),
                                        selectedLabelColor = PurplePrimary,
                                        containerColor = DarkBg,
                                        labelColor = TextMuted
                                    )
                                )
                            }
                        }

                        // Target Tone Chips
                        Text("Target Tone", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            listOf("Punchy & Viral", "Storytelling", "Controversial").forEach { tone ->
                                FilterChip(
                                    selected = selectedTone == tone,
                                    onClick = { selectedTone = tone },
                                    label = { Text(tone, fontSize = 11.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = IndigoSecondary.copy(alpha = 0.2f),
                                        selectedLabelColor = IndigoSecondary,
                                        containerColor = DarkBg,
                                        labelColor = TextMuted
                                    )
                                )
                            }
                        }

                        Button(
                            onClick = {
                                val apiKey = if (aiProvider == "deepseek") deepseekApiKey else geminiApiKey
                                if (apiKey.isBlank()) {
                                    uiState = UiState.Error("API Key missing for $aiProvider. Please configure in Settings.")
                                    return@Button
                                }

                                uiState = UiState.Loading
                                scope.launch {
                                    val req = AnalyzeRequest(
                                        youtubeUrl = youtubeUrl,
                                        apiKey = apiKey,
                                        aiProvider = aiProvider,
                                        targetFormat = selectedFormat,
                                        targetTone = selectedTone
                                    )
                                    val res = ApiClient.analyzeVideo(req)
                                    if (res.success && res.data != null) {
                                        uiState = UiState.Success(res)
                                    } else {
                                        uiState = UiState.Error(res.error ?: "Failed to generate script")
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary)
                        ) {
                            Text("⚡ Deconstruct & Generate Script", fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // UI States
                when (val state = uiState) {
                    is UiState.Loading -> {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CardBg),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp).fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                CircularProgressIndicator(color = PurplePrimary)
                                Text("Synthesizing script & scene B-roll visuals...", fontSize = 13.sp, color = TextWhite)
                            }
                        }
                    }

                    is UiState.Error -> {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.15f)),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth().border(1.dp, Color.Red.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text("⚠️ ${state.message}", fontSize = 13.sp, color = TextWhite)
                            }
                        }
                    }

                    is UiState.Success -> {
                        SharedResultsDisplay(state.response)
                    }

                    else -> {}
                }
            }
        }

        if (showSettings) {
            AlertDialog(
                onDismissRequest = { showSettings = false },
                title = { Text("AI Settings", color = TextWhite, fontWeight = FontWeight.Bold) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("AI Provider", fontSize = 12.sp, color = TextMuted)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilterChip(
                                selected = aiProvider == "deepseek",
                                onClick = { aiProvider = "deepseek" },
                                label = { Text("DeepSeek V3") }
                            )
                            FilterChip(
                                selected = aiProvider == "gemini",
                                onClick = { aiProvider = "gemini" },
                                label = { Text("Google Gemini") }
                            )
                        }

                        OutlinedTextField(
                            value = if (aiProvider == "deepseek") deepseekApiKey else geminiApiKey,
                            onValueChange = { if (aiProvider == "deepseek") deepseekApiKey = it else geminiApiKey = it },
                            label = { Text("API Key ($aiProvider)", fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                },
                confirmButton = {
                    Button(onClick = { showSettings = false }) {
                        Text("Save")
                    }
                },
                containerColor = CardBg
            )
        }
    }
}

@Composable
fun SharedResultsDisplay(response: AnalyzeResponse) {
    var selectedTab by remember { mutableStateOf(0) }
    val data = response.data ?: return

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        response.videoMetadata?.let { meta ->
            Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(12.dp)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(meta.title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextWhite, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Text("By ${meta.author}", fontSize = 12.sp, color = TextMuted)
                }
            }
        }

        ScrollableTabRow(
            selectedTabIndex = selectedTab,
            containerColor = DarkBg,
            contentColor = PurplePrimary,
            edgePadding = 0.dp
        ) {
            listOf("Script & Hook", "Scene B-Roll", "Titles & Thumb", "SEO", "Monetization").forEachIndexed { idx, title ->
                Tab(
                    selected = selectedTab == idx,
                    onClick = { selectedTab = idx },
                    text = { Text(title, fontSize = 12.sp, fontWeight = if (selectedTab == idx) FontWeight.Bold else FontWeight.Normal) }
                )
            }
        }

        when (selectedTab) {
            0 -> {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    data.clonedContent?.let { cloned ->
                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(12.dp)) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("3-SECOND RETENTION HOOK", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PurplePrimary)
                                Text(cloned.hook, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextWhite)
                            }
                        }

                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(12.dp)) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("FULL AI SCRIPT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                Text(cloned.fullScript, fontSize = 12.sp, fontFamily = FontFamily.Monospace, color = TextWhite)
                            }
                        }
                    }
                }
            }

            1 -> {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    data.sceneVisuals.forEach { visual ->
                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(12.dp)) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(visual.sectionName, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = CyanAccent)
                                Text(visual.visualDescription, fontSize = 12.sp, color = TextWhite)
                                Text("B-Roll Keywords: ${visual.stockBrollKeywords.joinToString(", ")}", fontSize = 11.sp, color = TextMuted)
                                Text("AI Prompt: ${visual.aiImagePrompt}", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = PurplePrimary)
                            }
                        }
                    }
                }
            }

            2 -> {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    data.titles.forEachIndexed { idx, title ->
                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(10.dp)) {
                            Text("${idx + 1}. $title", fontSize = 12.sp, color = TextWhite, modifier = Modifier.padding(12.dp))
                        }
                    }
                }
            }

            3 -> {
                data.seoPackage?.let { seo ->
                    Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("SEO Description", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PurplePrimary)
                            Text(seo.description, fontSize = 12.sp, color = TextWhite)
                            Text("Tags: ${seo.tags.joinToString(", ")}", fontSize = 11.sp, color = TextMuted)
                        }
                    }
                }
            }

            4 -> {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    data.monetizationGrowthTips.forEach { tip ->
                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(10.dp)) {
                            Text("📈 $tip", fontSize = 12.sp, color = TextWhite, modifier = Modifier.padding(12.dp))
                        }
                    }
                }
            }
        }
    }
}
