package com.viralscript.ai.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.viralscript.ai.data.model.*
import com.viralscript.ai.ui.theme.*
import com.viralscript.ai.viewmodel.MainViewModel
import com.viralscript.ai.viewmodel.UiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: MainViewModel) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var youtubeUrl by remember { mutableStateOf("") }
    var showSettingsDialog by remember { mutableStateOf(false) }

    val selectedFormat by viewModel.selectedFormat.collectAsState()
    val selectedTone by viewModel.selectedTone.collectAsState()

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
                            Icon(
                                Icons.Default.Bolt,
                                contentDescription = null,
                                tint = Color.White
                            )
                        }
                        Column {
                            Text(
                                "ViralScript AI",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextWhite
                            )
                            Text(
                                "YouTube Cloner",
                                fontSize = 10.sp,
                                color = TextMuted
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { showSettingsDialog = true }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = TextWhite)
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
            // Hero Title Card
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
                        leadingIcon = { Icon(Icons.Default.PlayCircle, contentDescription = null, tint = Color.Red) },
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
                                onClick = { viewModel.selectedFormat.value = fmt },
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
                                onClick = { viewModel.selectedTone.value = tone },
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
                        onClick = { viewModel.analyzeVideo(youtubeUrl) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary)
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = Color.Yellow)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Deconstruct & Generate Script", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // State Handling
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
                            Text("Deconstructing hooks & generating script...", fontSize = 13.sp, color = TextWhite)
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
                            Icon(Icons.Default.Warning, contentDescription = null, tint = Color.Red)
                            Text(state.message, fontSize = 13.sp, color = TextWhite)
                        }
                    }
                }

                is UiState.Success -> {
                    ResultsDisplay(state.response, context)
                }

                else -> {}
            }
        }
    }

    if (showSettingsDialog) {
        SettingsDialog(
            viewModel = viewModel,
            onDismiss = { showSettingsDialog = false }
        )
    }
}

@Composable
fun ResultsDisplay(response: AnalyzeResponse, context: Context) {
    var selectedTab by remember { mutableStateOf(0) }
    val data = response.data ?: return

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Video Metadata Header
        response.videoMetadata?.let { meta ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CardBg),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(meta.title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextWhite, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Text("By ${meta.author}", fontSize = 12.sp, color = TextMuted)
                }
            }
        }

        // Tab Navigation
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

        // Tab Contents
        when (selectedTab) {
            0 -> {
                // Script
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
                                Row(horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                                    Text("FULL AI SCRIPT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                    IconButton(onClick = { copyToClipboard(context, cloned.fullScript) }) {
                                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = PurplePrimary)
                                    }
                                }
                                Text(cloned.fullScript, fontSize = 12.sp, fontFamily = FontFamily.Monospace, color = TextWhite)
                            }
                        }
                    }
                }
            }

            1 -> {
                // Scene B-Roll
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
                // Titles & Thumbnail
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    data.titles.forEachIndexed { idx, title ->
                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(10.dp)) {
                            Row(
                                modifier = Modifier.padding(10.dp).fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("${idx + 1}. $title", fontSize = 12.sp, color = TextWhite, modifier = Modifier.weight(1f))
                                IconButton(onClick = { copyToClipboard(context, title) }) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = PurplePrimary)
                                }
                            }
                        }
                    }
                }
            }

            3 -> {
                // SEO
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
                // Monetization
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    data.monetizationGrowthTips.forEach { tip ->
                        Card(colors = CardDefaults.cardColors(containerColor = CardBg), shape = RoundedCornerShape(10.dp)) {
                            Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.TrendingUp, contentDescription = null, tint = Color.Green)
                                Text(tip, fontSize = 12.sp, color = TextWhite)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsDialog(viewModel: MainViewModel, onDismiss: () -> Unit) {
    var provider by remember { mutableStateOf(viewModel.aiProvider.value) }
    var deepseekKey by remember { mutableStateOf(viewModel.deepSeekApiKey.value) }
    var geminiKey by remember { mutableStateOf(viewModel.geminiApiKey.value) }
    var url by remember { mutableStateOf(viewModel.serverUrl.value) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Settings", color = TextWhite, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("AI Provider", fontSize = 12.sp, color = TextMuted)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = provider == "deepseek",
                        onClick = { provider = "deepseek" },
                        label = { Text("DeepSeek V3") }
                    )
                    FilterChip(
                        selected = provider == "gemini",
                        onClick = { provider = "gemini" },
                        label = { Text("Google Gemini") }
                    )
                }

                OutlinedTextField(
                    value = if (provider == "deepseek") deepseekKey else geminiKey,
                    onValueChange = { if (provider == "deepseek") deepseekKey = it else geminiKey = it },
                    label = { Text("API Key ($provider)", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Backend Server URL", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                viewModel.updateSettings(provider, deepseekKey, geminiKey, url)
                onDismiss()
            }) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        containerColor = CardBg
    )
}

fun copyToClipboard(context: Context, text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = ClipData.newPlainText("Copied Text", text)
    clipboard.setPrimaryClip(clip)
    Toast.makeText(context, "Copied to clipboard", Toast.LENGTH_SHORT).show()
}
