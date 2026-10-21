let globalLastResult = null;
let trendingNichesList = [];
let currentNicheCategory = 'Finance & Wealth';

// Explicitly assign to window so inline onclick handlers never fail
window.toggleNicheExplorer = toggleNicheExplorer;
window.switchNicheCategory = switchNicheCategory;
window.searchCustomNiche = searchCustomNiche;
window.launchNicheChannel = launchNicheChannel;
window.cloneChannelUrl = cloneChannelUrl;
window.generateScriptForTopic = generateScriptForTopic;

document.addEventListener('DOMContentLoaded', () => {
    // Default provider
    let selectedProvider = localStorage.getItem('ai_provider') || 'deepseek';

    // Set active radio
    const providerRadios = document.querySelectorAll('input[name="provider-choice"]');
    providerRadios.forEach(r => {
        if (r.value === selectedProvider) {
            r.checked = true;
        }
        r.addEventListener('change', (e) => {
            selectedProvider = e.target.value;
            localStorage.setItem('ai_provider', selectedProvider);
            updateModalUI(selectedProvider);
        });
    });

    updateModalUI(selectedProvider);

    // Save API Key button
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKeyInput = document.getElementById('api-key-input');
            const val = apiKeyInput.value.trim();
            const provider = document.querySelector('input[name="provider-choice"]:checked')?.value || 'deepseek';

            localStorage.setItem(`${provider}_api_key`, val);
            localStorage.setItem('ai_provider', provider);

            updateApiKeyBadgeStatus();
            showToast('Settings saved successfully!');
            toggleModal('api-key-modal', false);
        });
    }

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

async function switchNicheCategory(cat) {
    currentNicheCategory = cat;

    const btns = document.querySelectorAll('.niche-cat-btn');
    btns.forEach(b => {
        const keyword = cat.split(' ')[0].toLowerCase();
        if (b.innerText.toLowerCase().includes(keyword)) {
            b.className = 'niche-cat-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap';
        } else {
            b.className = 'niche-cat-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-200 whitespace-nowrap';
        }
    });

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
        const res = await fetch('/api/trending-niches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: category,
                api_key: apiKey,
                ai_provider: provider
            })
        });
        const data = await res.json();
        console.log("Dynamic Niches API Response:", data);

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

            return `
                <div class="glass-card rounded-xl p-4 border border-gray-800 space-y-3 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                    <div class="space-y-2.5">
                        <div class="flex items-center justify-between gap-2">
                            <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">${escapeHtml(catName)}</span>
                            <span class="text-[10px] font-semibold text-emerald-400">CPM: ${escapeHtml(cpm)}</span>
                        </div>
                        <h4 class="text-sm font-bold text-white">${escapeHtml(nicheName)}</h4>
                        <p class="text-xs text-gray-400 line-clamp-2">${escapeHtml(desc)}</p>

                        <!-- Recommended Channels to Clone -->
                        <div class="space-y-1.5 pt-1 border-t border-gray-800/80">
                            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🎥 Live YouTube Channels to Clone:</span>
                            <div class="space-y-1.5">
                                ${channels.map(ch => {
                                    const chName = typeof ch === 'object' ? (ch.name || 'Creator Channel') : String(ch);
                                    const chUrl = typeof ch === 'object' ? (ch.url || `https://www.youtube.com/${chName}`) : `https://www.youtube.com/${chName}`;
                                    const chSubs = typeof ch === 'object' ? (ch.subscriber_highlight || 'Active Creator') : 'Active Creator';
                                    const chWhy = typeof ch === 'object' ? (ch.why_clone || 'High retention model') : 'High retention model';
                                    const encodedUrl = encodeURIComponent(String(chUrl));

                                    return `
                                        <div class="p-2 bg-gray-950/80 rounded-lg border border-gray-800 flex items-center justify-between gap-2 text-xs">
                                            <div class="overflow-hidden">
                                                <span class="font-bold text-gray-200 block truncate">${escapeHtml(chName)}</span>
                                                <span class="text-[10px] text-gray-400 truncate block">${escapeHtml(chSubs)} • ${escapeHtml(chWhy)}</span>
                                            </div>
                                            <button onclick="cloneChannelUrl('${encodedUrl}')" class="px-2 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-[10px] font-semibold flex-shrink-0 transition-colors">
                                                🎥 Clone
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <button onclick="launchNicheChannel('${escapeHtml(nicheId)}')" class="w-full py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs rounded-lg border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 mt-2">
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
    const provider = localStorage.getItem('ai_provider') || 'deepseek';
    let apiKey = localStorage.getItem(`${provider}_api_key`) || localStorage.getItem('deepseek_api_key') || localStorage.getItem('gemini_api_key') || '';

    if (!apiKey) {
        toggleModal('api-key-modal', true);
        showToast(`Please enter your ${provider === 'deepseek' ? 'DeepSeek' : 'Gemini'} API Key to launch channel setup.`, 'error');
        return;
    }

    showLoadingState(true);
    hideResults();
    showToast('Building complete Channel Setup Package...');

    try {
        const response = await fetch('/api/launch-niche-channel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                niche_id: nicheId,
                api_key: apiKey,
                ai_provider: provider
            })
        });

        const result = await response.json();
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

function updateModalUI(provider) {
    const keyInput = document.getElementById('api-key-input');
    const label = document.getElementById('key-input-label');
    const help = document.getElementById('key-help-text');

    const savedKey = localStorage.getItem(`${provider}_api_key`) || localStorage.getItem('deepseek_api_key') || localStorage.getItem('gemini_api_key') || '';
    if (keyInput) keyInput.value = savedKey;

    if (provider === 'deepseek') {
        if (label) label.innerText = 'Enter DeepSeek API Key';
        if (keyInput) keyInput.placeholder = 'sk-...';
        if (help) {
            help.innerHTML = `<i class="fa-solid fa-info-circle text-blue-400"></i> Get an API key at <a href="https://platform.deepseek.com/" target="_blank" class="text-blue-400 underline font-semibold">platform.deepseek.com</a>.`;
        }
    } else {
        if (label) label.innerText = 'Enter Gemini API Key';
        if (keyInput) keyInput.placeholder = 'AIzaSy...';
        if (help) {
            help.innerHTML = `<i class="fa-solid fa-info-circle text-purple-400"></i> Get a key at <a href="https://aistudio.google.com/" target="_blank" class="text-purple-400 underline font-semibold">aistudio.google.com</a>.`;
        }
    }

    updateApiKeyBadgeStatus();
}

function updateApiKeyBadgeStatus() {
    const badgeText = document.getElementById('badge-text');
    const apiKeyBadge = document.getElementById('api-key-badge');
    if (!apiKeyBadge || !badgeText) return;

    const provider = localStorage.getItem('ai_provider') || 'deepseek';
    const key = localStorage.getItem(`${provider}_api_key`) || localStorage.getItem('deepseek_api_key') || localStorage.getItem('gemini_api_key') || '';
    const providerName = provider === 'deepseek' ? 'DeepSeek' : 'Gemini';

    if (key) {
        apiKeyBadge.className = 'px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/20 transition-all';
        badgeText.innerText = `${providerName} Ready`;
    } else {
        apiKeyBadge.className = 'px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/20 transition-all';
        badgeText.innerText = `Set ${providerName} Key`;
    }
}

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

    const provider = localStorage.getItem('ai_provider') || 'deepseek';
    let apiKey = localStorage.getItem(`${provider}_api_key`) || '';

    // Smart fallback if key is in another provider slot
    if (!apiKey) {
        apiKey = localStorage.getItem('deepseek_api_key') || localStorage.getItem('gemini_api_key') || '';
    }

    if (!apiKey) {
        toggleModal('api-key-modal', true);
        showToast(`Please enter your ${provider === 'deepseek' ? 'DeepSeek' : 'Gemini'} API Key to continue.`, 'error');
        return;
    }

    const targetFormat = document.querySelector('input[name="format"]:checked')?.value || 'Auto-Detect';
    const targetTone = document.querySelector('input[name="tone"]:checked')?.value || 'Auto-Detect';

    // UI state: Loading
    showLoadingState(true);
    hideResults();

    try {
        console.log("Sending request to /api/analyze...", { youtubeUrl, provider, targetFormat, targetTone });

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                youtube_url: youtubeUrl,
                api_key: apiKey,
                ai_provider: provider,
                target_format: targetFormat,
                target_tone: targetTone
            })
        });

        const result = await response.json();
        console.log("Analyze Response Result:", result);

        if (!response.ok || !result.success) {
            const errDetail = result.error || result.detail || 'Failed to analyze channel';
            if (errDetail.toLowerCase().includes('key') || errDetail.toLowerCase().includes('missing')) {
                toggleModal('api-key-modal', true);
            }
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
                <div class="pt-2">
                    <button onclick="toggleModal('api-key-modal', true)" class="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                        <i class="fa-solid fa-key"></i> Open Settings & Check API Key
                    </button>
                </div>
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
                        <p class="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                            <span><i class="fa-solid fa-user text-gray-500"></i> <span id="res-author">${escapeHtml(metadata.author || 'Unknown Channel')}</span></span>
                            <span>•</span>
                            <span><i class="fa-solid fa-file-lines text-gray-500"></i> <span id="res-word-count">${res.transcript_status?.word_count ? res.transcript_status.word_count + ' words analyzed' : 'Full 12-State Channel Brief'}</span></span>
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
                            <span class="text-xs font-semibold text-purple-400">Logo Prompt (Midjourney)</span>
                            <p id="res-logo-prompt" class="p-3 bg-gray-950/90 rounded-xl border border-gray-800 text-xs font-mono text-purple-300">Logo prompt...</p>
                        </div>
                        <div class="space-y-1">
                            <span class="text-xs font-semibold text-indigo-400">Banner Prompt (Midjourney)</span>
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
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                            <i class="fa-solid fa-align-left text-purple-400"></i> Full AI Cloned Script
                        </span>
                        <button onclick="copyFullScript()" class="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5">
                            <i class="fa-regular fa-copy"></i> Copy Full Script
                        </button>
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
                        <button onclick="copyToClipboard(document.getElementById('res-seo-desc').innerText)" class="px-2.5 py-1 text-xs bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white rounded-md transition-colors">
                            <i class="fa-regular fa-copy"></i> Copy
                        </button>
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
                            <button onclick="copyEncoded('${encodedImg}')" class="px-2 py-0.5 bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white rounded text-[10px] flex-shrink-0">
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
