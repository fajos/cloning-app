let globalLastResult = null;
let trendingNichesList = [];
let currentNicheCategory = 'Finance & Wealth';

// Verified Active Partner & Affiliate Programs (ElevenLabs & VidIQ)
const PARTNER_LINKS = {
    elevenlabs: 'https://elevenlabs.io/affiliates', // 30% Recurring AI Voice
    vidiq: 'https://vidiq.com/affiliates'           // Up to 40% Recurring YouTube SEO
};

// Explicitly assign to window so inline onclick handlers never fail
window.toggleModal = toggleModal;
window.toggleNicheExplorer = toggleNicheExplorer;
window.switchNicheCategory = switchNicheCategory;
window.searchCustomNiche = searchCustomNiche;
window.launchNicheChannel = launchNicheChannel;
window.cloneChannelUrl = cloneChannelUrl;
window.generateScriptForTopic = generateScriptForTopic;
window.openPartnerTool = openPartnerTool;

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Bind Explore Niches Button directly
    const exploreBtn = document.getElementById('explore-niches-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleNicheExplorer();
        });
    }

    // Allow Enter key on custom search input
    const searchInput = document.getElementById('niche-search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchCustomNiche();
            }
        });
    }

    // Tab switching in results
    setupTabs();

    // Form submission
    const analyzeForm = document.getElementById('analyze-form');
    if (analyzeForm) {
        analyzeForm.addEventListener('submit', handleFormSubmit);
    }

    // Automatically load trending niches on page start
    loadTrendingNiches(currentNicheCategory);
});

function openPartnerTool(toolName) {
    const url = PARTNER_LINKS[toolName] || 'https://elevenlabs.io/affiliates';
    window.open(url, '_blank', 'noopener,noreferrer');
}

function searchCustomNiche() {
    const input = document.getElementById('niche-search-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) {
        showToast('Please enter a search keyword', 'error');
        return;
    }
    switchNicheCategory(query);
}

function toggleNicheExplorer() {
    const sec = document.getElementById('niche-explorer-section');
    if (!sec) return;
    if (sec.classList.contains('hidden')) {
        sec.classList.remove('hidden');
        loadTrendingNiches(currentNicheCategory);
        setTimeout(() => {
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        sec.classList.add('hidden');
    }
}

async function switchNicheCategory(cat, clickedBtn) {
    currentNicheCategory = cat;

    const btns = document.querySelectorAll('.niche-cat-btn');
    btns.forEach(b => {
        b.className = 'niche-cat-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-200 whitespace-nowrap';
    });

    if (clickedBtn) {
        clickedBtn.className = 'niche-cat-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap';
    }

    await loadTrendingNiches(cat);
}

async function loadTrendingNiches(category = 'Finance & Wealth') {
    const grid = document.getElementById('niche-cards-grid');
    if (!grid) return;
    grid.innerHTML = `<p class="text-xs text-amber-300 p-4 col-span-full text-center"><i class="fa-solid fa-spinner fa-spin"></i> Dynamically searching live YouTube channels & niches in "${escapeHtml(category)}"...</p>`;

    const provider = localStorage.getItem('ai_provider') || 'deepseek';
    let apiKey = localStorage.getItem(`${provider}_api_key`) || localStorage.getItem('deepseek_api_key') || localStorage.getItem('gemini_api_key') || '';

    try {
        console.log("Fetching dynamic niches for:", category);
        const url = `/api/trending-niches?category=${encodeURIComponent(category)}&api_key=${encodeURIComponent(apiKey)}&ai_provider=${encodeURIComponent(provider)}`;
        const res = await fetch(url);
        const rawText = await res.text();
        let data = {};
        try {
            data = JSON.parse(rawText);
        } catch (pErr) {
            console.error("Failed to parse JSON response:", rawText);
            const errSnippet = rawText ? escapeHtml(rawText.substring(0, 150)) : 'Empty Response';
            grid.innerHTML = `<p class="text-xs text-red-400 p-4 col-span-full text-center">Server Response Error (${res.status}): ${errSnippet}</p>`;
            return;
        }

        if (data.success && data.niches && data.niches.length > 0) {
            trendingNichesList = data.niches;
            renderNicheCards(data.niches);
        } else {
            grid.innerHTML = '<p class="text-xs text-gray-400 p-4 col-span-full text-center">No niche results returned. Please try selecting another category.</p>';
        }
    } catch (err) {
        console.error("Error loading trending niches:", err);
        grid.innerHTML = `<p class="text-xs text-red-400 p-4 col-span-full text-center">Failed to load trending niches: ${escapeHtml(err.message)}</p>`;
    }
}

function renderNicheCards(niches) {
    try {
        const grid = document.getElementById('niche-cards-grid');
        if (!grid) return;

        if (!Array.isArray(niches) || niches.length === 0) {
            grid.innerHTML = '<p class="text-xs text-gray-400 p-4 col-span-full text-center">No niches found.</p>';
            return;
        }

        grid.innerHTML = niches.map(n => {
            const nicheName = n.niche_name || n.name || 'Trending Niche';
            const catName = n.category || 'General';
            const cpm = n.cpm_estimate || '$20 - $35';
            const desc = n.description || 'High-demand creator niche.';
            const nicheId = n.id || nicheName.toLowerCase().replace(/[^a-z0-0]/g, '-');
            const channels = Array.isArray(n.suggested_channels) ? n.suggested_channels : [];
            const topics = Array.isArray(n.example_topics) ? n.example_topics : [];

            return `
                <div class="glass-card rounded-xl p-4 border border-gray-800 space-y-3 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                    <div class="space-y-2.5">
                        <div class="flex items-center justify-between gap-2">
                            <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">${escapeHtml(catName)}</span>
                            <span class="text-[10px] font-semibold text-emerald-400">CPM: ${escapeHtml(cpm)}</span>
                        </div>
                        <h4 class="text-sm font-bold text-white leading-snug">${escapeHtml(nicheName)}</h4>
                        <p class="text-xs text-gray-300 leading-relaxed">${escapeHtml(desc)}</p>

                        <!-- Recommended Channels to Clone -->
                        <div class="space-y-1.5 pt-1 border-t border-gray-800/80">
                            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🎥 Live YouTube Channels to Clone:</span>
                            <div class="space-y-1.5">
                                ${channels.map(ch => {
                                    const chName = typeof ch === 'object' ? (ch.name || 'Creator Channel') : String(ch);
                                    const chUrl = typeof ch === 'object' ? (ch.url || `https://www.youtube.com/${chName}`) : `https://www.youtube.com/${chName}`;
                                    const chSubs = typeof ch === 'object' ? (ch.subscriber_highlight || 'Verified Hit') : 'Verified Hit';
                                    const chWhy = typeof ch === 'object' ? (ch.why_clone || 'High retention model') : 'High retention model';
                                    const chEarnings = typeof ch === 'object' ? (ch.estimated_video_earnings || '') : '';
                                    const encodedUrl = encodeURIComponent(String(chUrl));

                                    return `
                                        <div class="p-2.5 bg-gray-950/90 rounded-lg border border-gray-800 flex items-start justify-between gap-3 text-xs">
                                            <div class="space-y-1 flex-1 overflow-hidden">
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <span class="font-bold text-gray-100">${escapeHtml(chName)}</span>
                                                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">${escapeHtml(chSubs)}</span>
                                                </div>
                                                <div class="text-[11px] text-gray-300 font-medium leading-tight">
                                                    <i class="fa-solid fa-circle-play text-purple-400 text-[10px] mr-1"></i>${escapeHtml(chWhy)}
                                                </div>
                                                ${chEarnings ? `
                                                <div class="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                                    <i class="fa-solid fa-sack-dollar text-[10px]"></i> Est. Video Revenue: ${escapeHtml(chEarnings)}
                                                </div>
                                                ` : ''}
                                            </div>
                                            <button onclick="cloneChannelUrl('${encodedUrl}')" class="px-2.5 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded-md text-[10px] font-bold flex-shrink-0 transition-colors">
                                                🎥 Clone
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        ${topics.length > 0 ? `
                        <div class="pt-2 border-t border-gray-800/80 space-y-1">
                            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">🔥 High-CTR Viral Topics:</span>
                            <ul class="space-y-1 text-[11px] text-gray-300">
                                ${topics.map(t => `<li class="flex items-start gap-1.5"><span class="text-indigo-400 font-bold">•</span><span class="leading-tight">${escapeHtml(t)}</span></li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>

                    <button onclick="launchNicheChannel('${escapeHtml(nicheId)}')" class="w-full py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs rounded-lg border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 mt-3">
                        <i class="fa-solid fa-rocket"></i> Launch Auto Niche Channel
                    </button>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Error in renderNicheCards:", err);
    }
}

function cloneChannelUrl(encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    const urlInput = document.getElementById('youtube-url');
    if (urlInput) {
        urlInput.value = url;
        showToast(`Loading 12-State Clone Blueprint for: ${url.split('/').pop()}...`);
        const analyzeForm = document.getElementById('analyze-form');
        if (analyzeForm) {
            analyzeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }
}

async function launchNicheChannel(nicheId) {
    showLoadingState(true);
    hideResults();
    showToast('Building complete Channel Setup Package...');

    try {
        const url = `/api/launch-niche-channel?niche_id=${encodeURIComponent(nicheId)}`;
        const response = await fetch(url);
        const rawText = await response.text();
        let result = {};
        try {
            result = JSON.parse(rawText);
        } catch (pErr) {
            throw new Error('Server returned unexpected response format.');
        }

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to launch niche channel');
        }

        globalLastResult = result;
        renderResults(result);
        showResults();
        showToast('Niche Channel Launch Package Generated!');
    } catch (err) {
        showToast(err.message, 'error');
        showErrorOnScreen(err.message);
    } finally {
        showLoadingState(false);
    }
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => {
                b.classList.remove('tab-active');
                b.classList.add('text-gray-400');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            btn.classList.add('tab-active');
            btn.classList.remove('text-gray-400');

            const activeContent = document.getElementById(`tab-${target}`);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }
        });
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const youtubeUrl = document.getElementById('youtube-url').value.trim();
    if (!youtubeUrl) {
        showToast('Please enter a valid Video or Channel URL', 'error');
        return;
    }

    const targetFormat = document.querySelector('input[name="format"]:checked')?.value || 'Auto-Detect';
    const targetTone = document.querySelector('input[name="tone"]:checked')?.value || 'Auto-Detect';

    // UI state: Loading
    showLoadingState(true);
    hideResults();

    try {
        console.log("Sending request to /api/analyze...", { youtubeUrl, targetFormat, targetTone });

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                youtube_url: youtubeUrl,
                target_format: targetFormat,
                target_tone: targetTone
            })
        });

        const rawText = await response.text();
        let result = {};
        try {
            result = JSON.parse(rawText);
        } catch (pErr) {
            throw new Error('Analysis returned invalid response.');
        }

        if (!response.ok || !result.success) {
            const errDetail = result.error || result.detail || 'Failed to analyze channel';
            throw new Error(errDetail);
        }

        globalLastResult = result;
        renderResults(result);
        showResults();
        showToast('12-State Channel Clone Package Generated!');

    } catch (err) {
        console.error("Analysis Error:", err);
        showToast(err.message, 'error');
        showErrorOnScreen(err.message);
    } finally {
        showLoadingState(false);
    }
}

function generateScriptForTopic(encodedTitle) {
    const topicText = decodeURIComponent(encodedTitle);
    const urlInput = document.getElementById('youtube-url');
    if (urlInput) {
        urlInput.value = topicText;
        showToast(`Generating full script & prompts for: "${topicText.substring(0, 35)}..."`);
        const analyzeForm = document.getElementById('analyze-form');
        if (analyzeForm) {
            analyzeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }
}

function showErrorOnScreen(msg) {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.innerHTML = `
            <div class="glass-card rounded-2xl p-6 border border-red-500/40 bg-red-950/20 text-center space-y-3">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 text-xl">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-base font-bold text-white">Analysis Could Not Complete</h3>
                <p class="text-xs text-red-300 max-w-lg mx-auto">${escapeHtml(msg)}</p>
            </div>
        `;
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showLoadingState(loading) {
    const loader = document.getElementById('loading-section');
    const submitBtn = document.getElementById('submit-btn');
    if (!loader || !submitBtn) return;

    if (loading) {
        loader.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        loader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        loader.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function showResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
}

function renderResults(res) {
    try {
        const metadata = res.video_metadata || {};
        const data = res.data || {};

        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        // Reset Results Section HTML Structure
        resultsSection.innerHTML = `
            <!-- Video Summary Card -->
            <div class="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div class="flex flex-col sm:flex-row items-center gap-5 w-full">
                    <img id="res-thumbnail" src="${metadata.thumbnail || 'https://via.placeholder.com/320x180'}" alt="Thumbnail" class="w-full sm:w-44 h-28 object-cover rounded-xl border border-gray-800 flex-shrink-0">
                    <div class="space-y-1.5 w-full text-center sm:text-left">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-semibold">
                            <i class="fa-solid fa-circle-check"></i> 12-State Channel Clone Complete
                        </div>
                        <h3 id="res-original-title" class="text-base sm:text-lg font-bold text-white line-clamp-1">${escapeHtml(metadata.title || 'Channel / Video')}</h3>
                        <p class="text-xs text-gray-400 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span><i class="fa-solid fa-user text-gray-500"></i> <span id="res-author">${escapeHtml(metadata.author || 'Unknown Channel')}</span></span>
                            <span>•</span>
                            <span><i class="fa-solid fa-file-lines text-gray-500"></i> <span id="res-word-count">${res.transcript_status?.word_count ? res.transcript_status.word_count + ' words analyzed' : 'Full 12-State Channel Brief'}</span></span>
                            <span>•</span>
                            <span class="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 inline-flex items-center gap-1 text-[11px]">
                                <i class="fa-solid fa-sack-dollar text-emerald-400"></i> Est. Video Revenue: ${escapeHtml(metadata.estimated_earnings?.earnings_formatted || '$12.5K - $32.0K')}
                            </span>
                        </p>
                    </div>
                </div>

                <!-- STATE 12: Export Word Document Button -->
                <button id="export-docx-btn" onclick="exportWordDoc()" class="w-full sm:w-auto px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 flex-shrink-0 transition-all shadow-lg shadow-blue-600/20">
                    <i class="fa-solid fa-file-word text-sm"></i> Export Word (.docx)
                </button>
            </div>

            <!-- Tab Navigation Bar -->
            <div class="flex items-center gap-2 border-b border-gray-800 pb-1 overflow-x-auto">
                <button data-tab="branding" class="tab-btn tab-active px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                    <i class="fa-solid fa-palette text-amber-400"></i> Branding Brief (State 2)
                </button>
                <button data-tab="script" class="tab-btn text-gray-400 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap hover:text-gray-200">
                    <i class="fa-solid fa-scroll text-purple-400"></i> Script & Hook (State 5 & 6)
                </button>
                <button data-tab="visuals" class="tab-btn text-gray-400 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap hover:text-gray-200">
                    <i class="fa-solid fa-clackboard text-cyan-400"></i> Beat Prompts (State 8 & 9)
                </button>
                <button data-tab="titles" class="tab-btn text-gray-400 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap hover:text-gray-200">
                    <i class="fa-solid fa-heading text-indigo-400"></i> Topic Ideas (State 4)
                </button>
                <button data-tab="seo" class="tab-btn text-gray-400 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap hover:text-gray-200">
                    <i class="fa-solid fa-magnifying-glass-chart text-emerald-400"></i> SEO & Description
                </button>
                <button data-tab="monetization" class="tab-btn text-gray-400 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap hover:text-gray-200">
                    <i class="fa-solid fa-sack-dollar text-amber-400"></i> Monetization Tips
                </button>
            </div>

            <!-- TAB 0: BRANDING BRIEF (State 2) -->
            <div id="tab-branding" class="tab-content space-y-6">
                <div class="glass-card rounded-xl p-5 border border-amber-500/30 space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-id-card"></i> Suggested Clone Channel Names
                    </h4>
                    <div id="res-branding-names" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>

                    <div class="space-y-1.5 pt-2">
                        <h5 class="text-xs font-bold uppercase tracking-wider text-gray-300">Channel Description Variants</h5>
                        <div id="res-branding-desc" class="space-y-2 text-xs text-gray-300"></div>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-gray-800">
                        <div class="space-y-1">
                            <span class="text-xs font-semibold text-purple-400">Logo Prompt (Midjourney / AI Generator)</span>
                            <p id="res-logo-prompt" class="p-3 bg-gray-950/90 rounded-xl border border-gray-800 text-xs font-mono text-purple-300">Logo prompt...</p>
                        </div>
                        <div class="space-y-1 pt-2">
                            <span class="text-xs font-semibold text-indigo-400">Banner Prompt (Midjourney / AI Generator)</span>
                            <p id="res-banner-prompt" class="p-3 bg-gray-950/90 rounded-xl border border-gray-800 text-xs font-mono text-indigo-300">Banner prompt...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 1: SCRIPT & HOOK (State 5 & 6) -->
            <div id="tab-script" class="tab-content hidden space-y-6">
                <div class="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                        <i class="fa-solid fa-dna"></i> Style DNA & Hook Strategy
                    </h4>
                    <p id="res-hook-strategy" class="text-xs sm:text-sm text-gray-300">Analysis of the original hook mechanics...</p>
                </div>

                <div class="glass-card rounded-xl p-5 border border-indigo-500/30 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                            <i class="fa-solid fa-fire"></i> New 3-Second Retention Hook
                        </span>
                        <button onclick="copyToClipboard(document.getElementById('res-3sec-hook').innerText)" class="px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-colors">
                            <i class="fa-regular fa-copy"></i> Copy Hook
                        </button>
                    </div>
                    <p id="res-3sec-hook" class="text-sm sm:text-base font-semibold text-white bg-gray-950/80 p-3.5 rounded-lg border border-gray-800">
                        Opening line...
                    </p>
                </div>

                <div class="glass-card rounded-xl p-5 border border-gray-800 space-y-3">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                            <i class="fa-solid fa-align-left text-purple-400"></i> Full AI Cloned Script
                        </span>
                        <div class="flex items-center gap-2">
                            <button onclick="copyFullScript()" class="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition-colors flex items-center gap-1.5">
                                <i class="fa-regular fa-copy"></i> Copy Script
                            </button>
                            <button onclick="openPartnerTool('elevenlabs')" class="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5">
                                🎙️ Generate AI Voiceover (ElevenLabs)
                            </button>
                        </div>
                    </div>
                    <div class="bg-gray-950/90 p-4 sm:p-5 rounded-xl border border-gray-800 overflow-x-auto">
                        <pre id="res-full-script" class="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">Script content...</pre>
                    </div>
                </div>

                <div class="glass-card rounded-xl p-4 border border-gray-800 space-y-1">
                    <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Call To Action (Outro)</span>
                    <p id="res-cta" class="text-xs sm:text-sm text-gray-300 font-medium">Outro line...</p>
                </div>
            </div>

            <!-- TAB: VISUALS & BEAT PROMPTS (State 8 & 9) -->
            <div id="tab-visuals" class="tab-content hidden space-y-4">
                <div class="glass-card rounded-xl p-5 border border-gray-800 space-y-4">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                            <i class="fa-solid fa-clackboard"></i> Beat-by-Beat Image & Video Motion Prompts (3-5s beats)
                        </h4>
                        <span class="text-[11px] text-gray-400">Standalone Midjourney / Runway Prompts</span>
                    </div>

                    <div id="res-visuals-container" class="space-y-3"></div>
                </div>
            </div>

            <!-- TAB: TOPIC IDEAS (State 4) -->
            <div id="tab-titles" class="tab-content hidden space-y-6">
                <div class="glass-card rounded-xl p-5 border border-gray-800 space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-arrow-trend-up"></i> 5 Viral Topic & Video Ideas
                    </h4>
                    <div id="res-titles-container" class="space-y-2"></div>
                </div>

                <div class="glass-card rounded-xl p-5 border border-gray-800 space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-image"></i> AI Thumbnail Concept
                    </h4>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div class="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-1">
                            <span class="text-gray-400 font-semibold uppercase text-[10px]">Visual Layout</span>
                            <p id="res-thumb-desc" class="text-gray-200 font-medium">Layout description...</p>
                        </div>
                        <div class="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-1">
                            <span class="text-gray-400 font-semibold uppercase text-[10px]">Bold Text Overlay</span>
                            <p id="res-thumb-text" class="text-amber-400 font-bold text-sm">Text on thumbnail</p>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-gray-400">Midjourney / DALL-E Image Prompt</span>
                            <button onclick="copyToClipboard(document.getElementById('res-thumb-prompt').innerText)" class="px-2.5 py-1 text-xs bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white rounded-md transition-colors">
                                <i class="fa-regular fa-copy"></i> Copy Prompt
                            </button>
                        </div>
                        <p id="res-thumb-prompt" class="p-3 bg-gray-950/90 rounded-xl border border-gray-800 text-xs font-mono text-purple-300">Prompt text...</p>
                    </div>
                </div>
            </div>

            <!-- TAB: SEO PACKAGE -->
            <div id="tab-seo" class="tab-content hidden space-y-6">
                <div class="glass-card rounded-xl p-5 border border-gray-800 space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <i class="fa-solid fa-file-text"></i> Monetization SEO Description
                        </h4>
                        <div class="flex items-center gap-2">
                            <button onclick="copyToClipboard(document.getElementById('res-seo-desc').innerText)" class="px-2.5 py-1 text-xs bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white rounded-md transition-colors">
                                <i class="fa-regular fa-copy"></i> Copy
                            </button>
                            <button onclick="openPartnerTool('vidiq')" class="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-md transition-colors font-semibold">
                                📈 Boost Rank with VidIQ
                            </button>
                        </div>
                    </div>
                    <pre id="res-seo-desc" class="p-3.5 bg-gray-950/90 rounded-xl border border-gray-800 text-xs text-gray-300 whitespace-pre-wrap font-sans">Description...</pre>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="glass-card rounded-xl p-4 border border-gray-800 space-y-2">
                        <h5 class="text-xs font-bold uppercase tracking-wider text-purple-400">Search Tags</h5>
                        <div id="res-seo-tags" class="flex flex-wrap gap-1.5"></div>
                    </div>
                    <div class="glass-card rounded-xl p-4 border border-gray-800 space-y-2">
                        <h5 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Trending Hashtags</h5>
                        <div id="res-seo-hashtags" class="flex flex-wrap gap-1.5"></div>
                    </div>
                </div>
            </div>

            <!-- TAB: MONETIZATION TIPS -->
            <div id="tab-monetization" class="tab-content hidden space-y-4">
                <div class="glass-card rounded-xl p-5 border border-gray-800 space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-chart-line"></i> Algorithmic Retention & Channel Growth Strategy
                    </h4>
                    <ul id="res-monetization-tips" class="space-y-2.5"></ul>
                </div>
            </div>
        `;

        setupTabs();

        // 0. BRANDING BRIEF (STATE 2)
        const brief = data.stage2_branding_brief || {};
        const namesContainer = document.getElementById('res-branding-names');
        if (namesContainer) {
            namesContainer.innerHTML = (brief.suggested_channel_names || []).map(n => {
                const encoded = encodeURIComponent(String(n));
                return `<div class="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-semibold text-amber-300 flex items-center justify-between">
                    <span>${escapeHtml(n)}</span>
                    <button onclick="copyEncoded('${encoded}')" class="text-gray-400 hover:text-white"><i class="fa-regular fa-copy"></i></button>
                 </div>`;
            }).join('');
        }

        const descContainer = document.getElementById('res-branding-desc');
        if (descContainer) {
            descContainer.innerHTML = (brief.channel_description_variants || []).map((d, i) =>
                `<div class="p-3 bg-gray-900 border border-gray-800 rounded-lg">
                    <span class="text-amber-400 font-bold block mb-1">Variant #${i+1}</span>
                    <p class="italic text-gray-300">"${escapeHtml(d)}"</p>
                 </div>`
            ).join('');
        }

        const logoEl = document.getElementById('res-logo-prompt');
        if (logoEl) logoEl.innerText = brief.logo_generation_prompt || 'N/A';

        const bannerEl = document.getElementById('res-banner-prompt');
        if (bannerEl) bannerEl.innerText = brief.banner_generation_prompt || 'N/A';

        // 1. STYLE DNA & HOOK STRATEGY (STATE 5)
        const styleDna = data.stage5_style_dna || data.original_analysis || {};
        const hookStratText = styleDna.hook_style || styleDna.hook_strategy || styleDna.hook || 'Analyzed channel hook pacing, sentence rhythm, and curiosity triggers.';
        const hookStratEl = document.getElementById('res-hook-strategy');
        if (hookStratEl) hookStratEl.innerText = hookStratText;

        // 2. SCRIPT (STATE 6)
        const scriptObj = data.stage6_script || data.cloned_content || {};
        const hookLine = scriptObj.hook || 'Opening retention hook.';
        const fullScriptText = scriptObj.full_script || scriptObj.script || 'Full script narration.';
        const ctaLine = scriptObj.outro || scriptObj.call_to_action || 'Subscribe call to action.';

        const hookEl = document.getElementById('res-3sec-hook');
        if (hookEl) hookEl.innerText = hookLine;

        const scriptEl = document.getElementById('res-full-script');
        if (scriptEl) scriptEl.innerText = fullScriptText;

        const ctaEl = document.getElementById('res-cta');
        if (ctaEl) ctaEl.innerText = ctaLine;

        // 3. BEAT PROMPTS & VISUALS (STATE 8 & 9)
        const visuals = data.stage7_8_9_beat_prompts || data.scene_visuals || [];
        const visualsContainer = document.getElementById('res-visuals-container');
        if (visualsContainer) {
            visualsContainer.innerHTML = '';
            if (visuals.length === 0) {
                visualsContainer.innerHTML = '<p class="text-xs text-gray-400 p-4">No beat breakdown available.</p>';
            } else {
                visuals.forEach((sc, idx) => {
                    const div = document.createElement('div');
                    div.className = 'p-4 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2';
                    const segText = sc.script_segment || sc.section_name || `Beat #${sc.beat_num || idx+1}`;
                    const imgPrompt = sc.image_prompt || sc.ai_image_prompt || 'Visual prompt';
                    const vidPrompt = sc.video_motion_prompt || 'Motion prompt';
                    const camera = sc.camera_angle || 'Wide';
                    const lighting = sc.lighting || 'Cinematic';
                    const mood = sc.mood || 'Engaging';
                    const encodedImg = encodeURIComponent(String(imgPrompt));

                    div.innerHTML = `
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider"><i class="fa-solid fa-video"></i> Beat #${sc.beat_num || idx+1} | ${escapeHtml(segText)}</span>
                        </div>
                        <p class="text-xs text-gray-200 font-medium">Image Prompt: ${escapeHtml(imgPrompt)}</p>
                        <p class="text-xs text-indigo-300 font-medium">Video Motion: ${escapeHtml(vidPrompt)}</p>
                        <div class="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 pt-1">
                            <span>Camera: ${escapeHtml(camera)}</span> •
                            <span>Lighting: ${escapeHtml(lighting)}</span> •
                            <span>Mood: ${escapeHtml(mood)}</span>
                        </div>
                        <div class="pt-1.5 text-[11px] text-purple-300 font-mono bg-gray-900/60 p-2 rounded border border-gray-800 flex items-center justify-between gap-2">
                            <span class="truncate">Midjourney: "${escapeHtml(imgPrompt)}"</span>
                            <button onclick="copyEncoded('${encodedImg}')" class="px-2 py-0.5 bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white rounded text-[10px]">
                                <i class="fa-regular fa-copy"></i> Copy
                            </button>
                        </div>
                    `;
                    visualsContainer.appendChild(div);
                });
            }
        }

        // 4. TOPIC & TITLE IDEAS (STATE 4)
        const titles = data.stage4_topic_and_ideas || data.titles || [];
        const titlesContainer = document.getElementById('res-titles-container');
        if (titlesContainer) {
            titlesContainer.innerHTML = '';
            titles.forEach((title, idx) => {
                const encodedTitle = encodeURIComponent(String(title));
                const item = document.createElement('div');
                item.className = 'p-3.5 bg-gray-900/60 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-500/40 transition-all';
                item.innerHTML = `
                    <div class="flex items-center gap-3 overflow-hidden flex-1">
                        <span class="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">${idx + 1}</span>
                        <span class="text-sm font-medium text-gray-200">${escapeHtml(title)}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                        <button onclick="copyEncoded('${encodedTitle}')" class="px-2.5 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                            <i class="fa-regular fa-copy"></i> Copy
                        </button>
                        <button onclick="generateScriptForTopic('${encodedTitle}')" class="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5">
                            <i class="fa-solid fa-bolt text-amber-300"></i> Generate Script & Prompts
                        </button>
                    </div>
                `;
                titlesContainer.appendChild(item);
            });
        }

        // 5. THUMBNAILS (STATE 10 & 11)
        const thumbs = data.stage10_11_thumbnails || (data.thumbnail_concept ? [data.thumbnail_concept] : []);
        if (thumbs.length > 0) {
            const thumb = thumbs[0];
            const tDesc = document.getElementById('res-thumb-desc');
            if (tDesc) tDesc.innerText = thumb.visual_concept || thumb.visual_description || 'N/A';

            const tText = document.getElementById('res-thumb-text');
            if (tText) tText.innerText = thumb.text_overlay || 'N/A';

            const tPrompt = document.getElementById('res-thumb-prompt');
            if (tPrompt) tPrompt.innerText = thumb.midjourney_prompt || thumb.ai_image_prompt || 'N/A';
        }

        // 6. SEO PACKAGE
        const seo = data.seo_package || {};
        const seoDescEl = document.getElementById('res-seo-desc');
        if (seoDescEl) seoDescEl.innerText = seo.description || 'N/A';

        const tagsContainer = document.getElementById('res-seo-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = (seo.tags || []).map(t => `<span class="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md text-xs">#${escapeHtml(t)}</span>`).join(' ');
        }

        const hashtagsContainer = document.getElementById('res-seo-hashtags');
        if (hashtagsContainer) {
            hashtagsContainer.innerHTML = (seo.hashtags || []).map(h => `<span class="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-xs">${escapeHtml(h)}</span>`).join(' ');
        }

        // 7. MONETIZATION TIPS
        const tips = data.monetization_growth_tips || [];
        const tipsContainer = document.getElementById('res-monetization-tips');
        if (tipsContainer) {
            tipsContainer.innerHTML = '';
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.className = 'flex items-start gap-3 text-sm text-gray-300 bg-gray-900/40 p-3 rounded-xl border border-gray-800/80';
                li.innerHTML = `<i class="fa-solid fa-chart-line text-emerald-400 mt-0.5"></i> <span>${escapeHtml(tip)}</span>`;
                tipsContainer.appendChild(li);
            });
        }
    } catch (err) {
        console.error("Error rendering results:", err);
    }
}

async function exportWordDoc() {
    if (!globalLastResult || !globalLastResult.data) {
        showToast('No channel clone data available to export', 'error');
        return;
    }

    showToast('Generating Word Document (.docx)...');
    try {
        const response = await fetch('/api/export-docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(globalLastResult.data)
        });

        if (!response.ok) {
            throw new Error('Failed to generate Word document');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Channel_Clone_Package.docx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        showToast('Word Document downloaded successfully!');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function copyEncoded(encodedStr) {
    const text = decodeURIComponent(encodedStr);
    copyToClipboard(text);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(err => {
        showToast('Failed to copy text', 'error');
    });
}

function copyFullScript() {
    const hook = document.getElementById('res-3sec-hook').innerText;
    const body = document.getElementById('res-full-script').innerText;
    const cta = document.getElementById('res-cta').innerText;

    const fullText = `--- VIRAL 3-SECOND HOOK ---\n${hook}\n\n--- MAIN SCRIPT ---\n${body}\n\n--- CALL TO ACTION ---\n${cta}`;
    copyToClipboard(fullText);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastMsg) return;

    toastMsg.innerText = message;
    if (type === 'error') {
        toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-red-900/90 text-white rounded-xl border border-red-700 shadow-2xl backdrop-blur-md transition-all duration-300';
        toastIcon.className = 'fa-solid fa-triangle-exclamation text-red-400';
    } else {
        toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900/90 text-white rounded-xl border border-purple-500/40 shadow-2xl backdrop-blur-md transition-all duration-300';
        toastIcon.className = 'fa-solid fa-circle-check text-purple-400';
    }

    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3500);
}
