// Quran Explorer v3.5 - Application Controller (Offline-First)
(function () {
    'use strict';

    // Purge any legacy ServiceWorker or CacheStorage from earlier builds
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
            for (const reg of regs) reg.unregister();
        }).catch(() => {});
    }
    if ('caches' in window) {
        caches.keys().then((names) => {
            for (const name of names) caches.delete(name);
        }).catch(() => {});
    }

    const BUILTIN_TAFSIRS = [
        { slug: 'ibn-kathir', name: 'Tafsir Ibn Kathir (Concise Built-in)', author: 'Al-Hafiz Ibn Kathir', language: 'English', dir: 'ltr', builtIn: true },
        { slug: 'jalalayn', name: 'Tafsir Al-Jalalayn (Concise Built-in)', author: 'Al-Mahalli & As-Suyuti', language: 'English', dir: 'ltr', builtIn: true },
        { slug: 'saadi', name: 'Tafsir As-Saadi (Concise Built-in)', author: 'Shaykh Abdur-Rahman as-Saadi', language: 'English', dir: 'ltr', builtIn: true }
    ];

    function getDefaultPrayerConfig() {
        return {
            configured: false,
            mode: 'unconfigured',
            countryCode: 'BD',
            countryName: 'Bangladesh',
            cityId: 'dhaka',
            cityName: 'Dhaka',
            methodId: 'bangladesh_ifb',
            asrSchool: 'hanafi',
            lat: 23.8103,
            lon: 90.4125,
            tz: 6.0,
            locationLabel: 'Dhaka, Bangladesh'
        };
    }

    function loadPrayerConfig() {
        const def = getDefaultPrayerConfig();
        try {
            const raw = localStorage.getItem('quran_prayer_config');
            if (!raw) return def;
            const parsed = JSON.parse(raw);
            return { ...def, ...parsed };
        } catch (_) {
            return def;
        }
    }

    // ========== STATE ==========
    const appState = {
        currentSurah: 1,
        currentVerse: 1,
        isPlaying: false,
        repeatVerse: localStorage.getItem('quran_repeat_verse') === 'true',
        autoPlayNext: localStorage.getItem('quran_autoplay_next') !== 'false',
        currentScript: localStorage.getItem('quran_script') || 'uthmani',
        arabicFontSize: parseInt(localStorage.getItem('quran_arabic_font_size') || '25', 10) || 25,
        transFontSize: parseInt(localStorage.getItem('quran_trans_font_size') || '15', 10) || 15,
        tajweedEnabled: localStorage.getItem('quran_tajweed') !== 'false',
        tajweedMode: localStorage.getItem('quran_tajweed_mode') || 'basic',
        alwaysEnglish: localStorage.getItem('quran_always_english') !== 'false',
        selectedTranslation: localStorage.getItem('quran_translation') || '161',
        tafsirSource: localStorage.getItem('quran_tafsir_source') || 'ibn-kathir',
        theme: localStorage.getItem('quran_theme') || 'dark',
        currentReciter: localStorage.getItem('quran_reciter') || 'ar.alafasy',
        playbackRate: parseFloat(localStorage.getItem('quran_playback_rate') || '1.0') || 1.0,
        wbwScale: parseFloat(localStorage.getItem('quran_wbw_scale') || '1.0') || 1.0,
        tafsirScale: parseFloat(localStorage.getItem('quran_tafsir_scale') || '1.0') || 1.0,
        dlFilter: 'all',
        dlTab: 'audio',
        tafsirDlFilter: 'all',
        tafsirDlSearch: '',
        navTab: 'juz', // 'juz' | 'hizb' | 'pages'
        searchScope: 'all', // 'all' | 'surahs' | 'ayahs' | 'none'
        searchRevelation: 'all', // 'all' | 'meccan' | 'medinan'
        lastSearchQuery: '',
        pendingPromptVerse: null,
        audioPromptOpen: false,
        bookmarks: JSON.parse(localStorage.getItem('quran_bookmarks') || '[]'),
        readingLog: JSON.parse(localStorage.getItem('quran_reading_log') || '{}'),
        prayerLog: JSON.parse(localStorage.getItem('quran_prayer_log') || '{}'),
        activityDates: JSON.parse(localStorage.getItem('quran_activity_dates') || '[]'),
        readingComfort: localStorage.getItem('quran_reading_comfort') === 'true',
        prayerConfig: loadPrayerConfig(),
        prayerMiniSettingsOpen: null,
        livePrayerTimings: null,
        gpsDetecting: false,
        sectionHistory: ['home'],
        currentSection: 'home',
        confirmOpen: false,
        confirmResolver: null
    };

    let dom = {};
    let toastTimeout = null;
    let prayerCountdownTimer = null;
    let wbwSequenceActive = false;
    let lastMenuAction = { type: null, time: 0, gesture: null };
    let keyboardBlurTimer = null;

    function cacheDom() {
        const ids = [
            'appSplashOverlay', 'menuToggle', 'sectionBackBtn', 'sidebar', 'sidebarCloseBtn',
            'overlay', 'themeToggle', 'themeIcon', 'topSearchInput', 'topSearchBtn',
            'topDownloadsBtn', 'quickSettingsBtn', 'quickSettingsDropdown', 'quickSettingsBackdrop',
            'quickSettingsCloseBtn', 'quickReciterSelect', 'quickReciterShortcutBox',
            'quickDownloadShortcutBtn', 'quickDownloadShortcutText', 'quickScriptSelect',
            'quickTranslationSelect', 'quickTajweedToggle', 'quickAlwaysEnglishToggle',
            'quickComfortToggle', 'quickAllSettingsBtn', 'quickReleasesBtn', 'quickSurahSelect', 'readSurahSelect',
            'readSurahSub', 'readSurahLocSummary', 'readPlayFullSurahBtn', 'readDownloadSurahBtn',
            'readDownloadBtnText', 'readComfortBtn', 'readComfortBtnText', 'readTajweedBtn',
            'readTajweedBtnText', 'section-read', 'backToSurahListBtn', 'startReadingBtn',
            'readingSurahTitle', 'versesContainer', 'surahList', 'surahFilterInput',
            'juzList', 'hizbList', 'pageJumpPanel', 'pageJumpInput', 'pageJumpGoBtn',
            'pageShortcutsGrid', 'searchInput', 'searchBtn', 'searchClearBtn',
            'searchResetFiltersBtn', 'searchResults', 'bookmarksList', 'clearBookmarksBtn',
            'playPauseBtn', 'playIcon', 'prevVerseBtn', 'nextVerseBtn', 'repeatBtn',
            'barDownloadBtn', 'audioProgress', 'audioProgressFill',
            'audioCurrentTime', 'audioDuration', 'audioTitle', 'audioSubtitle', 'goTopBtn',
            'qatarPrayersTable', 'qatarDateLabel', 'qatarNextPrayerBanner', 'prayerTable',
            'prayerMiniSettingsToggleBtn', 'prayerMiniSettingsPanel', 'prayerMiniSettingsCloseBtn',
            'prayerMiniSettingsDoneBtn', 'prayerMiniEyebrow', 'prayerCompactBar',
            'prayerLocationTitle', 'prayerStatusBadge', 'prayerMethodSummary',
            'prayerDetectGpsBtn', 'prayerVerifyOnlineBtn', 'prayerCountrySelect', 'prayerCitySelect',
            'prayerMethodSelect', 'prayerAsrStandardBtn', 'prayerAsrHanafiBtn',
            'wbwSurahSelect', 'wbwVerseSelect', 'wbwPrevVerseBtn', 'wbwNextVerseBtn',
            'wbwContainer', 'wbwScaleDownBtn', 'wbwScaleLabel', 'wbwScaleUpBtn',
            'tafsirSurahSelect', 'tafsirVerseSelect', 'tafsirContainer', 'tafsirEditionSelect',
            'tafsirScaleDownBtn', 'tafsirScaleLabel', 'tafsirScaleUpBtn', 'tafsirOpenDownloadsBtn',
            'audioPromptModal', 'promptSurahTitle',
            'promptSurahSub', 'promptReciterSelect', 'promptOfflineStatusBadge',
            'promptPlayOnlineBtn', 'promptDownloadAndPlayBtn', 'promptDownloadBtnText',
            'promptDlProgressBar', 'promptDlProgressFill', 'promptDlStatusText',
            'promptRememberChoice', 'promptCloseBtn', 'appConfirmModal', 'appConfirmTitle',
            'appConfirmMessage', 'appConfirmOkBtn', 'appConfirmCancelBtn', 'appConfirmCloseBtn',
            'storageUsageBadge', 'clearAllDownloadsBtn', 'downloadJuz30Btn', 'juz30ProgressBar',
            'juz30ProgressFill', 'juz30ProgressText', 'downloadAllBtn', 'cancelDownloadAllBtn',
            'downloadAllReciterSelect', 'downloadAllStatusBadge', 'clearFullQuranBtn',
            'downloadAllProgressBox', 'downloadAllProgressFill', 'downloadAllProgressText',
            'downloadAllProgressStats', 'recitersGridContainer', 'surahDlListContainer',
            'dlSurahSearchInput', 'translationsDlContainer', 'tafsirDlContainer',
            'tafsirRefreshCatalogBtn', 'tafsirFilterAllBtn', 'tafsirFilterInstalledBtn', 'tafsirDlSearchInput',
            'continueReadingCard', 'continueReadingBtn', 'continueSub',
            'settingsResetDefaultsBtn', 'settingsPreviewArabic', 'settingsPreviewTrans',
            'settingsThemeDarkBtn', 'settingsThemeLightBtn', 'settingsComfortToggle',
            'settingsScriptSelect', 'settingsArabicSizeValue', 'settingsArabicSizeDownBtn',
            'settingsArabicSizeRange', 'settingsArabicSizeUpBtn', 'settingsTransSizeValue',
            'settingsTransSizeDownBtn', 'settingsTransSizeRange', 'settingsTransSizeUpBtn',
            'settingsWbwScaleDownBtn', 'settingsWbwScaleValue', 'settingsWbwScaleUpBtn',
            'settingsTafsirScaleDownBtn', 'settingsTafsirScaleValue', 'settingsTafsirScaleUpBtn',
            'settingsTajweedOffBtn', 'settingsTajweedBasicBtn', 'settingsTajweedAdvBtn',
            'settingsAlwaysEnglishToggle', 'settingsTranslationSelect', 'settingsDefaultTafsirSelect',
            'settingsReciterSelect', 'settingsAutoPlayToggle', 'settingsRepeatVerseToggle',
            'settingsPrayerSummary', 'settingsOpenPrayerConfigBtn'
        ];
        dom = {};
        ids.forEach((id) => {
            dom[id] = document.getElementById(id);
        });
        dom.sectionRead = document.getElementById('section-read');
    }

    // ========== HELPERS ==========
    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function highlightMatch(text, query) {
        const safeText = escapeHtml(text);
        const q = String(query || '').trim();
        if (!q || q.length < 2) return safeText;
        const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
            return safeText.replace(new RegExp(`(${escapedQ})`, 'ig'), '<mark class="search-hl">$1</mark>');
        } catch (_) {
            return safeText;
        }
    }

    function showToast(message, type = 'info') {
        let toastEl = document.getElementById('quranAudioToast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'quranAudioToast';
            toastEl.className = 'quran-audio-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        toastEl.className = `quran-audio-toast ${type} visible`;
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('visible');
        }, 3200);
    }

    function resolveAppConfirm(accepted) {
        const resolver = appState.confirmResolver;
        appState.confirmResolver = null;
        appState.confirmOpen = false;
        if (dom.appConfirmModal) {
            dom.appConfirmModal.classList.remove('show');
            dom.appConfirmModal.setAttribute('aria-hidden', 'true');
        }
        if (typeof resolver === 'function') {
            resolver(!!accepted);
        }
    }

    function showAppConfirm({ title = 'Confirm Action', message = '', confirmText = 'Confirm', dangerous = false }) {
        if (appState.confirmOpen && typeof appState.confirmResolver === 'function') {
            resolveAppConfirm(false);
        }
        return new Promise((resolve) => {
            if (!dom.appConfirmModal) {
                resolve(true);
                return;
            }
            appState.confirmResolver = resolve;
            appState.confirmOpen = true;
            if (dom.appConfirmTitle) dom.appConfirmTitle.textContent = title;
            if (dom.appConfirmMessage) dom.appConfirmMessage.textContent = message;
            if (dom.appConfirmOkBtn) {
                dom.appConfirmOkBtn.textContent = confirmText;
                dom.appConfirmOkBtn.classList.toggle('btn-danger', !!dangerous);
                dom.appConfirmOkBtn.classList.toggle('btn-primary', !dangerous);
            }
            dom.appConfirmModal.classList.add('show');
            dom.appConfirmModal.setAttribute('aria-hidden', 'false');
        });
    }

    function copyTextSafe(text, successMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMsg, 'success');
            }).catch(() => fallbackCopy(text, successMsg));
        } else {
            fallbackCopy(text, successMsg);
        }
    }

    function fallbackCopy(text, successMsg) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(successMsg, 'success');
        } catch (_) {
            showToast('Unable to copy to clipboard', 'error');
        }
        document.body.removeChild(ta);
    }

    function recordTodayActivity() {
        const today = new Date().toISOString().slice(0, 10);
        if (!appState.activityDates.includes(today)) {
            appState.activityDates.push(today);
            if (appState.activityDates.length > 365) {
                appState.activityDates = appState.activityDates.slice(-365);
            }
            localStorage.setItem('quran_activity_dates', JSON.stringify(appState.activityDates));
        }
    }

    function computeStreak() {
        const dates = new Set(appState.activityDates || []);
        Object.keys(appState.prayerLog || {}).forEach((d) => {
            const log = appState.prayerLog[d];
            if (log && Object.values(log).some(Boolean)) dates.add(d);
        });
        if (!dates.size && Object.keys(appState.readingLog || {}).length > 0) {
            return 1;
        }
        if (!dates.size) return 0;

        let streak = 0;
        const cursor = new Date();
        const todayKey = cursor.toISOString().slice(0, 10);
        if (!dates.has(todayKey)) {
            cursor.setDate(cursor.getDate() - 1);
        }
        for (let i = 0; i < 365; i++) {
            const key = cursor.toISOString().slice(0, 10);
            if (dates.has(key)) {
                streak++;
                cursor.setDate(cursor.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    // ========== SIDEBAR MENU CONTROLLER ==========
    function menuGestureId(e) {
        try {
            if (e && typeof e.pointerId === 'number') return 'p' + e.pointerId;
        } catch (_) {}
        return null;
    }

    window.openMenu = function (e) {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        const now = Date.now();
        const gid = menuGestureId(e);
        if (lastMenuAction.type === 'open' && now - lastMenuAction.time < 420 && gid !== null && lastMenuAction.gesture === gid) {
            return;
        }
        lastMenuAction = { type: 'open', time: now, gesture: gid };
        window.closeQuickSettings();
        if (dom.sidebar) dom.sidebar.classList.add('open');
        if (dom.overlay) dom.overlay.classList.add('show');
        document.body.classList.add('sidebar-open');
    };

    window.closeMenu = function (e) {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        const now = Date.now();
        const gid = menuGestureId(e);
        if (lastMenuAction.type === 'close' && now - lastMenuAction.time < 420 && gid !== null && lastMenuAction.gesture === gid) {
            return;
        }
        lastMenuAction = { type: 'close', time: now, gesture: gid };
        if (dom.sidebar) dom.sidebar.classList.remove('open');
        if (dom.overlay) dom.overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    };

    window.toggleMenu = function (e) {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        if (dom.sidebar && dom.sidebar.classList.contains('open')) {
            window.closeMenu(e);
        } else {
            window.openMenu(e);
        }
    };

    // ========== QUICK SETTINGS LAYER ==========
    function syncQuickSettingsBounds() {
        if (!dom.quickSettingsDropdown) return;
        const headerEl = document.querySelector('.top-bar');
        const headerHeight = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 56;
        const viewportH = window.innerHeight || document.documentElement.clientHeight || 640;
        const availH = Math.max(220, viewportH - headerHeight - 24);
        dom.quickSettingsDropdown.style.top = `${headerHeight + 8}px`;
        dom.quickSettingsDropdown.style.maxHeight = `${availH}px`;
    }

    window.openQuickSettings = function () {
        window.closeMenu();
        syncQuickSettingsBounds();
        if (dom.quickSettingsDropdown) {
            dom.quickSettingsDropdown.classList.add('show');
            dom.quickSettingsDropdown.scrollTop = 0;
        }
        if (dom.quickSettingsBackdrop) dom.quickSettingsBackdrop.classList.add('show');
        if (dom.quickSettingsBtn) dom.quickSettingsBtn.classList.add('active');
    };

    window.closeQuickSettings = function () {
        if (dom.quickSettingsDropdown) dom.quickSettingsDropdown.classList.remove('show');
        if (dom.quickSettingsBackdrop) dom.quickSettingsBackdrop.classList.remove('show');
        if (dom.quickSettingsBtn) dom.quickSettingsBtn.classList.remove('active');
    };

    window.toggleQuickSettings = function (e) {
        if (e) e.stopPropagation();
        if (dom.quickSettingsDropdown && dom.quickSettingsDropdown.classList.contains('show')) {
            window.closeQuickSettings();
        } else {
            window.openQuickSettings();
        }
    };

    // ========== THEME, TAJWEED, COMFORT & SCALING ==========
    function syncSystemAppearance() {
        const mode = appState.readingComfort
            ? (appState.theme === 'light' ? 'sepia-light' : 'sepia-dark')
            : (appState.theme === 'light' ? 'light' : 'dark');
        const themeColors = {
            dark: '#070C10',
            light: '#F3EFE6',
            'sepia-dark': '#15120F',
            'sepia-light': '#EFE4CA'
        };
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', themeColors[mode] || '#070C10');
        }
        try {
            if (window.AndroidThemeBridge && typeof window.AndroidThemeBridge.setSystemTheme === 'function') {
                window.AndroidThemeBridge.setSystemTheme(mode);
            }
        } catch (_) {}
    }

    function applyTheme(theme) {
        appState.theme = theme === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', appState.theme);
        document.body.setAttribute('data-theme', appState.theme);
        localStorage.setItem('quran_theme', appState.theme);
        if (dom.themeIcon) {
            dom.themeIcon.innerHTML = `<use href="#icon-${appState.theme === 'dark' ? 'sun' : 'moon'}"/>`;
        }
        syncSystemAppearance();
        syncSettingsUI();
    }

    function applyReadingComfort(enabled) {
        appState.readingComfort = !!enabled;
        localStorage.setItem('quran_reading_comfort', appState.readingComfort ? 'true' : 'false');
        document.documentElement.classList.toggle('reading-comfort', appState.readingComfort);
        document.body.classList.toggle('reading-comfort', appState.readingComfort);
        if (dom.sectionRead) {
            dom.sectionRead.classList.toggle('reading-comfort', appState.readingComfort);
        }
        if (dom.quickComfortToggle) {
            dom.quickComfortToggle.classList.toggle('active', appState.readingComfort);
        }
        if (dom.readComfortBtn) {
            dom.readComfortBtn.classList.toggle('btn-primary', appState.readingComfort);
            dom.readComfortBtn.classList.toggle('btn-secondary', !appState.readingComfort);
            if (dom.readComfortBtnText) {
                dom.readComfortBtnText.textContent = appState.readingComfort ? 'Comfort: On' : 'Comfort';
            }
        }
        syncSystemAppearance();
        syncSettingsUI();
    }

    function applyArabicFontSize(px) {
        const clamped = Math.max(20, Math.min(42, Math.round(Number(px) || 25)));
        appState.arabicFontSize = clamped;
        localStorage.setItem('quran_arabic_font_size', String(clamped));
        document.documentElement.style.setProperty('--arabic-font-size', `${clamped}px`);
        if (dom.settingsArabicSizeRange) dom.settingsArabicSizeRange.value = String(clamped);
        if (dom.settingsArabicSizeValue) dom.settingsArabicSizeValue.textContent = `${clamped} px`;
        updateSettingsPreview();
    }

    function applyTransFontSize(px) {
        const clamped = Math.max(12, Math.min(22, Math.round(Number(px) || 15)));
        appState.transFontSize = clamped;
        localStorage.setItem('quran_trans_font_size', String(clamped));
        document.documentElement.style.setProperty('--trans-font-size', `${clamped}px`);
        if (dom.settingsTransSizeRange) dom.settingsTransSizeRange.value = String(clamped);
        if (dom.settingsTransSizeValue) dom.settingsTransSizeValue.textContent = `${clamped} px`;
        updateSettingsPreview();
    }

    function applyWbwScale(scale) {
        const clamped = Math.max(0.85, Math.min(1.45, Math.round((Number(scale) || 1.0) * 100) / 100));
        appState.wbwScale = clamped;
        localStorage.setItem('quran_wbw_scale', String(clamped));
        document.documentElement.style.setProperty('--wbw-scale', String(clamped));
        const pctText = `${Math.round(clamped * 100)}%`;
        if (dom.wbwScaleLabel) dom.wbwScaleLabel.textContent = pctText;
        if (dom.settingsWbwScaleValue) dom.settingsWbwScaleValue.textContent = pctText;
    }

    function applyTafsirScale(scale) {
        const clamped = Math.max(0.85, Math.min(1.5, Math.round((Number(scale) || 1.0) * 100) / 100));
        appState.tafsirScale = clamped;
        localStorage.setItem('quran_tafsir_scale', String(clamped));
        document.documentElement.style.setProperty('--tafsir-scale', String(clamped));
        const pctText = `${Math.round(clamped * 100)}%`;
        if (dom.tafsirScaleLabel) dom.tafsirScaleLabel.textContent = pctText;
        if (dom.settingsTafsirScaleValue) dom.settingsTafsirScaleValue.textContent = pctText;
    }

    function applyAutoPlayNext(enabled) {
        appState.autoPlayNext = !!enabled;
        localStorage.setItem('quran_autoplay_next', appState.autoPlayNext ? 'true' : 'false');
        if (dom.settingsAutoPlayToggle) dom.settingsAutoPlayToggle.classList.toggle('active', appState.autoPlayNext);
    }

    function applyRepeatVerse(enabled) {
        appState.repeatVerse = !!enabled;
        localStorage.setItem('quran_repeat_verse', appState.repeatVerse ? 'true' : 'false');
        if (dom.repeatBtn) dom.repeatBtn.classList.toggle('repeat-active', appState.repeatVerse);
        if (dom.settingsRepeatVerseToggle) dom.settingsRepeatVerseToggle.classList.toggle('active', appState.repeatVerse);
    }

    function normalizeScriptName(scriptName) {
        return (scriptName === 'indopak' || scriptName === 'imlaei' || scriptName === 'uthmani')
            ? scriptName
            : 'uthmani';
    }

    function applyScript(scriptName) {
        const normalized = normalizeScriptName(scriptName);
        appState.currentScript = normalized;
        localStorage.setItem('quran_script', normalized);
        document.documentElement.setAttribute('data-script', normalized);
        document.body.setAttribute('data-script', normalized);
        if (dom.quickScriptSelect) dom.quickScriptSelect.value = normalized;
        if (dom.settingsScriptSelect) dom.settingsScriptSelect.value = normalized;
        updateSettingsPreview();
    }

    function getActiveTajweedClass() {
        return appState.tajweedEnabled
            ? (appState.tajweedMode === 'advanced' ? 'tajweed-enabled tajweed-advanced' : 'tajweed-enabled')
            : '';
    }

    function getVerseScriptPlainText(v, scriptOverride) {
        if (!v) return '';
        const script = normalizeScriptName(scriptOverride || appState.currentScript);
        if (script === 'indopak') return v.text_indopak || v.text_uthmani || v.text_imlaei || '';
        if (script === 'imlaei') return v.text_imlaei || v.text_uthmani || v.text_indopak || '';
        return v.text_uthmani || v.text_indopak || v.text_imlaei || '';
    }

    function sanitizeTajweedHtml(rawHtml) {
        const str = String(rawHtml || '');
        if (!str) return '';
        const tagRegex = /<\/?(?:tajweed|span)\b[^>]*>/gi;
        let out = '';
        let lastIdx = 0;
        let match;
        const openStack = [];

        while ((match = tagRegex.exec(str)) !== null) {
            if (match.index > lastIdx) {
                out += escapeHtml(str.slice(lastIdx, match.index));
            }
            const tag = match[0];
            if (/^<\/tajweed/i.test(tag)) {
                if (openStack.length && openStack[openStack.length - 1] === 'tajweed') {
                    openStack.pop();
                    out += '</tajweed>';
                }
            } else if (/^<\/span/i.test(tag)) {
                if (openStack.length && openStack[openStack.length - 1] === 'span') {
                    openStack.pop();
                    out += '</span>';
                }
            } else if (/^<tajweed\b/i.test(tag)) {
                const clsMatch = /\bclass\s*=\s*(?:"([a-z0-9_ -]+)"|'([a-z0-9_ -]+)'|([a-z0-9_-]+))/i.exec(tag);
                const cls = (clsMatch && (clsMatch[1] || clsMatch[2] || clsMatch[3])) || '';
                const safeCls = cls.replace(/[^a-z0-9_ -]/gi, '').trim();
                if (safeCls) {
                    openStack.push('tajweed');
                    out += `<tajweed class="${safeCls}">`;
                }
            } else if (/^<span\b/i.test(tag)) {
                const clsMatch = /\bclass\s*=\s*(?:"([a-z0-9_ -]+)"|'([a-z0-9_ -]+)'|([a-z0-9_-]+))/i.exec(tag);
                const cls = (clsMatch && (clsMatch[1] || clsMatch[2] || clsMatch[3])) || '';
                if (/\bend\b/i.test(cls)) {
                    openStack.push('span');
                    out += '<span class="end">';
                }
            }
            lastIdx = tagRegex.lastIndex;
        }
        if (lastIdx < str.length) {
            out += escapeHtml(str.slice(lastIdx));
        }
        while (openStack.length) {
            const t = openStack.pop();
            out += `</${t}>`;
        }
        return out;
    }

    function normalizeFontMarksForScript(text, scriptOverride) {
        const str = String(text || '');
        if (!str) return '';
        const script = normalizeScriptName(scriptOverride || appState.currentScript);
        if (script === 'uthmani' || script === 'indopak') {
            // KFGQPC Uthmanic Hafs v0.18 maps U+06DF (Sifr Mistadir) to a dotted-circle composite glyph,
            // and IndoPak Nastaleeq leaves U+06DF empty; U+0652 is the true anchored combining ring in both.
            return str.replace(/\u06DF/g, '\u0652');
        }
        return str;
    }

    function applyClientTajweedHtml(plainArabic, skipHighlighting = false, scriptOverride = null) {
        const text = String(plainArabic || '');
        if (!text) return '';
        const script = normalizeScriptName(scriptOverride || appState.currentScript);

        const isArabicMark = (ch) => {
            const c = ch.charCodeAt(0);
            return (c >= 0x0610 && c <= 0x061A) ||
                (c >= 0x064B && c <= 0x065F) ||
                c === 0x0670 ||
                (c >= 0x06D6 && c <= 0x06ED) ||
                (c >= 0x08D3 && c <= 0x08FF);
        };
        const isArabicBase = (ch) => {
            const c = ch.charCodeAt(0);
            return (c >= 0x0620 && c <= 0x064A) || (c >= 0x066E && c <= 0x06D5 && c !== 0x0670);
        };

        // Tokenize into base-letter + diacritics clusters so cursive Arabic shaping stays intact
        const clusters = [];
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (isArabicMark(ch) && clusters.length > 0 && clusters[clusters.length - 1].isLetter) {
                clusters[clusters.length - 1].text += ch;
            } else {
                clusters.push({
                    text: ch,
                    base: ch,
                    isLetter: isArabicBase(ch)
                });
            }
        }

        const nextLetterIndex = (fromIdx) => {
            for (let j = fromIdx + 1; j < clusters.length; j++) {
                if (clusters[j].isLetter) return j;
                if (clusters[j].text === '﴿' || clusters[j].text === '(') return -1;
            }
            return -1;
        };

        const qalqalahLetters = 'قطبجد';
        const ikhfaLetters = 'تثجدذزسشصضطظفقك';
        const shamsiLetters = 'تثدذرزسشصضطظلن';
        const sukunRe = /[\u0652\u06E1]/;
        const shaddahRe = /\u0651/;
        const tanweenRe = /[\u064B\u064C\u064D]/;
        const harakahRe = /[\u064B-\u065F\u0670\u06E1]/;
        const maddStrongRe = /[\u0653\u06E4]/;
        const maddPermRe = /[\u0670]/;

        let out = '';
        for (let i = 0; i < clusters.length; i++) {
            const cur = clusters[i];
            const renderedCluster = normalizeFontMarksForScript(cur.text, script);
            const escaped = escapeHtml(renderedCluster);
            if (!cur.isLetter || skipHighlighting) {
                out += escaped;
                continue;
            }

            let ruleClass = '';
            const nIdx = nextLetterIndex(i);
            const nextBase = nIdx >= 0 ? clusters[nIdx].base : '';
            const nextText = nIdx >= 0 ? clusters[nIdx].text : '';

            if (cur.base === 'ٱ') {
                ruleClass = 'ham_wasl';
            } else if ((cur.base === 'ن' || cur.base === 'م') && shaddahRe.test(cur.text)) {
                ruleClass = 'ghunnah';
            } else if (cur.base === 'ل' && !harakahRe.test(cur.text) && nIdx >= 0 && shamsiLetters.includes(nextBase) && shaddahRe.test(nextText)) {
                ruleClass = 'laam_shamsiyah';
            } else if ((cur.base === 'ن' && sukunRe.test(cur.text)) || tanweenRe.test(cur.text)) {
                if (nextBase === 'ب') {
                    ruleClass = 'iqlab';
                } else if ('ينمو'.includes(nextBase)) {
                    ruleClass = 'idgham_ghunnah';
                } else if ('لر'.includes(nextBase)) {
                    ruleClass = 'idgham_wo_ghunnah';
                } else if (nextBase && ikhfaLetters.includes(nextBase)) {
                    ruleClass = 'ikhfa';
                }
            } else if (cur.base === 'م' && sukunRe.test(cur.text)) {
                if (nextBase === 'ب') {
                    ruleClass = 'ikhfa_shafawi';
                } else if (nextBase === 'م') {
                    ruleClass = 'idgham_shafawi';
                }
            } else if (qalqalahLetters.includes(cur.base) && sukunRe.test(cur.text)) {
                ruleClass = 'qalqalah';
            } else if (cur.base === 'آ' || maddStrongRe.test(cur.text)) {
                ruleClass = 'madda_obligatory';
            } else if (maddPermRe.test(cur.text)) {
                ruleClass = 'madda_normal';
            }

            out += ruleClass ? `<tajweed class="${ruleClass}">${escaped}</tajweed>` : escaped;
        }
        return out;
    }

    function ensureVerseEndingNumber(renderedHtml, verseNum, script) {
        const html = String(renderedHtml || '').trim();
        const vNum = Number(verseNum);
        if (!html || !vNum) return html;
        if (/(?:<span\s+class="end">[^<]*<\/span>|﴿[^﴾]+﴾|\(\d+\)|\u06DD[\d\u0660-\u0669]*)\s*$/i.test(html)) {
            return html;
        }
        if (script === 'imlaei') {
            return `${html} <span class="end">(${vNum})</span>`;
        }
        return `${html} <span class="end">﴿${vNum}﴾</span>`;
    }

    function renderVerseArabicHtml(v, scriptOverride) {
        if (!v) return '';
        const script = normalizeScriptName(scriptOverride || appState.currentScript);
        const plain = getVerseScriptPlainText(v, script);
        let rendered = '';
        if (script === 'uthmani' && v.text_uthmani_tajweed && /<tajweed\b[^>]*class=/i.test(v.text_uthmani_tajweed) && appState.tajweedEnabled) {
            rendered = normalizeFontMarksForScript(sanitizeTajweedHtml(v.text_uthmani_tajweed), script);
        } else {
            rendered = applyClientTajweedHtml(plain, !appState.tajweedEnabled, script);
        }
        return ensureVerseEndingNumber(rendered, v.verse_number, script);
    }

    function getBismillahHtml() {
        const script = normalizeScriptName(appState.currentScript);
        const text = script === 'indopak'
            ? 'بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ'
            : script === 'imlaei'
                ? 'بسم الله الرحمن الرحيم'
                : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
        return applyClientTajweedHtml(text, !appState.tajweedEnabled, script);
    }

    function syncTajweedControls() {
        localStorage.setItem('quran_tajweed', appState.tajweedEnabled ? 'true' : 'false');
        localStorage.setItem('quran_tajweed_mode', appState.tajweedMode);
        if (dom.quickTajweedToggle) dom.quickTajweedToggle.classList.toggle('active', appState.tajweedEnabled);
        if (dom.readTajweedBtn) {
            dom.readTajweedBtn.classList.toggle('btn-primary', appState.tajweedEnabled);
            dom.readTajweedBtn.classList.toggle('btn-secondary', !appState.tajweedEnabled);
            if (dom.readTajweedBtnText) {
                dom.readTajweedBtnText.textContent = appState.tajweedEnabled ? 'Tajweed: On' : 'Tajweed';
            }
        }
        const basicBtn = document.getElementById('quickTajweedBasicBtn');
        const advBtn = document.getElementById('quickTajweedAdvancedBtn');
        if (basicBtn) basicBtn.classList.toggle('active', appState.tajweedMode !== 'advanced');
        if (advBtn) advBtn.classList.toggle('active', appState.tajweedMode === 'advanced');
        syncSettingsUI();
    }

    function applyPlaybackRate(rate) {
        const numericRate = Number(rate) || 1.0;
        appState.playbackRate = numericRate;
        localStorage.setItem('quran_playback_rate', String(numericRate));
        if (window.UnifiedAudioEngine && window.UnifiedAudioEngine.setPlaybackRate) {
            window.UnifiedAudioEngine.setPlaybackRate(numericRate);
        }
        document.querySelectorAll('.quick-speed-btn, .settings-speed-btn').forEach((btn) => {
            btn.classList.toggle('active', Number(btn.dataset.speed) === numericRate);
        });
    }

    function updateSettingsPreview() {
        const sample = window.OfflineQuranDB?.getVerseByKey('1:1');
        if (dom.settingsPreviewArabic && sample) {
            const tajweedCls = getActiveTajweedClass();
            dom.settingsPreviewArabic.className = 'arabic-text' + (tajweedCls ? ` ${tajweedCls}` : '');
            dom.settingsPreviewArabic.innerHTML = renderVerseArabicHtml(sample);
        }
        if (dom.settingsPreviewTrans && sample) {
            let previewText = sample.english || 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';
            if (!appState.alwaysEnglish) {
                if (appState.selectedTranslation === '161' && sample.bengali) previewText = sample.bengali;
                else if (appState.selectedTranslation === '97' && sample.urdu) previewText = sample.urdu;
                else if (appState.selectedTranslation === '234' && sample.french) previewText = sample.french;
            }
            dom.settingsPreviewTrans.textContent = previewText;
        }
    }

    function syncSettingsUI() {
        if (dom.settingsThemeDarkBtn) dom.settingsThemeDarkBtn.classList.toggle('active', appState.theme !== 'light');
        if (dom.settingsThemeLightBtn) dom.settingsThemeLightBtn.classList.toggle('active', appState.theme === 'light');
        if (dom.settingsComfortToggle) dom.settingsComfortToggle.classList.toggle('active', !!appState.readingComfort);
        if (dom.settingsScriptSelect) dom.settingsScriptSelect.value = normalizeScriptName(appState.currentScript);
        if (dom.settingsTranslationSelect) dom.settingsTranslationSelect.value = appState.selectedTranslation;
        if (dom.settingsAlwaysEnglishToggle) dom.settingsAlwaysEnglishToggle.classList.toggle('active', !!appState.alwaysEnglish);
        if (dom.settingsAutoPlayToggle) dom.settingsAutoPlayToggle.classList.toggle('active', !!appState.autoPlayNext);
        if (dom.settingsRepeatVerseToggle) dom.settingsRepeatVerseToggle.classList.toggle('active', !!appState.repeatVerse);

        if (dom.settingsArabicSizeRange) dom.settingsArabicSizeRange.value = String(appState.arabicFontSize);
        if (dom.settingsArabicSizeValue) dom.settingsArabicSizeValue.textContent = `${appState.arabicFontSize} px`;
        if (dom.settingsTransSizeRange) dom.settingsTransSizeRange.value = String(appState.transFontSize);
        if (dom.settingsTransSizeValue) dom.settingsTransSizeValue.textContent = `${appState.transFontSize} px`;
        if (dom.settingsWbwScaleValue) dom.settingsWbwScaleValue.textContent = `${Math.round(appState.wbwScale * 100)}%`;
        if (dom.settingsTafsirScaleValue) dom.settingsTafsirScaleValue.textContent = `${Math.round(appState.tafsirScale * 100)}%`;

        if (dom.settingsTajweedOffBtn) dom.settingsTajweedOffBtn.classList.toggle('active', !appState.tajweedEnabled);
        if (dom.settingsTajweedBasicBtn) dom.settingsTajweedBasicBtn.classList.toggle('active', appState.tajweedEnabled && appState.tajweedMode !== 'advanced');
        if (dom.settingsTajweedAdvBtn) dom.settingsTajweedAdvBtn.classList.toggle('active', appState.tajweedEnabled && appState.tajweedMode === 'advanced');

        if (dom.settingsReciterSelect) dom.settingsReciterSelect.value = appState.currentReciter;
        if (dom.settingsDefaultTafsirSelect) dom.settingsDefaultTafsirSelect.value = appState.tafsirSource || 'ibn-kathir';
        document.querySelectorAll('.settings-speed-btn').forEach((btn) => {
            btn.classList.toggle('active', Number(btn.dataset.speed) === Number(appState.playbackRate));
        });

        if (dom.settingsPrayerSummary && window.OfflinePrayerTimes) {
            const cfg = appState.prayerConfig || getDefaultPrayerConfig();
            const method = window.OfflinePrayerTimes.getMethod(cfg.methodId);
            const asrLabel = cfg.asrSchool === 'hanafi' ? 'Hanafi Asr' : 'Standard Asr';
            dom.settingsPrayerSummary.textContent = cfg.configured
                ? `${cfg.locationLabel || cfg.cityName} · ${method ? method.name : cfg.methodId} · ${asrLabel}`
                : 'Not yet configured — open Prayer Times mini settings panel to detect area or choose city';
        }
        updateSettingsPreview();
    }

    // ========== NAVIGATION ==========
    window.showSection = function (sectionId, addToHistory = true) {
        if (addToHistory && appState.currentSection !== sectionId) {
            appState.sectionHistory.push(sectionId);
        }
        appState.currentSection = sectionId;

        document.querySelectorAll('.section').forEach((sec) => sec.classList.remove('active'));
        const target = document.getElementById(`section-${sectionId}`);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-item').forEach((item) => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });

        document.body.classList.toggle('in-read-section', sectionId === 'read');
        window.closeMenu();
        window.closeQuickSettings();

        if (dom.sectionBackBtn) {
            dom.sectionBackBtn.disabled = appState.sectionHistory.length <= 1;
        }
        window.scrollTo(0, 0);

        if (sectionId === 'wordbyword') {
            initWordByWordView();
        } else if (sectionId === 'tafsir') {
            initTafsirView();
        } else if (sectionId === 'settings') {
            populateReciterOptions();
            populateTafsirEditionSelect();
            syncSettingsUI();
        } else if (sectionId === 'bookmarks') {
            renderBookmarks();
        } else if (sectionId === 'dashboard') {
            updateDashboard();
        } else if (sectionId === 'qatar-prayers') {
            renderQatarPrayers();
        } else if (sectionId === 'prayers') {
            renderPrayerTracker();
        } else if (sectionId === 'downloads') {
            initDownloadsUI();
        } else if (sectionId === 'home') {
            updateContinueReading();
        } else if (sectionId === 'juz') {
            switchJuzNavTab(appState.navTab || 'juz');
        }
    };

    function goBack() {
        if (appState.sectionHistory.length > 1) {
            appState.sectionHistory.pop();
            const prev = appState.sectionHistory[appState.sectionHistory.length - 1];
            window.showSection(prev, false);
        }
    }

    // ========== DROPDOWNS & LISTS ==========
    function populateSurahDropdowns() {
        const surahs = window.OfflineQuranDB.getSurahs();
        const optionsHtml = '<option value="">Select Surah...</option>' +
            surahs.map((s) => `<option value="${s.number}">${s.number}. ${escapeHtml(s.name)} (${escapeHtml(s.arabic)})</option>`).join('');

        ['quickSurahSelect', 'readSurahSelect', 'wbwSurahSelect', 'tafsirSurahSelect'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = optionsHtml;
        });
    }

    function renderSurahList(filter = '') {
        if (!dom.surahList) return;
        const q = filter.trim().toLowerCase();
        const surahs = window.OfflineQuranDB.getSurahs().filter((s) =>
            !q ||
            s.name.toLowerCase().includes(q) ||
            s.arabic.includes(filter.trim()) ||
            (s.english && s.english.toLowerCase().includes(q)) ||
            String(s.number) === q
        );

        dom.surahList.innerHTML = surahs.map((s) => {
            const sum = window.OfflineQuranDB.getSurahLocationSummary(s.number);
            const juzText = sum.juzStart === sum.juzEnd ? `Juz ${sum.juzStart}` : `Juz ${sum.juzStart}-${sum.juzEnd}`;
            return `
                <div class="surah-card" onclick="loadSurah(${s.number}, true)">
                    <div class="surah-num">${s.number}</div>
                    <div class="surah-info">
                        <div class="surah-name-row">
                            <span class="surah-name">${escapeHtml(s.name)}</span>
                            <span class="surah-arabic">${escapeHtml(s.arabic)}</span>
                        </div>
                        <div class="surah-meta">${escapeHtml(s.revelation)} · ${s.verses} Verses</div>
                        <div class="surah-loc-meta">${juzText} · Hizb ${sum.hizbStart} · Page ${sum.pageStart}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== JUZ / HIZB / PAGE NAVIGATOR ==========
    window.switchJuzNavTab = function (tab) {
        appState.navTab = tab;
        document.querySelectorAll('.juz-nav-tab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.navTab === tab);
        });
        if (dom.juzList) dom.juzList.style.display = tab === 'juz' ? 'grid' : 'none';
        if (dom.hizbList) dom.hizbList.style.display = tab === 'hizb' ? 'grid' : 'none';
        if (dom.pageJumpPanel) dom.pageJumpPanel.style.display = tab === 'pages' ? 'block' : 'none';
    };

    function renderJuzList() {
        const juzs = window.OfflineQuranDB.getJuzList();
        if (dom.juzList) {
            dom.juzList.innerHTML = juzs.map((j) => {
                const h1 = window.OfflineQuranDB.getHizbList().find((h) => h.hizb === j.hizbFirst);
                const h2 = window.OfflineQuranDB.getHizbList().find((h) => h.hizb === j.hizbSecond);
                return `
                    <div class="surah-card juz-card" onclick="loadSurah(${j.surah}, true, ${j.verse})">
                        <div class="juz-card-top">
                            <div class="surah-num">${j.juz}</div>
                            <div class="surah-info">
                                <div class="surah-name-row">
                                    <span class="surah-name">Juz ${j.juz}: ${escapeHtml(j.name)}</span>
                                    <span class="surah-arabic">${escapeHtml(j.arabic)}</span>
                                </div>
                                <div class="surah-meta">${escapeHtml(j.surahName)} ${j.surah}:${j.verse} · Page ${j.page}</div>
                            </div>
                        </div>
                        <div class="juz-hizb-bar">
                            ${h1 ? `<button type="button" class="hizb-mini-btn" onclick="event.stopPropagation(); loadSurah(${h1.surah}, true, ${h1.verse})">Hizb ${h1.hizb} (${h1.surah}:${h1.verse})</button>` : ''}
                            ${h2 ? `<button type="button" class="hizb-mini-btn" onclick="event.stopPropagation(); loadSurah(${h2.surah}, true, ${h2.verse})">Hizb ${h2.hizb} (${h2.surah}:${h2.verse})</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (dom.hizbList) {
            const hizbs = window.OfflineQuranDB.getHizbList();
            dom.hizbList.innerHTML = hizbs.map((h) => `
                <div class="surah-card" onclick="loadSurah(${h.surah}, true, ${h.verse})">
                    <div class="surah-num">H${h.hizb}</div>
                    <div class="surah-info">
                        <div class="surah-name-row">
                            <span class="surah-name">Hizb ${h.hizb}</span>
                            <span class="surah-arabic">${escapeHtml(h.surahArabic)}</span>
                        </div>
                        <div class="surah-meta">${escapeHtml(h.surahName)} ${h.surah}:${h.verse}</div>
                        <div class="surah-loc-meta">Juz ${h.juz} · ${h.halfLabel} · Page ${h.page}</div>
                    </div>
                </div>
            `).join('');
        }

        if (dom.pageShortcutsGrid) {
            const landmarks = [
                { page: 1, title: 'Al-Fatihah', sub: 'Opening · Juz 1' },
                { page: 42, title: 'Ayat al-Kursi', sub: 'Al-Baqarah 2:253 · Juz 3' },
                { page: 282, title: 'Al-Isra', sub: 'Juz 15 Start' },
                { page: 293, title: 'Al-Kahf', sub: 'Surah 18 · Friday Sunnah' },
                { page: 440, title: 'Ya-Sin', sub: 'Surah 36 · Juz 22' },
                { page: 531, title: 'Ar-Rahman', sub: 'Surah 55 · Juz 27' },
                { page: 562, title: 'Al-Mulk', sub: 'Surah 67 · Juz 29' },
                { page: 582, title: 'Juz Amma', sub: 'An-Naba · Juz 30' },
                { page: 604, title: 'Al-Mu\'awwidhat', sub: 'Final Mushaf Page' }
            ];
            dom.pageShortcutsGrid.innerHTML = landmarks.map((item) => `
                <button type="button" class="home-tile-btn" onclick="jumpToMushafPage(${item.page})">
                    <div class="home-tile-icon gold" style="font-weight:800; font-size:0.82rem;">P${item.page}</div>
                    <div>
                        <div class="home-tile-title">${item.title}</div>
                        <div class="home-tile-sub">${item.sub}</div>
                    </div>
                </button>
            `).join('');
        }
    }

    window.jumpToMushafPage = function (pageInput) {
        const page = Math.max(1, Math.min(604, Number(pageInput) || 1));
        const anchor = window.OfflineQuranDB.getPageAnchor(page);
        if (anchor) {
            showToast(`Jumping to Page ${anchor.page} (${anchor.surahName} ${anchor.surah}:${anchor.verse})`);
            window.loadSurah(anchor.surah, true, anchor.verse);
        }
    };

    // ========== LOAD SURAH & VERSES ==========
    window.loadSurah = function (surahNum, navigateToRead = true, scrollToVerse = 1) {
        surahNum = Number(surahNum) || 1;
        scrollToVerse = Number(scrollToVerse) || 1;
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        if (!meta) return;

        appState.currentSurah = surahNum;
        appState.currentVerse = scrollToVerse;
        if (dom.readingSurahTitle) dom.readingSurahTitle.textContent = `${meta.number}. ${meta.name} (${meta.arabic})`;
        if (dom.readSurahSelect) dom.readSurahSelect.value = String(surahNum);
        if (dom.quickSurahSelect) dom.quickSurahSelect.value = String(surahNum);

        const surahLoc = window.OfflineQuranDB.getSurahLocationSummary(surahNum);
        const juzSpan = surahLoc.juzStart === surahLoc.juzEnd ? `Juz ${surahLoc.juzStart}` : `Juz ${surahLoc.juzStart}-${surahLoc.juzEnd}`;
        if (dom.readSurahSub) {
            dom.readSurahSub.textContent = `${meta.english} · ${meta.verses} Verses · ${meta.revelation}`;
        }
        if (dom.readSurahLocSummary) {
            dom.readSurahLocSummary.textContent = `${juzSpan} · Hizb ${surahLoc.hizbStart} · Pages ${surahLoc.pageStart}-${surahLoc.pageEnd}`;
        }

        const verses = window.OfflineQuranDB.getVersesByChapter(surahNum);
        const tajweedClasses = getActiveTajweedClass();
        let html = '';
        if (surahNum !== 9) {
            html += `
                <div class="bismillah">
                    <div class="bismillah-arabic ${tajweedClasses}">${getBismillahHtml()}</div>
                    <div class="bismillah-translation">In the name of Allah, the Entirely Merciful, the Especially Merciful</div>
                </div>
            `;
        }

        const showBengali = appState.selectedTranslation === '161';
        const showUrdu = appState.selectedTranslation === '97';
        const showFrench = appState.selectedTranslation === '234';

        html += verses.map((v) => {
            const isBookmarked = appState.bookmarks.some((b) => b.surah === surahNum && b.verse === v.verse_number);
            const isRead = !!(appState.readingLog[`${surahNum}:${v.verse_number}`]);
            const loc = window.OfflineQuranDB.getVerseLocation(surahNum, v.verse_number);

            return `
                <div class="verse-container" id="verse-${v.verse_number}">
                    <div class="verse-header">
                        <div class="verse-header-title">
                            <div class="verse-badge">${v.verse_number}</div>
                            <span class="verse-title-text">${escapeHtml(meta.name)} ${surahNum}:${v.verse_number}</span>
                        </div>
                        <div class="verse-actions">
                            <button class="verse-action-btn ${isRead ? 'checked' : ''}" onclick="toggleVerseRead(${surahNum}, ${v.verse_number}, this)" title="Mark as Read">
                                <svg class="app-icon"><use href="#icon-${isRead ? 'check' : 'circle'}"/></svg>
                            </button>
                            <button class="verse-action-btn" onclick="playVerseAudio(${v.verse_number})" title="Play Recitation">
                                <svg class="app-icon"><use href="#icon-play"/></svg>
                            </button>
                            <button class="verse-action-btn" id="btn-wbw-${surahNum}-${v.verse_number}" onclick="toggleInlineWbw(${surahNum}, ${v.verse_number})" title="Word by Word">
                                <svg class="app-icon"><use href="#icon-font"/></svg>
                            </button>
                            <button class="verse-action-btn" id="btn-tafsir-${surahNum}-${v.verse_number}" onclick="toggleInlineTafsir(${surahNum}, ${v.verse_number})" title="Tafsir Commentary">
                                <svg class="app-icon"><use href="#icon-book"/></svg>
                            </button>
                            <button class="verse-action-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(${surahNum}, ${v.verse_number}, this)" title="Bookmark">
                                <svg class="app-icon"><use href="#icon-bookmark"/></svg>
                            </button>
                            <button class="verse-action-btn" onclick="copyVerse(${surahNum}, ${v.verse_number})" title="Copy">
                                <svg class="app-icon"><use href="#icon-copy"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="verse-content">
                        <div class="arabic-text ${tajweedClasses}">
                            ${renderVerseArabicHtml(v)}
                        </div>
                        ${appState.alwaysEnglish && v.english ? `
                            <div class="translation-text">
                                <div class="translation-label">English Translation</div>
                                ${escapeHtml(v.english)}
                            </div>
                        ` : ''}
                        ${showBengali && v.bengali ? `
                            <div class="translation-text translation-bengali">
                                <div class="translation-label">Bengali Translation (Zakaria)</div>
                                ${escapeHtml(v.bengali)}
                            </div>
                        ` : ''}
                        ${showUrdu && v.urdu ? `
                            <div class="translation-text translation-urdu">
                                <div class="translation-label">Urdu Translation (Ahmed Ali)</div>
                                ${escapeHtml(v.urdu)}
                            </div>
                        ` : ''}
                        ${showFrench && (v.french || v.english) ? `
                            <div class="translation-text translation-french">
                                <div class="translation-label">Traduction Francaise</div>
                                ${escapeHtml(v.french || v.english)}
                            </div>
                        ` : ''}
                        <div class="inline-drawer" id="inline-wbw-${surahNum}-${v.verse_number}" style="display: none;"></div>
                        <div class="inline-drawer" id="inline-tafsir-${surahNum}-${v.verse_number}" style="display: none;"></div>
                        <div class="verse-footer-meta">
                            <span class="loc-meta-text">Juz ${loc.juz} · Hizb ${loc.hizb} · Page ${loc.page}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (dom.versesContainer) dom.versesContainer.innerHTML = html;

        if (dom.audioTitle) dom.audioTitle.textContent = meta.name;
        const reciter = window.QuranDownloadManager ? window.QuranDownloadManager.getReciter(appState.currentReciter) : null;
        if (dom.audioSubtitle) dom.audioSubtitle.textContent = `Verse ${scrollToVerse}${reciter ? ' · ' + reciter.name : ''}`;

        if (dom.readDownloadBtnText && window.OfflineStorageEngine) {
            window.OfflineStorageEngine.isSurahAudioDownloaded(appState.currentReciter, surahNum).then((isDl) => {
                if (isDl) {
                    dom.readDownloadBtnText.textContent = 'Saved Offline';
                    dom.readDownloadSurahBtn?.classList.add('active');
                } else {
                    dom.readDownloadBtnText.textContent = 'Download Audio';
                    dom.readDownloadSurahBtn?.classList.remove('active');
                }
            }).catch(() => {});
        }

        if (navigateToRead) {
            window.showSection('read');
        }

        if (scrollToVerse > 1) {
            setTimeout(() => {
                const el = document.getElementById(`verse-${scrollToVerse}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 90);
        }

        recordTodayActivity();
        localStorage.setItem('quran_session', JSON.stringify({ surah: surahNum, verse: scrollToVerse }));
        updateContinueReading();

        // Hydrate chapters 2..111 in background so Reader and Word-by-Word have authentic Arabic, Tajweed, IndoPak & English cached offline
        const needsChapFetch = !window.OfflineQuranDB.hasAuthenticVerse(surahNum, scrollToVerse || 1) ||
            (typeof window.OfflineQuranDB.needsTajweedUpgrade === 'function' && window.OfflineQuranDB.needsTajweedUpgrade(surahNum, scrollToVerse || 1));
        if (window.QuranTextHydrator && needsChapFetch) {
            window.QuranTextHydrator.fetchChapterWithWords(surahNum).then((hydratedList) => {
                if (hydratedList && hydratedList.length && appState.currentSection === 'read' && Number(appState.currentSurah) === surahNum) {
                    window.loadSurah(surahNum, false, appState.currentVerse);
                }
            }).catch(() => {});
        }
    };

    // ========== SEARCH & FILTERING ==========
    window.setSearchScope = function (scope) {
        appState.searchScope = scope;
        document.querySelectorAll('.search-scope-chip').forEach((c) => {
            c.classList.toggle('active', c.dataset.scope === scope);
        });
        performSearch(dom.searchInput ? dom.searchInput.value : appState.lastSearchQuery);
    };

    window.setSearchRevelation = function (rev) {
        appState.searchRevelation = rev;
        document.querySelectorAll('.search-rev-chip').forEach((c) => {
            c.classList.toggle('active', c.dataset.rev === rev);
        });
        performSearch(dom.searchInput ? dom.searchInput.value : appState.lastSearchQuery);
    };

    window.resetSearchFilters = function () {
        appState.searchScope = 'all';
        appState.searchRevelation = 'all';
        document.querySelectorAll('.search-scope-chip').forEach((c) => {
            c.classList.toggle('active', c.dataset.scope === 'all');
        });
        document.querySelectorAll('.search-rev-chip').forEach((c) => {
            c.classList.toggle('active', c.dataset.rev === 'all');
        });
        performSearch(dom.searchInput ? dom.searchInput.value : appState.lastSearchQuery);
    };

    function performSearch(query) {
        if (!dom.searchResults) return;
        const q = String(query || '').trim();
        appState.lastSearchQuery = q;

        if (appState.searchScope === 'none') {
            dom.searchResults.innerHTML = `
                <div class="card" style="text-align: center; padding: 24px;">
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">All search results filtered out</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">Scope filter is currently set to None. Reset filters to view matching Surahs and Ayahs.</div>
                    <button type="button" class="btn btn-primary btn-sm" onclick="resetSearchFilters()">Show All Results</button>
                </div>
            `;
            return;
        }

        if (!q) {
            dom.searchResults.innerHTML = `
                <div style="color: var(--text-secondary); padding: 18px; text-align: center;">
                    Search by Surah name or number (e.g. <strong>Yasin</strong>, <strong>18</strong>), reference (<strong>2:255</strong>), or keyword (<strong>mercy</strong>, <strong>patience</strong>).
                </div>
            `;
            return;
        }

        const res = window.OfflineQuranDB.search(q, {
            scope: appState.searchScope,
            revelation: appState.searchRevelation
        });

        const surahs = res && Array.isArray(res.surahs) ? res.surahs : [];
        const ayahs = res && Array.isArray(res.ayahs) ? res.ayahs : [];

        if (!surahs.length && !ayahs.length) {
            dom.searchResults.innerHTML = `
                <div class="card" style="text-align: center; padding: 22px; color: var(--text-secondary);">
                    No Surahs or Ayahs matched "<strong>${escapeHtml(q)}</strong>" under the active filters.
                </div>
            `;
            return;
        }

        let html = '';

        if (surahs.length > 0 && (appState.searchScope === 'all' || appState.searchScope === 'surahs')) {
            html += `
                <div class="search-group-header">
                    <div class="search-group-title">
                        <svg class="app-icon"><use href="#icon-list"/></svg>
                        <span>Matching Surahs</span>
                    </div>
                    <span class="search-count-pill">${surahs.length}</span>
                </div>
                <div class="search-surah-grid">
                    ${surahs.map((s) => {
                        const sum = s.summary || window.OfflineQuranDB.getSurahLocationSummary(s.number);
                        const juzLabel = sum.juzStart === sum.juzEnd ? `Juz ${sum.juzStart}` : `Juz ${sum.juzStart}-${sum.juzEnd}`;
                        return `
                            <div class="surah-card" onclick="loadSurah(${s.number}, true)">
                                <div class="surah-num">${s.number}</div>
                                <div class="surah-info">
                                    <div class="surah-name-row">
                                        <span class="surah-name">${highlightMatch(s.name, q)}</span>
                                        <span class="surah-arabic">${escapeHtml(s.arabic)}</span>
                                    </div>
                                    <div class="surah-meta">${highlightMatch(s.english || '', q)} · ${s.revelation} · ${s.verses} Ayahs</div>
                                    <div class="surah-loc-meta">${juzLabel} · Hizb ${sum.hizbStart} · Page ${sum.pageStart}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (ayahs.length > 0 && (appState.searchScope === 'all' || appState.searchScope === 'ayahs')) {
            html += `
                <div class="search-group-header">
                    <div class="search-group-title">
                        <svg class="app-icon"><use href="#icon-book-open"/></svg>
                        <span>Matching Ayahs</span>
                    </div>
                    <span class="search-count-pill">${ayahs.length}</span>
                </div>
                ${ayahs.map((r) => {
                    const loc = r.location || window.OfflineQuranDB.getVerseLocation(r.surah, r.verse);
                    const verseObj = window.OfflineQuranDB.getVerseByKey(r.verse_key);
                    const tajweedCls = getActiveTajweedClass();
                    const arabicHtml = verseObj
                        ? renderVerseArabicHtml(verseObj)
                        : ensureVerseEndingNumber(applyClientTajweedHtml(r.arabic, !appState.tajweedEnabled), r.verse);
                    return `
                        <div class="card" style="padding: 14px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px;">
                                <span style="font-weight: 700; color: var(--gold);">${escapeHtml(r.surahName)} ${escapeHtml(r.verse_key)}</span>
                                <button class="btn btn-primary btn-sm" onclick="loadSurah(${r.surah}, true, ${r.verse})">
                                    Go to Ayah
                                </button>
                            </div>
                            <div class="arabic-text ${tajweedCls}" style="font-size: 1.35rem; margin-bottom: 8px;">
                                ${arabicHtml}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
                                ${highlightMatch(r.english, q)}
                            </div>
                            <div class="verse-footer-meta">
                                <span class="loc-meta-text">Juz ${loc.juz} · Hizb ${loc.hizb} · Page ${loc.page}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }

        dom.searchResults.innerHTML = html;
    }

    // ========== AUDIO PLAYBACK ==========
    window.playVerseAudio = async function (verseNum) {
        const surahNum = appState.currentSurah;
        const reciterId = appState.currentReciter;
        let isDownloaded = false;
        try {
            if (window.OfflineStorageEngine) {
                isDownloaded = await window.OfflineStorageEngine.isSurahDownloaded(reciterId, surahNum);
            }
        } catch (_) {}
        window.playVerseAudioDirect(surahNum, verseNum, isDownloaded);
    };

    window.playVerseAudioDirect = async function (surahNum, verseNum, isOffline) {
        appState.currentSurah = Number(surahNum);
        appState.currentVerse = Number(verseNum);
        const reciterId = appState.currentReciter;
        const reciter = window.QuranDownloadManager ? window.QuranDownloadManager.getReciter(reciterId) : null;
        const reciterName = reciter ? reciter.name : 'Reciter';
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);

        if (dom.audioTitle) dom.audioTitle.textContent = meta ? meta.name : `Surah ${surahNum}`;
        if (dom.audioSubtitle) dom.audioSubtitle.textContent = `Ayah ${verseNum} · ${reciterName}`;

        if (isOffline === undefined || isOffline === null) {
            try {
                isOffline = window.OfflineStorageEngine
                    ? await window.OfflineStorageEngine.isSurahDownloaded(reciterId, surahNum)
                    : false;
            } catch (_) {
                isOffline = false;
            }
        }


        document.querySelectorAll('.verse-container').forEach((c) => c.classList.remove('playing'));
        const container = document.getElementById(`verse-${verseNum}`);
        if (container) {
            container.classList.add('playing');
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        appState.isPlaying = true;
        if (dom.playIcon) dom.playIcon.innerHTML = `<use href="#icon-pause"/>`;

        if (window.UnifiedAudioEngine) {
            window.UnifiedAudioEngine.setPlaybackRate(appState.playbackRate);
            window.UnifiedAudioEngine.playVerse(
                surahNum,
                verseNum,
                reciterId,
                (currentTime, duration) => {
                    if (duration > 0) {
                        if (dom.audioProgressFill) dom.audioProgressFill.style.width = `${(currentTime / duration) * 100}%`;
                        if (dom.audioCurrentTime) dom.audioCurrentTime.textContent = formatTime(currentTime);
                        if (dom.audioDuration) dom.audioDuration.textContent = formatTime(duration);
                    }
                },
                () => {
                    if (appState.repeatVerse) {
                        window.playVerseAudioDirect(surahNum, verseNum, isOffline);
                    } else if (appState.autoPlayNext && meta && verseNum < meta.verses) {
                        window.playVerseAudioDirect(surahNum, verseNum + 1, isOffline);
                    } else {
                        appState.isPlaying = false;
                        if (dom.playIcon) dom.playIcon.innerHTML = `<use href="#icon-play"/>`;
                        document.querySelectorAll('.verse-container').forEach((c) => c.classList.remove('playing'));
                    }
                },
                (err) => {
                    showToast('Audio unavailable: ' + (err && err.message ? err.message : 'Download for offline listening'), 'error');
                    appState.isPlaying = false;
                    if (dom.playIcon) dom.playIcon.innerHTML = `<use href="#icon-play"/>`;
                }
            );
        }
    };

    function formatTime(secs) {
        if (!secs || isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function closeAudioPromptModal() {
        if (dom.audioPromptModal) dom.audioPromptModal.classList.remove('show');
        appState.pendingPromptVerse = null;
        appState.audioPromptOpen = false;
    }

    async function updatePromptModalStatus() {
        if (!appState.pendingPromptVerse) return;
        const surahNum = appState.pendingPromptVerse.surah;
        const reciterId = dom.promptReciterSelect ? dom.promptReciterSelect.value : appState.currentReciter;
        let isDownloaded = false;
        try {
            if (window.OfflineStorageEngine) {
                isDownloaded = await window.OfflineStorageEngine.isSurahDownloaded(reciterId, surahNum);
            }
        } catch (_) {}
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        const sizeEstimate = meta ? (meta.verses * 0.16).toFixed(1) : '1.5';

        if (dom.promptOfflineStatusBadge) {
            if (isDownloaded) {
                dom.promptOfflineStatusBadge.className = 'prompt-status-badge downloaded';
                dom.promptOfflineStatusBadge.innerHTML = `<svg class="app-icon"><use href="#icon-check"/></svg><span>Downloaded · Instant Offline Playback</span>`;
                if (dom.promptDownloadBtnText) dom.promptDownloadBtnText.textContent = 'Play Offline Audio';
            } else {
                dom.promptOfflineStatusBadge.className = 'prompt-status-badge not-downloaded';
                dom.promptOfflineStatusBadge.innerHTML = `<svg class="app-icon"><use href="#icon-cloud"/></svg><span>Online stream (~${sizeEstimate} MB to save offline)</span>`;
                if (dom.promptDownloadBtnText) dom.promptDownloadBtnText.textContent = `Download Surah ${meta ? meta.name : surahNum} & Play`;
            }
        }
    }

    // ========== PRAYER TIMES, REGIONAL PRESETS & TEMPORARY GPS ==========
    function savePrayerConfig() {
        try {
            localStorage.setItem('quran_prayer_config', JSON.stringify(appState.prayerConfig));
        } catch (_) {}
    }

    function populatePrayerDropdowns() {
        if (!window.OfflinePrayerTimes) return;
        const cfg = appState.prayerConfig;
        const regions = window.OfflinePrayerTimes.REGIONS || [];

        if (dom.prayerCountrySelect) {
            let options = regions.map((r) => `<option value="${r.countryCode}">${escapeHtml(r.country)}</option>`).join('');
            if (cfg.countryCode === 'GPS' || !regions.some((r) => r.countryCode === cfg.countryCode)) {
                options = `<option value="${escapeHtml(cfg.countryCode || 'GPS')}">${escapeHtml(cfg.countryName || 'GPS Area')}</option>` + options;
            }
            dom.prayerCountrySelect.innerHTML = options;
            dom.prayerCountrySelect.value = cfg.countryCode || 'BD';
        }

        if (dom.prayerCitySelect) {
            const region = regions.find((r) => r.countryCode === cfg.countryCode);
            if (region && region.cities) {
                let cityOpts = region.cities.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
                if (cfg.mode === 'gps' && cfg.cityId === 'gps_current') {
                    cityOpts = `<option value="gps_current">${escapeHtml(cfg.cityName || 'Detected GPS Area')}</option>` + cityOpts;
                }
                dom.prayerCitySelect.innerHTML = cityOpts;
                dom.prayerCitySelect.value = cfg.cityId || region.cities[0].id;
            } else {
                dom.prayerCitySelect.innerHTML = `<option value="${escapeHtml(cfg.cityId || 'gps_current')}">${escapeHtml(cfg.cityName || 'Detected Area')}</option>`;
                dom.prayerCitySelect.value = cfg.cityId || 'gps_current';
            }
        }

        if (dom.prayerMethodSelect) {
            const methods = Object.values(window.OfflinePrayerTimes.METHODS || {});
            dom.prayerMethodSelect.innerHTML = methods.map((m) => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');
            dom.prayerMethodSelect.value = cfg.methodId || 'bangladesh_ifb';
        }

        if (dom.prayerAsrStandardBtn) {
            dom.prayerAsrStandardBtn.classList.toggle('active', cfg.asrSchool !== 'hanafi');
        }
        if (dom.prayerAsrHanafiBtn) {
            dom.prayerAsrHanafiBtn.classList.toggle('active', cfg.asrSchool === 'hanafi');
        }
    }

    window.openPrayerMiniSettings = function (open) {
        appState.prayerMiniSettingsOpen = !!open;
        if (dom.prayerMiniSettingsPanel) {
            dom.prayerMiniSettingsPanel.style.display = appState.prayerMiniSettingsOpen ? 'block' : 'none';
        }
        if (dom.prayerMiniSettingsToggleBtn) {
            dom.prayerMiniSettingsToggleBtn.classList.toggle('active', appState.prayerMiniSettingsOpen);
        }
    };

    window.togglePrayerMiniSettings = function () {
        const cfg = appState.prayerConfig || getDefaultPrayerConfig();
        const currentlyOpen = appState.prayerMiniSettingsOpen !== null
            ? appState.prayerMiniSettingsOpen
            : !cfg.configured;
        window.openPrayerMiniSettings(!currentlyOpen);
    };

    window.applyQuickPrayerPreset = function (countryCode, cityId) {
        if (!window.OfflinePrayerTimes) return;
        const region = window.OfflinePrayerTimes.getRegion(countryCode);
        if (!region) return;
        const city = (region.cities || []).find((c) => c.id === cityId) || region.cities[0];
        const method = window.OfflinePrayerTimes.getMethod(region.defaultMethod);
        const wasFirstSetup = !(appState.prayerConfig && appState.prayerConfig.configured);
        appState.prayerConfig = {
            configured: true,
            mode: 'preset',
            countryCode: region.countryCode,
            countryName: region.country,
            cityId: city.id,
            cityName: city.name,
            methodId: region.defaultMethod,
            asrSchool: method ? (method.defaultAsrSchool || 'standard') : 'standard',
            lat: city.lat,
            lon: city.lon,
            tz: city.tz,
            locationLabel: `${city.name}, ${region.country}`
        };
        appState.livePrayerTimings = null;
        if (wasFirstSetup && appState.prayerMiniSettingsOpen === null) {
            appState.prayerMiniSettingsOpen = false;
        }
        savePrayerConfig();
        populatePrayerDropdowns();
        renderQatarPrayers();
        syncSettingsUI();
        showToast(`Prayer location set to ${city.name}, ${region.country}`, 'success');
    };

    function setGpsButtonsLoading(loading) {
        appState.gpsDetecting = !!loading;
        [dom.prayerDetectGpsBtn].forEach((btn) => {
            if (!btn) return;
            btn.disabled = !!loading;
            const span = btn.querySelector('span');
            if (span) span.textContent = loading ? 'Detecting Area...' : 'Detect Area (GPS)';
        });
    }

    window.requestTemporaryPrayerGps = function () {
        if (appState.gpsDetecting) return;
        setGpsButtonsLoading(true);
        if (window.AndroidLocationBridge && typeof window.AndroidLocationBridge.requestTemporaryLocation === 'function') {
            try {
                window.AndroidLocationBridge.requestTemporaryLocation();
                return;
            } catch (_) {}
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    window.onNativeLocationResult({
                        status: 'ok',
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        timezoneOffset: -(new Date().getTimezoneOffset()) / 60,
                        city: '',
                        country: '',
                        countryCode: ''
                    });
                },
                (err) => {
                    window.onNativeLocationResult({
                        status: err && err.code === 1 ? 'denied' : 'unavailable',
                        message: err && err.message ? err.message : 'Unable to detect browser location. Select a city below.'
                    });
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 900000 }
            );
        } else {
            setGpsButtonsLoading(false);
            showToast('Location detection unavailable; please pick your country and city below.', 'error');
        }
    };

    window.onNativeLocationResult = function (payload) {
        setGpsButtonsLoading(false);
        if (!payload || payload.status !== 'ok') {
            showToast((payload && payload.message) || 'Location detection unavailable. Choose a regional preset below.', 'error');
            return;
        }
        if (!window.OfflinePrayerTimes) return;

        const lat = Number(payload.latitude);
        const lon = Number(payload.longitude);
        const tz = typeof payload.timezoneOffset === 'number' && !isNaN(payload.timezoneOffset)
            ? payload.timezoneOffset
            : -(new Date().getTimezoneOffset()) / 60;
        const matched = window.OfflinePrayerTimes.detectClosestPreset(lat, lon, payload.countryCode || '');
        const method = window.OfflinePrayerTimes.getMethod(matched.methodId);

        const cityName = (payload.city || '').trim() || matched.cityName;
        const countryName = (payload.country || '').trim() || matched.country;
        const countryCode = (payload.countryCode || '').trim().toUpperCase() || matched.countryCode;
        const knownRegion = window.OfflinePrayerTimes.REGIONS.find((r) => r.countryCode === countryCode);
        const wasFirstSetup = !(appState.prayerConfig && appState.prayerConfig.configured);

        appState.prayerConfig = {
            configured: true,
            mode: 'gps',
            countryCode: knownRegion ? knownRegion.countryCode : (countryCode || 'GPS'),
            countryName: countryName,
            cityId: 'gps_current',
            cityName: cityName,
            methodId: matched.methodId,
            asrSchool: method ? (method.defaultAsrSchool || 'standard') : 'standard',
            lat: lat,
            lon: lon,
            tz: tz,
            locationLabel: `${cityName}, ${countryName}`
        };
        appState.livePrayerTimings = null;
        if (wasFirstSetup && appState.prayerMiniSettingsOpen === null) {
            appState.prayerMiniSettingsOpen = false;
        }
        savePrayerConfig();
        populatePrayerDropdowns();
        renderQatarPrayers();
        syncSettingsUI();
        showToast(`Area detected: ${cityName}, ${countryName}`, 'success');
    };

    window.verifyOnlinePrayerTimes = async function () {
        if (!window.OfflinePrayerTimes) return;
        const btn = dom.prayerVerifyOnlineBtn;
        if (btn) {
            btn.disabled = true;
            const sp = btn.querySelector('span');
            if (sp) sp.textContent = 'Syncing...';
        }
        try {
            const timings = await window.OfflinePrayerTimes.fetchOnlineTimings(new Date(), appState.prayerConfig);
            appState.livePrayerTimings = timings;
            renderQatarPrayers();
            showToast(`Verified today's timings for ${appState.prayerConfig.cityName}`, 'success');
        } catch (_) {
            showToast('Offline or unreachable; displaying accurate local solar timings.', 'info');
        } finally {
            if (btn) {
                btn.disabled = false;
                const sp = btn.querySelector('span');
                if (sp) sp.textContent = 'Verify Online';
            }
        }
    };

    function parsePrayerTimeToday(timeStr) {
        const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(timeStr || '').trim());
        if (!m) return null;
        let h = Number(m[1]);
        const min = Number(m[2]);
        const period = m[3].toUpperCase();
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        const d = new Date();
        d.setHours(h, min, 0, 0);
        return d;
    }

    function renderQatarPrayers() {
        if (!window.OfflinePrayerTimes || !dom.qatarPrayersTable) return;
        const cfg = appState.prayerConfig || getDefaultPrayerConfig();
        const shouldOpenMini = appState.prayerMiniSettingsOpen !== null
            ? appState.prayerMiniSettingsOpen
            : !cfg.configured;

        if (dom.prayerMiniSettingsPanel) {
            dom.prayerMiniSettingsPanel.style.display = shouldOpenMini ? 'block' : 'none';
        }
        if (dom.prayerMiniSettingsToggleBtn) {
            dom.prayerMiniSettingsToggleBtn.classList.toggle('active', shouldOpenMini);
        }
        if (dom.prayerMiniEyebrow) {
            dom.prayerMiniEyebrow.textContent = cfg.configured ? 'Prayer Section Settings' : 'First-Time Prayer Setup';
        }

        // Check cached daily online timings if available for active coordinates/method
        let times = null;
        if (appState.livePrayerTimings) {
            times = appState.livePrayerTimings;
        } else {
            times = window.OfflinePrayerTimes.calculate(new Date(), cfg);
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const locLabel = cfg.locationLabel || `${cfg.cityName}, ${cfg.countryName}`;
        const asrLabel = cfg.asrSchool === 'hanafi' ? 'Hanafi Asr' : 'Standard Asr';

        if (dom.qatarDateLabel) {
            dom.qatarDateLabel.textContent = `${dateStr} · ${locLabel}`;
        }
        if (dom.prayerLocationTitle) {
            dom.prayerLocationTitle.textContent = cfg.configured
                ? `${locLabel} (${cfg.lat.toFixed(2)}, ${cfg.lon.toFixed(2)})`
                : `Preview: ${locLabel} — detect area via GPS or choose preset`;
        }
        if (dom.prayerStatusBadge) {
            if (!cfg.configured) {
                dom.prayerStatusBadge.className = 'reciter-badge cloud';
                dom.prayerStatusBadge.textContent = 'Preview Mode';
            } else if (times.source === 'aladhan-live') {
                dom.prayerStatusBadge.className = 'reciter-badge downloaded';
                dom.prayerStatusBadge.textContent = 'Verified Live';
            } else if (cfg.mode === 'gps') {
                dom.prayerStatusBadge.className = 'reciter-badge downloaded';
                dom.prayerStatusBadge.textContent = 'GPS Area';
            } else {
                dom.prayerStatusBadge.className = 'reciter-badge downloaded';
                dom.prayerStatusBadge.textContent = 'Offline Solar';
            }
        }
        if (dom.prayerMethodSummary) {
            dom.prayerMethodSummary.textContent = `${times.methodName} · ${asrLabel}`;
        }

        const rows = [
            { name: 'Fajr (Dawn)', time: times.fajr },
            { name: 'Sunrise', time: times.sunrise },
            { name: 'Dhuhr (Noon)', time: times.dhuhr },
            { name: 'Asr (Afternoon)', time: times.asr },
            { name: 'Maghrib (Sunset)', time: times.maghrib },
            { name: 'Isha (Night)', time: times.isha }
        ];

        let nextRow = null;
        let nextDate = null;
        for (const r of rows) {
            const parsed = parsePrayerTimeToday(r.time);
            if (parsed && parsed > now) {
                nextRow = r;
                nextDate = parsed;
                break;
            }
        }
        if (!nextRow) {
            nextRow = rows[0];
            nextDate = parsePrayerTimeToday(rows[0].time);
            if (nextDate) nextDate.setDate(nextDate.getDate() + 1);
        }

        if (dom.qatarNextPrayerBanner && nextRow && nextDate) {
            const diffMin = Math.max(0, Math.round((nextDate - now) / 60000));
            const hrs = Math.floor(diffMin / 60);
            const mins = diffMin % 60;
            const countdown = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
            dom.qatarNextPrayerBanner.innerHTML = `
                <div>
                    <div style="font-size:0.74rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent); font-weight:700;">Next Prayer · ${escapeHtml(cfg.cityName)}</div>
                    <div style="font-size:1.06rem; font-weight:800; color:var(--text-primary);">${escapeHtml(nextRow.name)} · ${escapeHtml(nextRow.time)}</div>
                </div>
                <span class="reciter-badge downloaded" style="font-size:0.82rem; padding:5px 11px;">In ${countdown}</span>
            `;
        }

        dom.qatarPrayersTable.innerHTML = rows.map((r) => `
            <div class="prayer-row ${nextRow && nextRow.name === r.name ? 'next-prayer' : ''}">
                <span class="prayer-name">${escapeHtml(r.name)}</span>
                <span class="prayer-time">${escapeHtml(r.time)}</span>
            </div>
        `).join('');

        if (prayerCountdownTimer) clearInterval(prayerCountdownTimer);
        prayerCountdownTimer = setInterval(() => {
            if (appState.currentSection === 'qatar-prayers') {
                renderQatarPrayers();
            }
        }, 30000);
    }

    function renderPrayerTracker() {
        if (!dom.prayerTable) return;
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const todayKey = new Date().toISOString().slice(0, 10);
        const todayLog = appState.prayerLog[todayKey] || {};

        dom.prayerTable.innerHTML = prayers.map((p) => {
            const status = todayLog[p] || '';
            return `
                <div class="prayer-row">
                    <span class="prayer-name">${p}</span>
                    <div class="prayer-actions">
                        <button class="prayer-status-btn ${status === 'ontime' ? 'ontime-active' : ''}" onclick="logPrayer('${p}', 'ontime')">
                            <svg class="app-icon"><use href="#icon-check"/></svg> On Time
                        </button>
                        <button class="prayer-status-btn ${status === 'late' ? 'late-active' : ''}" onclick="logPrayer('${p}', 'late')">
                            Late
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.logPrayer = function (prayer, status) {
        const todayKey = new Date().toISOString().slice(0, 10);
        if (!appState.prayerLog[todayKey]) appState.prayerLog[todayKey] = {};
        appState.prayerLog[todayKey][prayer] = appState.prayerLog[todayKey][prayer] === status ? null : status;
        localStorage.setItem('quran_prayer_log', JSON.stringify(appState.prayerLog));
        recordTodayActivity();
        renderPrayerTracker();
        updateDashboard();
    };

    // ========== BOOKMARKS & VERSE ACTIONS ==========
    window.toggleBookmark = function (surahNum, verseNum, btn) {
        const idx = appState.bookmarks.findIndex((b) => b.surah === surahNum && b.verse === verseNum);
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        if (idx > -1) {
            appState.bookmarks.splice(idx, 1);
            if (btn) btn.classList.remove('bookmarked');
            showToast('Bookmark removed');
        } else {
            appState.bookmarks.push({ surah: surahNum, verse: verseNum, name: meta ? meta.name : `Surah ${surahNum}` });
            if (btn) btn.classList.add('bookmarked');
            showToast(`Bookmarked ${meta ? meta.name : 'Surah'} ${surahNum}:${verseNum}`, 'success');
        }
        localStorage.setItem('quran_bookmarks', JSON.stringify(appState.bookmarks));
        renderBookmarks();
        updateDashboard();
    };

    function renderBookmarks() {
        if (!dom.bookmarksList) return;
        if (!appState.bookmarks.length) {
            dom.bookmarksList.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No saved bookmarks yet. Tap the bookmark icon on any Ayah while reading.</div>';
            return;
        }
        dom.bookmarksList.innerHTML = appState.bookmarks.map((b, idx) => {
            const loc = window.OfflineQuranDB.getVerseLocation(b.surah, b.verse);
            return `
                <div class="surah-card" style="margin-bottom: 8px;">
                    <div class="surah-num">${b.verse}</div>
                    <div class="surah-info" onclick="loadSurah(${b.surah}, true, ${b.verse})">
                        <div class="surah-name">${escapeHtml(b.name)} (${b.surah}:${b.verse})</div>
                        <div class="surah-loc-meta">Juz ${loc.juz} · Hizb ${loc.hizb} · Page ${loc.page}</div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="removeBookmark(${idx})" aria-label="Remove bookmark">
                        <svg class="app-icon"><use href="#icon-trash"/></svg>
                    </button>
                </div>
            `;
        }).join('');
    }

    window.removeBookmark = function (idx) {
        appState.bookmarks.splice(idx, 1);
        localStorage.setItem('quran_bookmarks', JSON.stringify(appState.bookmarks));
        renderBookmarks();
        updateDashboard();
    };

    window.toggleVerseRead = function (surahNum, verseNum, btn) {
        const key = `${surahNum}:${verseNum}`;
        if (appState.readingLog[key]) {
            delete appState.readingLog[key];
            btn.classList.remove('checked');
            btn.querySelector('use')?.setAttribute('href', '#icon-circle');
        } else {
            appState.readingLog[key] = true;
            btn.classList.add('checked');
            btn.querySelector('use')?.setAttribute('href', '#icon-check');
            recordTodayActivity();
        }
        localStorage.setItem('quran_reading_log', JSON.stringify(appState.readingLog));
        updateDashboard();
    };

    window.copyVerse = function (surahNum, verseNum) {
        const verse = window.OfflineQuranDB.getVerseByKey(`${surahNum}:${verseNum}`);
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        const loc = window.OfflineQuranDB.getVerseLocation(surahNum, verseNum);
        const arabicPlain = getVerseScriptPlainText(verse);
        const text = `${arabicPlain}\n\n"${verse.english}"\n- ${meta ? meta.name : 'Surah'} ${surahNum}:${verseNum} (Juz ${loc.juz}, Hizb ${loc.hizb}, Page ${loc.page})`;
        copyTextSafe(text, `Copied ${meta ? meta.name : 'Surah'} ${surahNum}:${verseNum} to clipboard`);
    };

    // ========== DASHBOARD & CONTINUE READING ==========
    function updateDashboard() {
        const count = Object.keys(appState.readingLog).length;
        const pct = Math.min(100, ((count / 6236) * 100)).toFixed(1);
        const streak = computeStreak();
        const ayahsEl = document.getElementById('dashAyahsRead');
        const streakEl = document.getElementById('dashStreak');
        const bmEl = document.getElementById('dashBookmarks');
        const pctEl = document.getElementById('dashCompletionPct');
        const fillEl = document.getElementById('dashCompletionFill');

        if (ayahsEl) ayahsEl.textContent = String(count);
        if (streakEl) streakEl.textContent = String(streak);
        if (bmEl) bmEl.textContent = String(appState.bookmarks.length);
        if (pctEl) pctEl.textContent = `${pct}% (${count} / 6,236 Ayahs)`;
        if (fillEl) fillEl.style.width = `${pct}%`;
    }

    function updateContinueReading() {
        const raw = localStorage.getItem('quran_session');
        if (!raw) return;
        try {
            const session = JSON.parse(raw);
            const meta = window.OfflineQuranDB.getSurahMeta(session.surah);
            if (meta && dom.continueReadingCard && dom.continueSub) {
                const loc = window.OfflineQuranDB.getVerseLocation(session.surah, session.verse || 1);
                dom.continueReadingCard.style.display = 'block';
                dom.continueSub.textContent = `${meta.name} (${meta.arabic}) · Verse ${session.verse || 1} · Juz ${loc.juz} · Page ${loc.page}`;
            }
        } catch (_) {}
    }

    // ========== DOWNLOADS & OFFLINE MANAGER ==========
    window.switchDownloadsTab = function (tab) {
        appState.dlTab = tab;
        document.querySelectorAll('.downloads-tab-btn').forEach((btn) => btn.classList.remove('active'));
        const audioPane = document.getElementById('dlTabContentAudio');
        const transPane = document.getElementById('dlTabContentTranslations');
        const tafsirPane = document.getElementById('dlTabContentTafsir');
        if (audioPane) audioPane.style.display = 'none';
        if (transPane) transPane.style.display = 'none';
        if (tafsirPane) tafsirPane.style.display = 'none';

        if (tab === 'audio') {
            document.getElementById('tabBtnAudio')?.classList.add('active');
            if (audioPane) audioPane.style.display = 'block';
        } else if (tab === 'translations') {
            document.getElementById('tabBtnTranslations')?.classList.add('active');
            if (transPane) transPane.style.display = 'block';
        } else if (tab === 'tafsir') {
            document.getElementById('tabBtnTafsir')?.classList.add('active');
            if (tafsirPane) tafsirPane.style.display = 'block';
        }
    };

    window.setDlFilter = function (filter) {
        appState.dlFilter = filter;
        ['dlFilterAll', 'dlFilterDownloaded', 'dlFilterJuz30'].forEach((id) => {
            document.getElementById(id)?.classList.remove('active');
        });
        if (filter === 'all') document.getElementById('dlFilterAll')?.classList.add('active');
        if (filter === 'downloaded') document.getElementById('dlFilterDownloaded')?.classList.add('active');
        if (filter === 'juz30') document.getElementById('dlFilterJuz30')?.classList.add('active');
        renderSurahDownloadList(dom.dlSurahSearchInput ? dom.dlSurahSearchInput.value : '');
    };

    async function initDownloadsUI() {
        populateReciterOptions();
        await renderRecitersGrid();
        await renderSurahDownloadList(dom.dlSurahSearchInput ? dom.dlSurahSearchInput.value : '');
        renderTranslationsList();
        await renderTafsirList();
        updateStorageBadge();
        updateReciterShortcutState();
        await window.updateDownloadAllStatus(appState.currentReciter);
    }

    function populateReciterOptions() {
        if (!window.QuranDownloadManager) return;
        const reciters = window.QuranDownloadManager.RECITERS;
        const optsHtml = reciters.map((r) => `
            <option value="${r.id}" ${r.id === appState.currentReciter ? 'selected' : ''}>
                ${escapeHtml(r.name)} · ${escapeHtml(r.bitrate || '128 kbps')}
            </option>
        `).join('');

        if (dom.quickReciterSelect) {
            dom.quickReciterSelect.innerHTML = optsHtml;
            dom.quickReciterSelect.onchange = (e) => window.selectReciter(e.target.value);
        }
        if (dom.downloadAllReciterSelect) {
            dom.downloadAllReciterSelect.innerHTML = optsHtml;
            dom.downloadAllReciterSelect.onchange = (e) => window.selectReciter(e.target.value);
        }
        if (dom.promptReciterSelect) {
            dom.promptReciterSelect.innerHTML = optsHtml;
        }
        if (dom.settingsReciterSelect) {
            dom.settingsReciterSelect.innerHTML = optsHtml;
            dom.settingsReciterSelect.onchange = (e) => window.selectReciter(e.target.value);
        }
    }

    function syncAudioBarSummary(surahNum, verseNum) {
        const s = Number(surahNum) || 1;
        const v = Number(verseNum) || 1;
        const meta = window.OfflineQuranDB?.getSurahMeta(s);
        const reciter = window.QuranDownloadManager ? window.QuranDownloadManager.getReciter(appState.currentReciter) : null;
        if (dom.audioTitle) dom.audioTitle.textContent = meta ? meta.name : `Surah ${s}`;
        if (dom.audioSubtitle) dom.audioSubtitle.textContent = `Ayah ${v}${reciter ? ' · ' + reciter.name : ''}`;
    }

    window.selectReciter = async function (reciterId) {
        appState.currentReciter = reciterId;
        localStorage.setItem('quran_reciter', reciterId);
        if (dom.quickReciterSelect) dom.quickReciterSelect.value = reciterId;
        if (dom.downloadAllReciterSelect) dom.downloadAllReciterSelect.value = reciterId;
        if (dom.promptReciterSelect) dom.promptReciterSelect.value = reciterId;
        if (dom.settingsReciterSelect) dom.settingsReciterSelect.value = reciterId;
        syncAudioBarSummary(appState.currentSurah, appState.currentVerse);

        const reciter = window.QuranDownloadManager ? window.QuranDownloadManager.getReciter(reciterId) : null;
        showToast(`Selected reciter: ${reciter ? reciter.name : reciterId}`);

        await renderRecitersGrid();
        await renderSurahDownloadList(dom.dlSurahSearchInput ? dom.dlSurahSearchInput.value : '');
        updateReciterShortcutState();
        await window.updateDownloadAllStatus(reciterId);
    };

    window.onDownloadAllReciterChange = async function (reciterId) {
        await window.selectReciter(reciterId);
    };

    window.updateDownloadAllStatus = async function (reciterId) {
        reciterId = reciterId || appState.currentReciter;
        if (!window.OfflineStorageEngine) return;
        const badge = dom.downloadAllStatusBadge;
        const btn = dom.downloadAllBtn;
        const clearBtn = dom.clearFullQuranBtn;

        try {
            const downloaded = await window.OfflineStorageEngine.getDownloadedSurahsForReciter(reciterId);
            const count = (downloaded || []).length;
            const isRunning = window.QuranDownloadManager?.isBatchRunning;

            if (count >= 114) {
                if (badge) badge.innerHTML = `<span style="color: var(--accent); font-weight: 700;">Full Quran Downloaded (114/114 Surahs)</span>`;
                if (btn && !isRunning) {
                    btn.innerHTML = `<svg class="app-icon"><use href="#icon-check-circle"/></svg> <span>Full Quran Saved (114)</span>`;
                    btn.disabled = false;
                }
                if (clearBtn) clearBtn.style.display = 'inline-flex';
            } else if (count > 0) {
                if (badge) badge.innerHTML = `<span style="color: var(--gold-light); font-weight: 600;">Saved: ${count} of 114 Surahs</span>`;
                if (btn && !isRunning) {
                    btn.innerHTML = `<svg class="app-icon"><use href="#icon-download"/></svg> <span>Download Remaining (${114 - count})</span>`;
                    btn.disabled = false;
                }
                if (clearBtn) clearBtn.style.display = 'inline-flex';
            } else {
                if (badge) badge.innerHTML = `<span style="color: var(--text-secondary);">Ready to Download (0/114 Saved)</span>`;
                if (btn && !isRunning) {
                    btn.innerHTML = `<svg class="app-icon"><use href="#icon-download"/></svg> <span>Download All (114)</span>`;
                    btn.disabled = false;
                }
                if (clearBtn) clearBtn.style.display = 'none';
            }
        } catch (_) {}
    };

    window.startDownloadAll = async function () {
        const reciterId = appState.currentReciter;
        const reciter = window.QuranDownloadManager ? window.QuranDownloadManager.getReciter(reciterId) : null;
        const reciterName = reciter ? reciter.name : reciterId;

        if (window.QuranDownloadManager?.isBatchRunning) {
            showToast('A batch download is already in progress.');
            return;
        }
        const confirmed = await showAppConfirm({
            title: 'Download Full Quran',
            message: `Download all 114 Surahs recited by ${reciterName} for complete offline playback?`,
            confirmText: 'Download All (114)'
        });
        if (!confirmed) return;

        if (dom.downloadAllBtn) dom.downloadAllBtn.disabled = true;
        if (dom.cancelDownloadAllBtn) dom.cancelDownloadAllBtn.style.display = 'inline-flex';
        if (dom.downloadAllProgressBox) dom.downloadAllProgressBox.style.display = 'block';
        if (dom.downloadAllProgressFill) dom.downloadAllProgressFill.style.width = '0%';
        if (dom.downloadAllProgressText) dom.downloadAllProgressText.textContent = `Starting download for ${reciterName}...`;
        if (dom.downloadAllProgressStats) dom.downloadAllProgressStats.textContent = '0 / 114 Surahs';

        const allSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
        window.QuranDownloadManager.batchDownloadSurahs(
            reciterId,
            allSurahs,
            (done, total, curr, percent) => {
                const m = window.OfflineQuranDB.getSurahMeta(curr);
                const overall = Math.min(100, Math.round((done / total) * 100));
                if (dom.downloadAllProgressFill) dom.downloadAllProgressFill.style.width = `${overall}%`;
                if (dom.downloadAllProgressText) dom.downloadAllProgressText.textContent = `Downloading ${m ? m.name : 'Surah ' + curr}... ${percent != null ? percent + '%' : ''}`;
                if (dom.downloadAllProgressStats) dom.downloadAllProgressStats.textContent = `${done} / ${total} Surahs (${overall}%)`;
            },
            async () => {
                showToast('Full Quran (114 Surahs) downloaded offline.', 'success');
                if (dom.downloadAllProgressFill) dom.downloadAllProgressFill.style.width = '100%';
                if (dom.downloadAllProgressText) dom.downloadAllProgressText.textContent = 'Full Quran download complete (114/114 Surahs).';
                if (dom.cancelDownloadAllBtn) dom.cancelDownloadAllBtn.style.display = 'none';
                if (dom.downloadAllBtn) dom.downloadAllBtn.disabled = false;
                await initDownloadsUI();
            },
            (err) => {
                showToast(`Download error: ${err.message || err}`, 'error');
                if (dom.cancelDownloadAllBtn) dom.cancelDownloadAllBtn.style.display = 'none';
                if (dom.downloadAllBtn) dom.downloadAllBtn.disabled = false;
            },
            async (completedCount, totalCount) => {
                showToast(`Download paused (${completedCount}/${totalCount} Surahs saved).`);
                if (dom.cancelDownloadAllBtn) dom.cancelDownloadAllBtn.style.display = 'none';
                if (dom.downloadAllBtn) dom.downloadAllBtn.disabled = false;
                await initDownloadsUI();
            }
        );
    };

    window.cancelDownloadAll = function () {
        if (window.QuranDownloadManager?.cancelBatch) {
            window.QuranDownloadManager.cancelBatch();
            showToast('Pausing batch download...');
        }
    };

    window.clearFullQuranAudio = async function () {
        const reciterId = appState.currentReciter;
        const reciter = window.QuranDownloadManager ? window.QuranDownloadManager.getReciter(reciterId) : null;
        const confirmed = await showAppConfirm({
            title: 'Remove Reciter Audio',
            message: `Remove all downloaded offline Surahs for ${reciter ? reciter.name : reciterId}?`,
            confirmText: 'Remove Audio',
            dangerous: true
        });
        if (!confirmed) return;
        await window.OfflineStorageEngine.clearReciterAudio(reciterId);
        showToast('Removed reciter offline audio.');
        if (dom.downloadAllProgressBox) dom.downloadAllProgressBox.style.display = 'none';
        await initDownloadsUI();
    };

    async function updateReciterShortcutState() {
        if (!window.OfflineStorageEngine || !dom.quickReciterShortcutBox) return;
        const downloaded = await window.OfflineStorageEngine.getDownloadedSurahsForReciter(appState.currentReciter);
        const count = downloaded.length;
        dom.quickReciterShortcutBox.style.display = 'block';
        if (dom.quickDownloadShortcutText) {
            dom.quickDownloadShortcutText.textContent = count === 0
                ? '0 Surahs Offline · Download Manager'
                : `${count} Surahs Offline · Manage Downloads`;
        }
    }

    async function renderRecitersGrid() {
        if (!window.QuranDownloadManager || !dom.recitersGridContainer) return;
        const reciters = window.QuranDownloadManager.RECITERS;
        const cardsHtml = await Promise.all(reciters.map(async (r) => {
            const isActive = r.id === appState.currentReciter;
            let downloadedCount = 0;
            try {
                const list = await window.OfflineStorageEngine.getDownloadedSurahsForReciter(r.id);
                downloadedCount = list.length;
            } catch (_) {}
            return `
                <div class="reciter-card ${isActive ? 'active' : ''}" onclick="selectReciter('${r.id}')" style="cursor: pointer;">
                    <div class="reciter-header">
                        <div class="reciter-icon"><svg class="app-icon"><use href="#icon-headphones"/></svg></div>
                        <div class="reciter-names">
                            <h4>${escapeHtml(r.name)}</h4>
                            <div class="reciter-ar">${escapeHtml(r.arabic)}</div>
                            <div class="reciter-style">${escapeHtml(r.style)} · ${escapeHtml(r.bitrate || '128 kbps')}</div>
                        </div>
                    </div>
                    <div class="reciter-card-actions">
                        <span class="reciter-badge ${downloadedCount > 0 ? 'downloaded' : 'cloud'}">
                            ${downloadedCount > 0 ? `${downloadedCount} Surahs Offline` : 'Online Stream'}
                        </span>
                        <span class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}" style="pointer-events: none;">
                            ${isActive ? 'Selected' : 'Choose'}
                        </span>
                    </div>
                </div>
            `;
        }));
        dom.recitersGridContainer.innerHTML = cardsHtml.join('');
    }

    async function renderSurahDownloadList(query = '') {
        if (!dom.surahDlListContainer) return;
        const reciterId = appState.currentReciter;
        let downloadedList = [];
        try {
            if (window.OfflineStorageEngine) {
                downloadedList = await window.OfflineStorageEngine.getDownloadedSurahsForReciter(reciterId);
            }
        } catch (_) {}
        const downloadedSet = new Set(downloadedList.map((i) => Number(i)));

        let surahs = window.OfflineQuranDB.getSurahs();
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            surahs = surahs.filter((s) => s.name.toLowerCase().includes(q) || (s.english && s.english.toLowerCase().includes(q)) || String(s.number).includes(q));
        }
        if (appState.dlFilter === 'downloaded') {
            surahs = surahs.filter((s) => downloadedSet.has(s.number));
        } else if (appState.dlFilter === 'juz30') {
            surahs = surahs.filter((s) => s.number >= 78 && s.number <= 114);
        }

        if (!surahs.length) {
            dom.surahDlListContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No Surahs match the active filter.</div>';
            return;
        }

        dom.surahDlListContainer.innerHTML = surahs.map((s) => {
            const isDownloaded = downloadedSet.has(s.number);
            return `
                <div class="surah-dl-row" id="surahDlRow-${s.number}">
                    <div class="surah-dl-info">
                        <div class="surah-dl-num">${s.number}</div>
                        <div>
                            <span class="surah-dl-title-en">${escapeHtml(s.name)}</span>
                            <span class="surah-dl-title-ar">${escapeHtml(s.arabic)}</span>
                            <div class="surah-dl-sub">${s.verses} Verses · ${escapeHtml(s.revelation)}</div>
                        </div>
                    </div>
                    <div class="surah-dl-actions">
                        ${isDownloaded ? `
                            <span class="reciter-badge downloaded">Saved</span>
                            <button class="btn btn-primary btn-sm" onclick="playVerseAudioDirect(${s.number}, 1, true)">
                                <svg class="app-icon"><use href="#icon-play"/></svg> Play
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="deleteSurahAudio(${s.number})" title="Remove offline file">
                                <svg class="app-icon"><use href="#icon-trash"/></svg>
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-sm" onclick="startSurahDownload(${s.number})" id="btnDlSurah-${s.number}">
                                <svg class="app-icon"><use href="#icon-download"/></svg> Download
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="playVerseAudioDirect(${s.number}, 1, false)">
                                <svg class="app-icon"><use href="#icon-play"/></svg> Stream
                            </button>
                        `}
                    </div>
                    <div class="surah-dl-progress-bar" id="progressBar-${s.number}">
                        <div class="surah-dl-progress-fill" id="progressFill-${s.number}"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.startSurahDownload = function (surahNum) {
        const reciterId = appState.currentReciter;
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        const btn = document.getElementById(`btnDlSurah-${surahNum}`);
        const bar = document.getElementById(`progressBar-${surahNum}`);
        const fill = document.getElementById(`progressFill-${surahNum}`);

        if (btn) btn.disabled = true;
        if (bar) bar.style.display = 'block';
        showToast(`Downloading ${meta ? meta.name : 'Surah ' + surahNum} audio...`);

        window.QuranDownloadManager.downloadSurahAudio(
            reciterId,
            surahNum,
            (_loaded, _total, percent) => {
                if (fill) fill.style.width = `${percent}%`;
            },
            async () => {
                showToast(`${meta ? meta.name : 'Surah'} saved for offline playback.`, 'success');
                await initDownloadsUI();
            },
            (err) => {
                showToast(`Download failed: ${err.message}`, 'error');
                if (btn) btn.disabled = false;
                if (bar) bar.style.display = 'none';
            }
        );
    };

    window.deleteSurahAudio = async function (surahNum) {
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        const confirmed = await showAppConfirm({
            title: 'Remove Offline Surah',
            message: `Remove downloaded offline audio for Surah ${meta ? meta.name : surahNum}?`,
            confirmText: 'Remove',
            dangerous: true
        });
        if (confirmed) {
            await window.OfflineStorageEngine.deleteSurahAudio(appState.currentReciter, surahNum);
            showToast(`Removed offline audio for ${meta ? meta.name : 'Surah'}`);
            await initDownloadsUI();
        }
    };

    function renderTranslationsList() {
        if (!dom.translationsDlContainer) return;
        const translations = [
            { id: '20', name: 'English (Sahih Intl)', lang: 'English', size: 'Bundled', desc: 'Built-in clear English translation embedded for offline reading.' },
            { id: '161', name: 'Bengali (Zakaria)', lang: 'Bengali', size: 'Bundled', desc: 'Abu Bakr Muhammad Zakaria complete offline Bengali translation.' },
            { id: '97', name: 'Urdu (Ahmed Ali)', lang: 'Urdu', size: 'Bundled', desc: 'Classical Urdu translation by Maulana Ahmed Ali, ready offline.' },
            { id: '234', name: 'French (Hamidullah)', lang: 'French', size: 'Bundled', desc: 'Muhammad Hamidullah scholarly French translation, ready offline.' }
        ];
        dom.translationsDlContainer.innerHTML = translations.map((t) => {
            const isActive = t.id === '20'
                ? appState.alwaysEnglish
                : appState.selectedTranslation === t.id;
            return `
                <div class="reciter-card ${isActive ? 'active' : ''}">
                    <div class="reciter-header">
                        <div class="reciter-icon"><svg class="app-icon"><use href="#icon-book-open"/></svg></div>
                        <div class="reciter-names">
                            <h4>${escapeHtml(t.name)}</h4>
                            <div class="reciter-style">${escapeHtml(t.lang)} · ${escapeHtml(t.size)}</div>
                        </div>
                    </div>
                    <p style="font-size: 0.84rem; color: var(--text-secondary);">${escapeHtml(t.desc)}</p>
                    <div class="reciter-card-actions">
                        <span class="reciter-badge downloaded">${isActive ? 'Active Offline' : 'Built-In Offline'}</span>
                        <button type="button" class="btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}" onclick="useOfflineTranslation('${t.id}', '${escapeHtml(t.name)}')">
                            ${isActive ? 'Open Reader' : 'Use in Reader'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function safeSlugDomId(slug) {
        return String(slug || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    function formatBytesMb(bytes) {
        if (!bytes || bytes <= 0) return '0 MB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    window.setTafsirDlFilter = function (filter) {
        appState.tafsirDlFilter = filter === 'installed' ? 'installed' : 'all';
        dom.tafsirFilterAllBtn?.classList.toggle('active', appState.tafsirDlFilter === 'all');
        dom.tafsirFilterInstalledBtn?.classList.toggle('active', appState.tafsirDlFilter === 'installed');
        renderTafsirList();
    };

    window.refreshTafsirCatalogList = async function () {
        if (!window.TafsirManager) return;
        const btn = dom.tafsirRefreshCatalogBtn;
        if (btn) {
            btn.disabled = true;
            const sp = btn.querySelector('span');
            if (sp) sp.textContent = 'Refreshing...';
        }
        try {
            await window.TafsirManager.refreshCatalogFromApi();
            await renderTafsirList();
            await populateTafsirEditionSelect();
            showToast('Tafsir language catalog updated.', 'success');
        } catch (_) {
            showToast('Offline or API unavailable; showing cached catalog.', 'info');
        } finally {
            if (btn) {
                btn.disabled = false;
                const sp = btn.querySelector('span');
                if (sp) sp.textContent = 'Refresh Catalog';
            }
        }
    };

    window.startTafsirEditionDownload = async function (slug) {
        if (!window.TafsirManager) return;
        const ed = window.TafsirManager.getEdition(slug);
        const sid = safeSlugDomId(slug);
        showToast(`Downloading ${ed ? ed.name : slug} for offline reading...`);
        renderTafsirList();

        try {
            await window.TafsirManager.downloadEdition(slug, (prog) => {
                const fill = document.getElementById(`tafsirProgFill-${sid}`);
                const bar = document.getElementById(`tafsirProgBar-${sid}`);
                const meta = document.getElementById(`tafsirProgMeta-${sid}`);
                const badge = document.getElementById(`tafsirStatusBadge-${sid}`);
                if (bar) bar.style.display = 'block';
                if (fill) fill.style.width = `${prog.pct || 0}%`;
                if (meta) {
                    meta.style.display = 'block';
                    meta.textContent = prog.state === 'error'
                        ? `Error (${prog.done}/114): ${prog.error || 'Network error'}`
                        : `Surah ${prog.surahNum || prog.done}/114 · ${prog.pct || 0}%`;
                }
                if (badge) {
                    badge.className = 'reciter-badge cloud';
                    badge.textContent = `${prog.done}/114`;
                }
            });
            await renderTafsirList();
            await populateTafsirEditionSelect();
            updateStorageBadge();
            if (ed) showToast(`${ed.name} ready offline.`, 'success');
        } catch (err) {
            showToast(`Tafsir download paused: ${err && err.message ? err.message : 'Check connection'}`, 'error');
            await renderTafsirList();
        }
    };

    window.pauseTafsirEditionDownload = function (slug) {
        if (!window.TafsirManager) return;
        window.TafsirManager.pauseDownload(slug);
        showToast('Pausing tafsir download after active surah...');
    };

    window.deleteDownloadedTafsir = async function (slug) {
        if (!window.TafsirManager) return;
        const ed = window.TafsirManager.getEdition(slug);
        const confirmed = await showAppConfirm({
            title: 'Remove Offline Tafsir',
            message: `Remove cached chapters for ${ed ? ed.name : slug} from device storage?`,
            confirmText: 'Remove',
            dangerous: true
        });
        if (!confirmed) return;
        await window.TafsirManager.deleteEdition(slug);
        if (appState.tafsirSource === slug) {
            appState.tafsirSource = 'ibn-kathir';
            localStorage.setItem('quran_tafsir_source', 'ibn-kathir');
        }
        await renderTafsirList();
        await populateTafsirEditionSelect();
        updateStorageBadge();
        showToast('Removed offline tafsir edition.');
    };

    window.openDownloadedTafsir = function (slug, name) {
        appState.tafsirSource = slug;
        localStorage.setItem('quran_tafsir_source', slug);
        window.showSection('tafsir');
        if (name) showToast(`Opened ${name}`, 'success');
    };

    window.openTafsirDownloads = function () {
        window.showSection('downloads');
        window.switchDownloadsTab('tafsir');
    };

    async function renderTafsirList() {
        if (!dom.tafsirDlContainer) return;
        if (!window.TafsirManager) {
            dom.tafsirDlContainer.innerHTML = '';
            return;
        }

        const groups = window.TafsirManager.getGroupedCatalog();
        const statuses = await window.TafsirManager.getAllEditionStatuses();
        const q = (appState.tafsirDlSearch || '').trim().toLowerCase();
        const filterInstalled = appState.tafsirDlFilter === 'installed';

        let html = '';
        if (!filterInstalled && !q) {
            html += `
                <div class="tafsir-lang-group">
                    <div class="tafsir-lang-header">
                        <div class="tafsir-lang-title">
                            <span class="tafsir-lang-letter"><svg class="app-icon"><use href="#icon-book"/></svg></span>
                            <span>Built-In Quick Classics (Always Offline)</span>
                        </div>
                        <span class="search-count-pill">3</span>
                    </div>
                    <div class="tafsir-edition-grid">
                        ${BUILTIN_TAFSIRS.map((t) => {
                            const isActive = appState.tafsirSource === t.slug;
                            return `
                                <div class="reciter-card ${isActive ? 'active' : ''}">
                                    <div class="reciter-header">
                                        <div class="reciter-icon"><svg class="app-icon"><use href="#icon-book"/></svg></div>
                                        <div class="reciter-names">
                                            <h4>${escapeHtml(t.name)}</h4>
                                            <div class="reciter-style">${escapeHtml(t.author)} · Bundled</div>
                                        </div>
                                    </div>
                                    <div class="reciter-card-actions">
                                        <span class="reciter-badge downloaded">${isActive ? 'Active Offline' : 'Built-In'}</span>
                                        <button type="button" class="btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}" onclick="openOfflineTafsir('${t.slug}', '${escapeHtml(t.name)}')">
                                            ${isActive ? 'Open Reader' : 'Select'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        let matchedGroups = 0;
        groups.forEach((group) => {
            const filteredEditions = group.editions.filter((ed) => {
                const st = statuses[ed.slug] || {};
                const doneCount = Number(st.downloadedSurahsCount || 0);
                if (filterInstalled && doneCount <= 0) return false;
                if (q) {
                    const hay = `${group.language} ${ed.name} ${ed.author} ${ed.slug}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                }
                return true;
            });

            if (!filteredEditions.length) return;
            matchedGroups++;

            html += `
                <div class="tafsir-lang-group">
                    <div class="tafsir-lang-header">
                        <div class="tafsir-lang-title">
                            <span class="tafsir-lang-letter">${escapeHtml(group.letter)}</span>
                            <span>${escapeHtml(group.language)}</span>
                        </div>
                        <span class="search-count-pill">${filteredEditions.length}</span>
                    </div>
                    <div class="tafsir-edition-grid">
                        ${filteredEditions.map((ed) => {
                            const sid = safeSlugDomId(ed.slug);
                            const st = statuses[ed.slug] || {};
                            const doneCount = Number(st.downloadedSurahsCount || 0);
                            const state = st.state || (doneCount >= 114 ? 'installed' : (doneCount > 0 ? 'paused' : 'available'));
                            const isActive = appState.tafsirSource === ed.slug;
                            const pct = Math.min(100, Math.round((doneCount / 114) * 100));
                            const showProg = state === 'downloading' || (doneCount > 0 && doneCount < 114);
                            const sizeText = st.byteSize > 0 ? formatBytesMb(st.byteSize) : (ed.sizeEstimate || '8 MB');

                            let badgeHtml = `<span id="tafsirStatusBadge-${sid}" class="reciter-badge cloud">${escapeHtml(ed.language)} · ${escapeHtml(sizeText)}</span>`;
                            if (state === 'installed' || doneCount >= 114) {
                                badgeHtml = `<span id="tafsirStatusBadge-${sid}" class="reciter-badge downloaded">Installed (${escapeHtml(sizeText)})</span>`;
                            } else if (state === 'downloading') {
                                badgeHtml = `<span id="tafsirStatusBadge-${sid}" class="reciter-badge cloud">Downloading ${doneCount}/114</span>`;
                            } else if (state === 'paused' && doneCount > 0) {
                                badgeHtml = `<span id="tafsirStatusBadge-${sid}" class="reciter-badge cloud">Paused ${doneCount}/114</span>`;
                            } else if (state === 'error') {
                                badgeHtml = `<span id="tafsirStatusBadge-${sid}" class="reciter-badge cloud" style="color:var(--danger);">Retry (${doneCount}/114)</span>`;
                            }

                            let actionsHtml = '';
                            if (state === 'downloading') {
                                actionsHtml = `
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="pauseTafsirEditionDownload('${ed.slug}')">
                                        <svg class="app-icon"><use href="#icon-pause"/></svg> Pause
                                    </button>
                                `;
                            } else if (doneCount >= 114 || state === 'installed') {
                                actionsHtml = `
                                    <button type="button" class="btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}" onclick="openDownloadedTafsir('${ed.slug}', '${escapeHtml(ed.name)}')">
                                        Read
                                    </button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="deleteDownloadedTafsir('${ed.slug}')" title="Delete offline tafsir" aria-label="Delete ${escapeHtml(ed.name)}">
                                        <svg class="app-icon"><use href="#icon-trash"/></svg>
                                    </button>
                                `;
                            } else if (doneCount > 0) {
                                actionsHtml = `
                                    <button type="button" class="btn btn-primary btn-sm" onclick="startTafsirEditionDownload('${ed.slug}')">
                                        <svg class="app-icon"><use href="#icon-download"/></svg> ${state === 'error' ? 'Retry' : 'Resume'} (${doneCount}/114)
                                    </button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="deleteDownloadedTafsir('${ed.slug}')" title="Remove partial cache" aria-label="Remove partial cache">
                                        <svg class="app-icon"><use href="#icon-trash"/></svg>
                                    </button>
                                `;
                            } else {
                                actionsHtml = `
                                    <button type="button" class="btn btn-primary btn-sm" onclick="startTafsirEditionDownload('${ed.slug}')">
                                        <svg class="app-icon"><use href="#icon-download"/></svg> Download
                                    </button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="openDownloadedTafsir('${ed.slug}', '${escapeHtml(ed.name)}')">
                                        Read
                                    </button>
                                `;
                            }

                            return `
                                <div class="reciter-card ${isActive ? 'active' : ''}">
                                    <div class="reciter-header">
                                        <div class="reciter-icon"><svg class="app-icon"><use href="#icon-book"/></svg></div>
                                        <div class="reciter-names">
                                            <h4>${escapeHtml(ed.name)}</h4>
                                            <div class="reciter-style">${escapeHtml(ed.author)} · ${escapeHtml(ed.language)}</div>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.42;">${escapeHtml(ed.desc || '')}</p>
                                    <div id="tafsirProgBar-${sid}" class="surah-dl-progress-bar" style="display: ${showProg ? 'block' : 'none'}; margin-top: 2px;">
                                        <div id="tafsirProgFill-${sid}" class="surah-dl-progress-fill" style="width: ${pct}%;"></div>
                                    </div>
                                    <div id="tafsirProgMeta-${sid}" style="font-size: 0.74rem; color: var(--gold); display: ${showProg ? 'block' : 'none'};">
                                        ${state === 'error' ? escapeHtml(st.error || 'Download interrupted') : `${doneCount} / 114 Surahs (${pct}%)`}
                                    </div>
                                    <div class="reciter-card-actions">
                                        ${badgeHtml}
                                        <div style="display: flex; gap: 6px; align-items: center;">
                                            ${actionsHtml}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        if (matchedGroups === 0) {
            html += `
                <div class="card" style="text-align: center; padding: 22px;">
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                        ${filterInstalled ? 'No downloaded Tafsir editions yet' : 'No Tafsir editions match your search'}
                    </div>
                    <div style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 12px;">
                        ${filterInstalled ? 'Browse All Languages to download Bangla, Arabic, English, Indonesian, or Urdu tafsir editions for offline study.' : 'Try searching for Bangla, Arabic, English, Urdu, or reset your filter.'}
                    </div>
                    <button type="button" class="btn btn-primary btn-sm" onclick="setTafsirDlFilter('all')">Show All Languages</button>
                </div>
            `;
        }

        dom.tafsirDlContainer.innerHTML = html;
    }

    window.useOfflineTranslation = function (transId, name) {
        if (transId === '20') {
            appState.alwaysEnglish = true;
            localStorage.setItem('quran_always_english', 'true');
            if (dom.quickAlwaysEnglishToggle) dom.quickAlwaysEnglishToggle.classList.add('active');
        } else {
            appState.selectedTranslation = transId;
            localStorage.setItem('quran_translation', transId);
            if (dom.quickTranslationSelect) dom.quickTranslationSelect.value = transId;
        }
        renderTranslationsList();
        window.loadSurah(appState.currentSurah, true, appState.currentVerse);
        showToast(`${name} enabled in Reader`, 'success');
    };

    window.openOfflineTafsir = function (sourceId, name) {
        appState.tafsirSource = sourceId;
        localStorage.setItem('quran_tafsir_source', sourceId);
        renderTafsirList();
        window.showSection('tafsir');
        showToast(`Opened ${name}`, 'success');
    };

    async function updateStorageBadge() {
        if (!dom.storageUsageBadge || !window.OfflineStorageEngine) return;
        try {
            dom.storageUsageBadge.textContent = await window.OfflineStorageEngine.calculateStorageUsage();
        } catch (_) {
            dom.storageUsageBadge.textContent = '0.0 MB';
        }
    }

    // ========== WORD BY WORD & TAFSIR ==========
    function getVerseWords(surah, verse) {
        const v = window.OfflineQuranDB.getVerseByKey(`${surah}:${verse}`);
        const meta = window.OfflineQuranDB.getSurahMeta(surah);
        if (v && v.words && v.words.length > 0) return v.words;
        if (v && v.text_uthmani) {
            const cleanText = String(v.text_uthmani).replace(/(?:\s*﴿[^﴾]*﴾|\s*\(\d+\)|\s*\u06DD[\d\u0660-\u0669]*)+$/g, '').trim();
            return cleanText.split(/\s+/).filter(Boolean).map((w, idx) => ({
                text_uthmani: w,
                transliteration: `Word ${idx + 1}`,
                translation: `${meta ? meta.name : 'Surah'} ${surah}:${verse}`
            }));
        }
        return [];
    }

    window.playWbwWordAudio = async function (surah, verse, wordIndex, wordElem) {
        if (!window.WordAudioEngine) return;
        document.querySelectorAll('.word-item.word-playing').forEach((el) => el.classList.remove('word-playing'));
        if (wordElem) wordElem.classList.add('word-playing');
        try {
            await window.WordAudioEngine.playWord(surah, verse, wordIndex, wordElem || null, () => {
                if (wordElem) wordElem.classList.remove('word-playing');
            });
        } catch (_) {
            if (wordElem) wordElem.classList.remove('word-playing');
        }
    };

    window.togglePlayAyahWords = async function (surah, verse, totalWords) {
        if (!window.WordAudioEngine) return;
        const buttons = [
            document.getElementById('btnPlayAllWords'),
            document.getElementById(`btnPlayAllWords-${surah}-${verse}`)
        ].filter(Boolean);

        if (wbwSequenceActive) {
            window.WordAudioEngine.stopSequence();
            wbwSequenceActive = false;
            buttons.forEach((b) => { b.innerHTML = `<svg class="app-icon"><use href="#icon-play"/></svg> Play Words`; });
            document.querySelectorAll('.word-item.word-playing').forEach((el) => el.classList.remove('word-playing'));
            return;
        }

        wbwSequenceActive = true;
        buttons.forEach((b) => { b.innerHTML = `<svg class="app-icon"><use href="#icon-pause"/></svg> Stop`; });

        window.WordAudioEngine.playAyahWords(
            surah,
            verse,
            totalWords,
            (wordIdx) => {
                document.querySelectorAll('.word-item.word-playing').forEach((el) => el.classList.remove('word-playing'));
                const targetCard = document.getElementById(`wbw-word-${surah}-${verse}-${wordIdx}`);
                if (targetCard) {
                    targetCard.classList.add('word-playing');
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            },
            () => {
                wbwSequenceActive = false;
                buttons.forEach((b) => { b.innerHTML = `<svg class="app-icon"><use href="#icon-play"/></svg> Play Words`; });
                document.querySelectorAll('.word-item.word-playing').forEach((el) => el.classList.remove('word-playing'));
            }
        );
    };

    window.changeWbwRate = function (surah, verse) {
        if (!window.WordAudioEngine) return;
        const rates = [1.0, 0.75, 1.25];
        const current = window.WordAudioEngine.playbackRate || 1.0;
        const nextRate = rates[(rates.indexOf(current) + 1) % rates.length];
        window.WordAudioEngine.setRate(nextRate);

        const rateButtons = [
            document.getElementById('btnWbwRate'),
            surah && verse ? document.getElementById(`btnWbwRate-${surah}-${verse}`) : null
        ].filter(Boolean);
        rateButtons.forEach((b) => { b.textContent = `${nextRate}x Speed`; });
        showToast(`Word speed: ${nextRate}x`);
    };

    window.downloadCurrentSurahWbwWords = async function (surah) {
        if (!window.WordAudioEngine) return;
        const meta = window.OfflineQuranDB.getSurahMeta(surah);
        const btn = document.getElementById('btnDlWbwSurah');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Saving...';
        }
        try {
            const counts = [];
            const maxV = meta ? meta.verses : 7;
            for (let v = 1; v <= maxV; v++) {
                counts.push(getVerseWords(surah, v).length || 4);
            }
            await window.WordAudioEngine.downloadSurahWords(surah, counts, (done, total, pct) => {
                if (btn) btn.textContent = `${pct}% (${done}/${total})`;
            });
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<svg class="app-icon"><use href="#icon-check"/></svg> Words Saved`;
            }
            showToast(`Word audio saved for ${meta ? meta.name : 'Surah ' + surah}`, 'success');
        } catch (e) {
            showToast('Failed to download word audio: ' + e.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<svg class="app-icon"><use href="#icon-download"/></svg> Offline Words`;
            }
        }
    };

    window.closeInlineDrawer = function (surah, verse, type) {
        const drawer = document.getElementById(`inline-${type}-${surah}-${verse}`);
        const btn = document.getElementById(`btn-${type}-${surah}-${verse}`);
        if (drawer) {
            drawer.style.display = 'none';
            drawer.innerHTML = '';
        }
        if (btn) btn.classList.remove('active-action-btn');
        if (type === 'wbw' && wbwSequenceActive) {
            window.WordAudioEngine?.stopSequence();
            wbwSequenceActive = false;
        }
    };

    function getWordDisplayArabicHtml(w) {
        if (!w) return '';
        const script = normalizeScriptName(appState.currentScript);
        const raw = script === 'indopak'
            ? (w.text_indopak || w.text_uthmani || '')
            : script === 'imlaei'
                ? (w.text_imlaei || w.text_uthmani || '')
                : (w.text_uthmani || w.text_indopak || w.text_imlaei || '');
        return applyClientTajweedHtml(raw, !appState.tajweedEnabled, script);
    }

    window.toggleInlineWbw = async function (surah, verse) {
        const s = Number(surah);
        const v = Number(verse);
        const drawer = document.getElementById(`inline-wbw-${s}-${v}`);
        const btn = document.getElementById(`btn-wbw-${s}-${v}`);
        if (!drawer) {
            window.openVerseWbw(s, v);
            return;
        }
        window.closeInlineDrawer(s, v, 'tafsir');
        if (drawer.style.display !== 'none' && drawer.innerHTML.trim() !== '') {
            window.closeInlineDrawer(s, v, 'wbw');
            return;
        }

        drawer.style.display = 'block';
        if (btn) btn.classList.add('active-action-btn');

        if (!window.OfflineQuranDB.hasAuthenticVerse(s, v) && window.QuranTextHydrator) {
            drawer.innerHTML = `
                <div class="inline-drawer-header">
                    <div class="inline-drawer-title">
                        <svg class="app-icon"><use href="#icon-font"/></svg>
                        <span>Word by Word (${s}:${v})</span>
                    </div>
                    <button class="inline-drawer-close" onclick="closeInlineDrawer(${s}, ${v}, 'wbw')" aria-label="Close">
                        <svg class="app-icon"><use href="#icon-times"/></svg>
                    </button>
                </div>
                <div class="wbw-status-card" style="padding: 16px;">
                    <div style="font-size: 0.86rem;">Loading word-by-word analysis for ${s}:${v}...</div>
                </div>
            `;
            try {
                await window.QuranTextHydrator.fetchVerseWithWords(s, v);
            } catch (_) {
                if (drawer.style.display === 'none') return;
                drawer.innerHTML = `
                    <div class="inline-drawer-header">
                        <div class="inline-drawer-title">
                            <svg class="app-icon"><use href="#icon-font"/></svg>
                            <span>Word by Word (${s}:${v})</span>
                        </div>
                        <button class="inline-drawer-close" onclick="closeInlineDrawer(${s}, ${v}, 'wbw')" aria-label="Close">
                            <svg class="app-icon"><use href="#icon-times"/></svg>
                        </button>
                    </div>
                    <div class="wbw-status-card" style="padding: 16px;">
                        <div style="font-weight: 700; color: var(--gold);">Verse words require a brief online fetch once</div>
                        <div style="font-size: 0.82rem; color: var(--text-secondary);">Once loaded, ${s}:${v} is cached offline on this device.</div>
                        <button type="button" class="btn btn-primary btn-sm" onclick="closeInlineDrawer(${s}, ${v}, 'wbw'); toggleInlineWbw(${s}, ${v});">Retry Online</button>
                    </div>
                `;
                return;
            }
            if (drawer.style.display === 'none') return;
        }

        const words = getVerseWords(s, v);
        const rate = (window.WordAudioEngine && window.WordAudioEngine.playbackRate) || 1.0;

        drawer.innerHTML = `
            <div class="inline-drawer-header">
                <div class="inline-drawer-title">
                    <svg class="app-icon"><use href="#icon-font"/></svg>
                    <span>Word by Word (${words.length} Words)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" id="btnWbwRate-${s}-${v}" onclick="changeWbwRate(${s}, ${v})">${rate}x Speed</button>
                    <button class="btn btn-primary btn-sm" id="btnPlayAllWords-${s}-${v}" onclick="togglePlayAyahWords(${s}, ${v}, ${words.length})">
                        <svg class="app-icon"><use href="#icon-play"/></svg> Play Words
                    </button>
                    <button class="inline-drawer-close" onclick="closeInlineDrawer(${s}, ${v}, 'wbw')" aria-label="Close">
                        <svg class="app-icon"><use href="#icon-times"/></svg>
                    </button>
                </div>
            </div>
            <div class="inline-wbw-grid">
                ${words.map((w, idx) => `
                    <div class="word-item" id="wbw-word-${s}-${v}-${idx + 1}" onclick="playWbwWordAudio(${s}, ${v}, ${idx + 1}, this)">
                        <div class="word-card-top">
                            <span class="word-idx-badge">#${idx + 1}</span>
                            <span class="word-audio-play-icon"><svg class="app-icon"><use href="#icon-play"/></svg></span>
                        </div>
                        <div class="word-arabic ${getActiveTajweedClass()}">${getWordDisplayArabicHtml(w)}</div>
                        <div class="word-transliteration">${escapeHtml(w.transliteration || '')}</div>
                        <div class="word-translation">${escapeHtml(w.translation || '')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    };

    function getLangAttrForTafsir(language) {
        const l = String(language || '').toLowerCase();
        if (l === 'bangla' || l === 'bengali') return 'bn';
        if (l === 'arabic') return 'ar';
        if (l === 'urdu') return 'ur';
        if (l === 'indonesian') return 'id';
        if (l === 'russian') return 'ru';
        if (l === 'kurdish') return 'ku';
        if (l === 'turkish') return 'tr';
        return 'en';
    }

    async function populateTafsirEditionSelect() {
        const selects = [dom.tafsirEditionSelect, dom.settingsDefaultTafsirSelect].filter(Boolean);
        if (!selects.length) return;
        const statuses = window.TafsirManager ? await window.TafsirManager.getAllEditionStatuses() : {};
        const groups = window.TafsirManager ? window.TafsirManager.getGroupedCatalog() : [];

        const installedEditions = [];
        groups.forEach((g) => {
            g.editions.forEach((ed) => {
                const st = statuses[ed.slug];
                if (st && st.downloadedSurahsCount > 0) {
                    installedEditions.push({ ...ed, doneCount: st.downloadedSurahsCount });
                }
            });
        });

        let html = '<optgroup label="Built-In Offline Classics">';
        BUILTIN_TAFSIRS.forEach((t) => {
            html += `<option value="${t.slug}">${escapeHtml(t.name)}</option>`;
        });
        html += '</optgroup>';

        if (installedEditions.length) {
            html += '<optgroup label="Downloaded Offline Editions">';
            installedEditions.forEach((ed) => {
                html += `<option value="${ed.slug}">${escapeHtml(ed.language)} — ${escapeHtml(ed.name)} (${ed.doneCount}/114)</option>`;
            });
            html += '</optgroup>';
        }

        groups.forEach((g) => {
            html += `<optgroup label="${escapeHtml(g.language)}">`;
            g.editions.forEach((ed) => {
                const st = statuses[ed.slug];
                const tag = (st && st.downloadedSurahsCount >= 114) ? ' [Offline]' : '';
                html += `<option value="${ed.slug}">${escapeHtml(ed.name)}${tag}</option>`;
            });
            html += '</optgroup>';
        });

        selects.forEach((sel) => {
            sel.innerHTML = html;
            sel.value = appState.tafsirSource || 'ibn-kathir';
            if (sel.value !== appState.tafsirSource) {
                sel.value = 'ibn-kathir';
            }
        });
    }

    async function resolveTafsirEntry(slug, surah, verse) {
        const builtIn = BUILTIN_TAFSIRS.find((b) => b.slug === slug);
        if (builtIn || !window.TafsirManager) {
            const target = builtIn || BUILTIN_TAFSIRS[0];
            return {
                slug: target.slug,
                name: target.name,
                language: target.language,
                dir: 'ltr',
                text: window.OfflineQuranDB.getTafsir(surah, verse, target.slug),
                isOffline: true,
                missingOffline: false
            };
        }

        const ed = window.TafsirManager.getEdition(slug);
        if (!ed) {
            return resolveTafsirEntry('ibn-kathir', surah, verse);
        }

        const cachedText = await window.TafsirManager.getVerseTafsir(slug, surah, verse);
        if (cachedText) {
            return {
                slug: ed.slug,
                name: ed.name,
                language: ed.language,
                dir: ed.dir || 'ltr',
                text: cachedText,
                isOffline: true,
                missingOffline: false
            };
        }

        try {
            const chapterMap = await window.TafsirManager.fetchSingleSurahOnDemand(slug, surah);
            if (chapterMap && chapterMap[String(verse)]) {
                return {
                    slug: ed.slug,
                    name: ed.name,
                    language: ed.language,
                    dir: ed.dir || 'ltr',
                    text: chapterMap[String(verse)],
                    isOffline: false,
                    missingOffline: false
                };
            }
        } catch (_) {}

        return {
            slug: ed.slug,
            name: ed.name,
            language: ed.language,
            dir: ed.dir || 'ltr',
            text: '',
            isOffline: false,
            missingOffline: true
        };
    }

    window.toggleInlineTafsir = async function (surah, verse, sourceId, forceRefresh = false) {
        const src = sourceId || appState.tafsirSource || 'ibn-kathir';
        if (sourceId) {
            appState.tafsirSource = sourceId;
            localStorage.setItem('quran_tafsir_source', sourceId);
        }
        const drawer = document.getElementById(`inline-tafsir-${surah}-${verse}`);
        const btn = document.getElementById(`btn-tafsir-${surah}-${verse}`);
        if (!drawer) return;

        window.closeInlineDrawer(surah, verse, 'wbw');
        if (!forceRefresh && drawer.style.display !== 'none' && drawer.innerHTML.trim() !== '') {
            window.closeInlineDrawer(surah, verse, 'tafsir');
            return;
        }

        const meta = window.OfflineQuranDB.getSurahMeta(surah);
        const statuses = window.TafsirManager ? await window.TafsirManager.getAllEditionStatuses() : {};
        const groups = window.TafsirManager ? window.TafsirManager.getGroupedCatalog() : [];

        let selectHtml = BUILTIN_TAFSIRS.map((t) =>
            `<option value="${t.slug}" ${src === t.slug ? 'selected' : ''}>${escapeHtml(t.name)}</option>`
        ).join('');
        groups.forEach((g) => {
            selectHtml += `<optgroup label="${escapeHtml(g.language)}">`;
            g.editions.forEach((ed) => {
                const st = statuses[ed.slug];
                const mark = (st && st.downloadedSurahsCount > 0) ? ' [Offline]' : '';
                selectHtml += `<option value="${ed.slug}" ${src === ed.slug ? 'selected' : ''}>${escapeHtml(ed.name)}${mark}</option>`;
            });
            selectHtml += '</optgroup>';
        });

        drawer.innerHTML = `
            <div class="inline-drawer-header">
                <div class="inline-drawer-title">
                    <svg class="app-icon"><use href="#icon-book"/></svg>
                    <span>Commentary (${escapeHtml(meta ? meta.name : '')} ${surah}:${verse})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <select class="form-select" style="width: auto; max-width: 220px; padding: 5px 8px; font-size: 0.78rem;" onchange="toggleInlineTafsir(${surah}, ${verse}, this.value, true)" aria-label="Choose Tafsir Edition">
                        ${selectHtml}
                    </select>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openTafsirDownloads()" title="Download Bangla and other language tafsirs">
                        <svg class="app-icon"><use href="#icon-download"/></svg> More Languages
                    </button>
                    <button class="inline-drawer-close" onclick="closeInlineDrawer(${surah}, ${verse}, 'tafsir')" aria-label="Close">
                        <svg class="app-icon"><use href="#icon-times"/></svg>
                    </button>
                </div>
            </div>
            <div class="inline-tafsir-content" id="inline-tafsir-body-${surah}-${verse}">
                <div style="color: var(--text-muted); font-size: 0.86rem;">Loading commentary...</div>
            </div>
        `;
        drawer.style.display = 'block';
        if (btn) btn.classList.add('active-action-btn');

        const entry = await resolveTafsirEntry(src, surah, verse);
        const bodyEl = document.getElementById(`inline-tafsir-body-${surah}-${verse}`);
        if (!bodyEl) return;

        if (entry.missingOffline) {
            bodyEl.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="font-weight: 700; color: var(--gold);">${escapeHtml(entry.name)} (${escapeHtml(entry.language)}) is not cached offline yet.</div>
                    <div style="font-size: 0.84rem; color: var(--text-secondary);">Download this edition once in Downloads -> Tafsir to read every verse offline, or switch to a built-in edition above.</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="openTafsirDownloads()">Download in Library</button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="toggleInlineTafsir(${surah}, ${verse}, 'ibn-kathir', true)">Use Built-In Ibn Kathir</button>
                    </div>
                </div>
            `;
        } else {
            const langAttr = getLangAttrForTafsir(entry.language);
            bodyEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                    <span class="loc-meta-text" style="color: var(--gold); font-weight: 700;">${escapeHtml(entry.name)}</span>
                    <span class="reciter-badge ${entry.isOffline ? 'downloaded' : 'cloud'}">${entry.isOffline ? 'Offline' : 'Cached Now'}</span>
                </div>
                <p class="tafsir-body-text" dir="${escapeHtml(entry.dir)}" lang="${escapeHtml(langAttr)}" style="margin: 0;">${escapeHtml(entry.text)}</p>
            `;
        }
    };

    window.openVerseWbw = function (surah, verse) {
        appState.currentSurah = Number(surah) || 1;
        appState.currentVerse = Number(verse) || 1;
        window.showSection('wordbyword');
    };

    function populateWbwVerseDropdown(surahNum, activeVerse) {
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        if (!meta || !dom.wbwVerseSelect) return 1;
        let opts = '';
        for (let i = 1; i <= meta.verses; i++) opts += `<option value="${i}">${i}</option>`;
        dom.wbwVerseSelect.innerHTML = opts;
        const clampedV = Math.max(1, Math.min(meta.verses, Number(activeVerse) || 1));
        dom.wbwVerseSelect.value = String(clampedV);
        return clampedV;
    }

    function updateWbwStepButtons(surahNum, verseNum) {
        const s = Number(surahNum) || 1;
        const v = Number(verseNum) || 1;
        if (dom.wbwPrevVerseBtn) dom.wbwPrevVerseBtn.disabled = (s <= 1 && v <= 1);
        if (dom.wbwNextVerseBtn) {
            const meta = window.OfflineQuranDB.getSurahMeta(114);
            dom.wbwNextVerseBtn.disabled = (s >= 114 && meta && v >= meta.verses);
        }
    }

    function setWbwSurahVerse(surah, verse, stopExistingAudio = true) {
        const s = Math.max(1, Math.min(114, Number(surah) || 1));
        const meta = window.OfflineQuranDB.getSurahMeta(s);
        const maxV = meta ? meta.verses : 7;
        const v = Math.max(1, Math.min(maxV, Number(verse) || 1));

        if (window.WordAudioEngine) {
            window.WordAudioEngine.stop();
        }
        wbwSequenceActive = false;

        if (stopExistingAudio && appState.isPlaying) {
            window.UnifiedAudioEngine?.stop();
            appState.isPlaying = false;
            if (dom.playIcon) dom.playIcon.innerHTML = `<use href="#icon-play"/>`;
        }

        appState.currentSurah = s;
        appState.currentVerse = v;
        localStorage.setItem('quran_session', JSON.stringify({ surah: s, verse: v }));

        if (dom.wbwSurahSelect) dom.wbwSurahSelect.value = String(s);
        populateWbwVerseDropdown(s, v);
        if (dom.readSurahSelect) dom.readSurahSelect.value = String(s);
        if (dom.quickSurahSelect) dom.quickSurahSelect.value = String(s);

        syncAudioBarSummary(s, v);
        updateContinueReading();
        updateWbwStepButtons(s, v);
        renderWbwView(s, v);
    }

    window.stepWbwVerse = function (delta) {
        let s = Number(dom.wbwSurahSelect?.value || appState.currentSurah || 1);
        let v = Number(dom.wbwVerseSelect?.value || appState.currentVerse || 1);
        const meta = window.OfflineQuranDB.getSurahMeta(s);
        const maxV = meta ? meta.verses : 7;

        v += delta;
        if (v < 1) {
            if (s > 1) {
                s -= 1;
                const prevMeta = window.OfflineQuranDB.getSurahMeta(s);
                v = prevMeta ? prevMeta.verses : 1;
            } else {
                v = 1;
            }
        } else if (v > maxV) {
            if (s < 114) {
                s += 1;
                v = 1;
            } else {
                v = maxV;
            }
        }
        setWbwSurahVerse(s, v, true);
    };

    window.retryWbwHydration = function (surah, verse) {
        setWbwSurahVerse(surah, verse, false);
    };

    function initWordByWordView() {
        if (!dom.wbwSurahSelect || !dom.wbwVerseSelect) return;
        const s = Number(appState.currentSurah || 1);
        const v = Number(appState.currentVerse || 1);
        setWbwSurahVerse(s, v, false);
    }

    function renderWbwView(surah, verse) {
        if (!dom.wbwContainer) return;
        const s = Number(surah) || 1;
        const v = Number(verse) || 1;
        const meta = window.OfflineQuranDB.getSurahMeta(s);
        const loc = window.OfflineQuranDB.getVerseLocation(s, v);
        const rate = (window.WordAudioEngine && window.WordAudioEngine.playbackRate) || 1.0;

        if (!window.OfflineQuranDB.hasAuthenticVerse(s, v)) {
            dom.wbwContainer.innerHTML = `
                <div class="wbw-status-card" data-wbw-key="${s}:${v}">
                    <div style="font-weight: 800; color: var(--gold); font-size: 1rem;">
                        ${escapeHtml(meta ? meta.name : 'Surah')} ${s}:${v}
                    </div>
                    <div style="font-size: 0.86rem; color: var(--text-secondary);">
                        Loading authentic Word-by-Word breakdown and caching offline...
                    </div>
                    <div class="loc-meta-text">Juz ${loc.juz} · Hizb ${loc.hizb} · Page ${loc.page}</div>
                </div>
            `;
            if (window.QuranTextHydrator) {
                window.QuranTextHydrator.fetchVerseWithWords(s, v).then(() => {
                    if (Number(appState.currentSurah) === s && Number(appState.currentVerse) === v && appState.currentSection === 'wordbyword') {
                        renderWbwView(s, v);
                    }
                    // Also warm surrounding chapter verses quietly in background
                    window.QuranTextHydrator.fetchChapterWithWords(s).catch(() => {});
                }).catch(() => {
                    if (Number(appState.currentSurah) === s && Number(appState.currentVerse) === v && dom.wbwContainer) {
                        dom.wbwContainer.innerHTML = `
                            <div class="wbw-status-card" data-wbw-key="${s}:${v}">
                                <div style="font-weight: 800; color: var(--gold); font-size: 1rem;">
                                    ${escapeHtml(meta ? meta.name : 'Surah')} ${s}:${v} is not cached offline yet
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary); max-width: 360px;">
                                    Connect briefly to download this Ayah's authentic Arabic words, transliteration, and translation. Once fetched, it stays cached on this device.
                                </div>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                                    <button type="button" class="btn btn-primary btn-sm" onclick="retryWbwHydration(${s}, ${v})">Retry Online</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="playVerseAudioDirect(${s}, ${v})">Play Full Ayah</button>
                                </div>
                            </div>
                        `;
                    }
                });
            }
            return;
        }

        const verseObj = window.OfflineQuranDB.getVerseByKey(`${s}:${v}`);
        const words = getVerseWords(s, v);

        dom.wbwContainer.innerHTML = `
            <div class="wbw-toolbar">
                <div class="wbw-toolbar-left">
                    <div>
                        <div style="font-weight: 800; color: var(--gold); font-size: 1rem;">
                            ${escapeHtml(meta ? meta.name : 'Surah')} ${s}:${v} · ${words.length} Words
                        </div>
                        <div class="loc-meta-text">Juz ${loc.juz} · Hizb ${loc.hizb} · Page ${loc.page}</div>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="btnWbwRate" onclick="changeWbwRate(${s}, ${v})">${rate}x Speed</button>
                </div>
                <div class="wbw-toolbar-right">
                    <button class="btn btn-primary btn-sm" id="btnPlayAllWords" onclick="togglePlayAyahWords(${s}, ${v}, ${words.length})">
                        <svg class="app-icon"><use href="#icon-play"/></svg> Play Words
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="playVerseAudioDirect(${s}, ${v})">
                        <svg class="app-icon"><use href="#icon-volume-up"/></svg> Full Ayah
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btnDlWbwSurah" onclick="downloadCurrentSurahWbwWords(${s})">
                        <svg class="app-icon"><use href="#icon-download"/></svg> Offline Words
                    </button>
                </div>
            </div>
            ${verseObj && verseObj.english ? `
                <div class="translation-text" style="margin-bottom: 12px;">
                    <div class="translation-label">${escapeHtml(meta ? meta.name : 'Surah')} ${s}:${v} · Translation</div>
                    ${escapeHtml(verseObj.english)}
                </div>
            ` : ''}
            <div class="word-by-word-container">
                ${words.map((w, idx) => `
                    <div class="word-item" id="wbw-word-${s}-${v}-${idx + 1}" onclick="playWbwWordAudio(${s}, ${v}, ${idx + 1}, this)">
                        <div class="word-card-top">
                            <span class="word-idx-badge">#${idx + 1}</span>
                            <span class="word-audio-play-icon"><svg class="app-icon"><use href="#icon-play"/></svg></span>
                        </div>
                        <div class="word-arabic ${getActiveTajweedClass()}">${getWordDisplayArabicHtml(w)}</div>
                        <div class="word-transliteration">${escapeHtml(w.transliteration || '')}</div>
                        <div class="word-translation">${escapeHtml(w.translation || '')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async function initTafsirView() {
        if (!dom.tafsirSurahSelect || !dom.tafsirVerseSelect) return;
        await populateTafsirEditionSelect();
        dom.tafsirSurahSelect.value = String(appState.currentSurah || 1);
        const surahNum = Number(dom.tafsirSurahSelect.value) || 1;
        const meta = window.OfflineQuranDB.getSurahMeta(surahNum);
        if (meta) {
            let opts = '';
            for (let i = 1; i <= meta.verses; i++) opts += `<option value="${i}">${i}</option>`;
            dom.tafsirVerseSelect.innerHTML = opts;
            const v = appState.currentVerse <= meta.verses ? appState.currentVerse : 1;
            dom.tafsirVerseSelect.value = String(v);
            await renderTafsirView(surahNum, v, appState.tafsirSource);
        }
    }

    window.setTafsirSource = function (surah, verse, sourceId) {
        appState.tafsirSource = sourceId;
        localStorage.setItem('quran_tafsir_source', sourceId);
        if (dom.tafsirEditionSelect) dom.tafsirEditionSelect.value = sourceId;
        renderTafsirView(surah, verse, sourceId);
    };

    async function renderTafsirView(surah, verse, sourceId) {
        if (!dom.tafsirContainer) return;
        const src = sourceId || appState.tafsirSource || 'ibn-kathir';
        const v = window.OfflineQuranDB.getVerseByKey(`${surah}:${verse}`);
        const meta = window.OfflineQuranDB.getSurahMeta(surah);
        const loc = window.OfflineQuranDB.getVerseLocation(surah, verse);

        dom.tafsirContainer.innerHTML = `
            <div class="card" style="margin-bottom: 0; text-align: center; padding: 24px; color: var(--text-secondary);">
                Loading Tafsir commentary...
            </div>
        `;

        const entry = await resolveTafsirEntry(src, surah, verse);
        const langAttr = getLangAttrForTafsir(entry.language);

        dom.tafsirContainer.innerHTML = `
            <div class="card" style="margin-bottom: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="release-badge-current">${escapeHtml(meta ? meta.name : 'Surah')} ${surah}:${verse}</span>
                        <span class="reciter-badge ${entry.isOffline ? 'downloaded' : 'cloud'}">${escapeHtml(entry.language)} · ${entry.isOffline ? 'Offline' : 'Online'}</span>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <div class="tafsir-pill-group">
                            <button class="tafsir-pill-btn ${src === 'ibn-kathir' ? 'active' : ''}" onclick="setTafsirSource(${surah}, ${verse}, 'ibn-kathir')">Ibn Kathir</button>
                            <button class="tafsir-pill-btn ${src === 'jalalayn' ? 'active' : ''}" onclick="setTafsirSource(${surah}, ${verse}, 'jalalayn')">Jalalayn</button>
                            <button class="tafsir-pill-btn ${src === 'saadi' ? 'active' : ''}" onclick="setTafsirSource(${surah}, ${verse}, 'saadi')">As-Saadi</button>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="playVerseAudioDirect(${surah}, ${verse})">
                            <svg class="app-icon"><use href="#icon-play"/></svg> Listen Ayah
                        </button>
                    </div>
                </div>
                ${v ? `
                    <div class="arabic-text ${getActiveTajweedClass()}" style="font-size: 1.45rem; margin-bottom: 10px;">
                        ${renderVerseArabicHtml(v)}
                    </div>
                    <div class="translation-text" style="margin-bottom: 14px; border-left-color: var(--accent);">
                        ${escapeHtml(v.english)}
                    </div>
                ` : ''}
                <div style="border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <h4 style="color: var(--gold); margin-bottom: 8px; font-size: 0.96rem;">${escapeHtml(entry.name)}</h4>
                    ${entry.missingOffline ? `
                        <div style="background: var(--tile-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
                            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">This edition is not downloaded for Surah ${surah} yet.</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 10px;">Go to Downloads -> Tafsir to download all 114 Surahs of ${escapeHtml(entry.name)} for offline reading.</div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary btn-sm" onclick="openTafsirDownloads()">Open Downloads -> Tafsir</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="setTafsirSource(${surah}, ${verse}, 'ibn-kathir')">Read Built-In Ibn Kathir</button>
                            </div>
                        </div>
                    ` : `
                        <p class="tafsir-body-text" dir="${escapeHtml(entry.dir)}" lang="${escapeHtml(langAttr)}">${escapeHtml(entry.text)}</p>
                    `}
                </div>
                <div class="verse-footer-meta">
                    <span class="loc-meta-text">Juz ${loc.juz} · Hizb ${loc.hizb} · Page ${loc.page}</span>
                </div>
            </div>
        `;
    }

    // ========== RELEASE NOTES COPY HELPER (NO EMOJIS) ==========
    window.copyReleaseNotes = function (version) {
        let text = '';
        if (version === 'all') {
            const versions = ['3.5', '3.4', '3.3', '3.1', '3.0', '2.5', '2.4', '2.3', '2.2', '2.1', '2.0', '1.7', '1.5', '1.4', '1.0'];
            text = '# Quran Explorer - Complete Release Notes Archive\n\n' + versions.map((v) => {
                const el = document.getElementById('releaseNotesContent_' + v);
                return `### Version ${v}\n${el ? el.innerText.trim() : ''}\n`;
            }).join('\n---\n\n');
        } else if (version === '3.0-3.5') {
            const gen3 = ['3.5', '3.4', '3.3', '3.1', '3.0'];
            text = '# Quran Explorer Generation 3 - Mega Release Summary (v3.0 - v3.5)\n\n' +
                gen3.map((v) => {
                    const el = document.getElementById('releaseNotesContent_' + v);
                    return `### Version ${v}\n${el ? el.innerText.trim() : ''}\n`;
                }).join('\n---\n\n');
        } else if (version === '2.0-3.3' || version === '2.0-3.1' || version === '2.0-3.0' || version === '2.0-2.5') {
            const gen2 = ['3.5', '3.4', '3.3', '3.1', '3.0', '2.5', '2.4', '2.3', '2.2', '2.1', '2.0'];
            text = '# Quran Explorer v3.5 - Combined Major Release (v2.0 - v3.5)\n\n' +
                gen2.map((v) => {
                    const el = document.getElementById('releaseNotesContent_' + v);
                    return `### Version ${v}\n${el ? el.innerText.trim() : ''}\n`;
                }).join('\n---\n\n');
        } else {
            const el = document.getElementById('releaseNotesContent_' + version);
            text = `### Quran Explorer v${version} Release Notes\n\n${el ? el.innerText.trim() : ''}`;
        }
        const label = version === 'all' ? 'All' : (version === '3.0-3.5' ? 'v3.0-v3.5 Generation 3' : (version.startsWith('2.0-') ? 'v2.0-v3.5 Combined' : 'v' + version));
        copyTextSafe(text, `${label} Release Notes copied.`);
    };

    // ========== ANDROID HARDWARE BACK HOOK ==========
    window.handleAndroidBack = function () {
        if (appState.confirmOpen) {
            resolveAppConfirm(false);
            return true;
        }
        if (appState.audioPromptOpen) {
            closeAudioPromptModal();
            return true;
        }
        if (dom.quickSettingsDropdown && dom.quickSettingsDropdown.classList.contains('show')) {
            window.closeQuickSettings();
            return true;
        }
        if ((dom.sidebar && dom.sidebar.classList.contains('open')) || document.body.classList.contains('sidebar-open')) {
            window.closeMenu();
            return true;
        }
        if (appState.sectionHistory.length > 1) {
            goBack();
            return true;
        }
        if (appState.currentSection !== 'home') {
            window.showSection('home');
            return true;
        }
        return false;
    };

    // ========== EVENT LISTENERS ==========
    function setupEventListeners() {
        dom.overlay?.addEventListener('click', (e) => window.closeMenu(e));
        dom.sidebarCloseBtn?.addEventListener('click', (e) => window.closeMenu(e));
        dom.sectionBackBtn?.addEventListener('click', goBack);

        document.querySelectorAll('.nav-item').forEach((item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.closeMenu();
                window.showSection(item.dataset.section);
            });
        });

        dom.themeToggle?.addEventListener('click', () => {
            applyTheme(appState.theme === 'dark' ? 'light' : 'dark');
        });

        dom.quickSettingsBtn?.addEventListener('click', window.toggleQuickSettings);
        dom.quickSettingsBackdrop?.addEventListener('click', window.closeQuickSettings);
        dom.quickSettingsCloseBtn?.addEventListener('click', window.closeQuickSettings);
        dom.quickSettingsDropdown?.addEventListener('click', (e) => e.stopPropagation());

        // App Confirm Modal listeners
        dom.appConfirmOkBtn?.addEventListener('click', () => resolveAppConfirm(true));
        dom.appConfirmCancelBtn?.addEventListener('click', () => resolveAppConfirm(false));
        dom.appConfirmCloseBtn?.addEventListener('click', () => resolveAppConfirm(false));
        dom.appConfirmModal?.addEventListener('click', (e) => {
            if (e.target === dom.appConfirmModal) resolveAppConfirm(false);
        });

        // Hide fixed bottom bars when soft keyboard is active on text/number inputs
        const isTextInputEl = (el) => {
            if (!el || !el.tagName) return false;
            const tag = el.tagName.toUpperCase();
            if (tag === 'TEXTAREA') return true;
            if (tag === 'INPUT') {
                const t = (el.type || 'text').toLowerCase();
                return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file'].includes(t);
            }
            return false;
        };
        document.addEventListener('focusin', (e) => {
            if (keyboardBlurTimer) {
                clearTimeout(keyboardBlurTimer);
                keyboardBlurTimer = null;
            }
            if (isTextInputEl(e.target)) {
                document.body.classList.add('keyboard-open');
            }
        });
        document.addEventListener('focusout', () => {
            if (keyboardBlurTimer) clearTimeout(keyboardBlurTimer);
            keyboardBlurTimer = setTimeout(() => {
                if (!isTextInputEl(document.activeElement)) {
                    document.body.classList.remove('keyboard-open');
                }
            }, 120);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                resolveAppConfirm(false);
                window.closeQuickSettings();
                window.closeMenu();
                closeAudioPromptModal();
            }
        });

        // Tajweed controls
        const refreshTajweedSensitiveViews = () => {
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
            if (appState.currentSection === 'wordbyword') renderWbwView(appState.currentSurah, appState.currentVerse);
            if (appState.currentSection === 'tafsir') {
                renderTafsirView(
                    Number(dom.tafsirSurahSelect?.value || appState.currentSurah || 1),
                    Number(dom.tafsirVerseSelect?.value || appState.currentVerse || 1),
                    appState.tafsirSource
                );
            }
        };

        const toggleTajweed = () => {
            appState.tajweedEnabled = !appState.tajweedEnabled;
            syncTajweedControls();
            refreshTajweedSensitiveViews();
            showToast(appState.tajweedEnabled ? 'Tajweed highlighting enabled' : 'Tajweed highlighting hidden');
        };
        dom.quickTajweedToggle?.addEventListener('click', toggleTajweed);
        dom.readTajweedBtn?.addEventListener('click', toggleTajweed);

        document.getElementById('quickTajweedBasicBtn')?.addEventListener('click', () => {
            appState.tajweedEnabled = true;
            appState.tajweedMode = 'basic';
            syncTajweedControls();
            refreshTajweedSensitiveViews();
            showToast('Tajweed: Basic Rules');
        });
        document.getElementById('quickTajweedAdvancedBtn')?.addEventListener('click', () => {
            appState.tajweedEnabled = true;
            appState.tajweedMode = 'advanced';
            syncTajweedControls();
            refreshTajweedSensitiveViews();
            showToast('Tajweed: Full Color Rules');
        });
        document.getElementById('quickTajweedGuideBtn')?.addEventListener('click', () => {
            window.closeQuickSettings();
            window.showSection('tajweed-guide');
        });

        // Script, Translation, Comfort, Playback Speed
        dom.quickScriptSelect?.addEventListener('change', (e) => {
            applyScript(e.target.value);
            syncSettingsUI();
            refreshTajweedSensitiveViews();
        });
        dom.quickTranslationSelect?.addEventListener('change', (e) => {
            appState.selectedTranslation = e.target.value;
            localStorage.setItem('quran_translation', appState.selectedTranslation);
            syncSettingsUI();
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
        });
        dom.quickAlwaysEnglishToggle?.addEventListener('click', () => {
            appState.alwaysEnglish = !appState.alwaysEnglish;
            localStorage.setItem('quran_always_english', appState.alwaysEnglish ? 'true' : 'false');
            dom.quickAlwaysEnglishToggle.classList.toggle('active', appState.alwaysEnglish);
            syncSettingsUI();
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
        });

        const toggleComfort = () => {
            applyReadingComfort(!appState.readingComfort);
            showToast(appState.readingComfort ? 'Reading Comfort: Warm Sepia On' : 'Reading Comfort: Off');
        };
        dom.quickComfortToggle?.addEventListener('click', toggleComfort);
        dom.readComfortBtn?.addEventListener('click', toggleComfort);

        document.querySelectorAll('.quick-speed-btn, .settings-speed-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                applyPlaybackRate(Number(btn.dataset.speed));
                showToast(`Recitation speed: ${btn.dataset.speed}x`);
            });
        });

        dom.quickAllSettingsBtn?.addEventListener('click', () => {
            window.closeQuickSettings();
            window.showSection('settings');
        });
        dom.quickReleasesBtn?.addEventListener('click', () => {
            window.closeQuickSettings();
            window.showSection('releases');
        });

        dom.quickDownloadShortcutBtn?.addEventListener('click', () => {
            window.closeQuickSettings();
            window.showSection('downloads');
            window.switchDownloadsTab('audio');
        });

        dom.topDownloadsBtn?.addEventListener('click', () => {
            window.showSection('downloads');
            window.switchDownloadsTab('audio');
        });

        // Reading controls
        dom.startReadingBtn?.addEventListener('click', () => {
            const val = Number(dom.quickSurahSelect?.value || 1);
            window.loadSurah(val, true, 1);
        });
        dom.readSurahSelect?.addEventListener('change', (e) => {
            const val = Number(e.target.value);
            if (val) window.loadSurah(val, true, 1);
        });
        dom.backToSurahListBtn?.addEventListener('click', () => window.showSection('surahs'));

        const jumpToVerseInput = () => {
            const inputEl = document.getElementById('gotoVerseInput');
            const v = Number(inputEl?.value);
            if (v) {
                inputEl?.blur();
                window.loadSurah(appState.currentSurah, true, v);
            }
        };
        document.getElementById('gotoVerseBtn')?.addEventListener('click', jumpToVerseInput);
        document.getElementById('gotoVerseInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') jumpToVerseInput();
        });

        // Page Jump controls
        dom.pageJumpGoBtn?.addEventListener('click', () => {
            dom.pageJumpInput?.blur();
            window.jumpToMushafPage(dom.pageJumpInput?.value);
        });
        dom.pageJumpInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                dom.pageJumpInput?.blur();
                window.jumpToMushafPage(dom.pageJumpInput?.value);
            }
        });

        // Surah filter & Global Search
        dom.surahFilterInput?.addEventListener('input', (e) => renderSurahList(e.target.value));
        const runTopSearch = () => {
            const q = (dom.topSearchInput?.value || '').trim();
            dom.topSearchInput?.blur();
            window.showSection('search');
            if (dom.searchInput) dom.searchInput.value = q;
            performSearch(q);
        };
        dom.topSearchBtn?.addEventListener('click', runTopSearch);
        dom.topSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') runTopSearch();
        });
        dom.searchBtn?.addEventListener('click', () => {
            dom.searchInput?.blur();
            performSearch(dom.searchInput?.value);
        });
        dom.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                dom.searchInput?.blur();
                performSearch(dom.searchInput?.value);
            }
        });
        dom.searchInput?.addEventListener('input', (e) => performSearch(e.target.value));
        dom.searchClearBtn?.addEventListener('click', () => {
            if (dom.searchInput) dom.searchInput.value = '';
            performSearch('');
        });
        dom.searchResetFiltersBtn?.addEventListener('click', window.resetSearchFilters);

        // Downloads tabs & filters (previously unwired!)
        document.getElementById('tabBtnAudio')?.addEventListener('click', () => window.switchDownloadsTab('audio'));
        document.getElementById('tabBtnTranslations')?.addEventListener('click', () => window.switchDownloadsTab('translations'));
        document.getElementById('tabBtnTafsir')?.addEventListener('click', () => window.switchDownloadsTab('tafsir'));
        document.getElementById('dlFilterAll')?.addEventListener('click', () => window.setDlFilter('all'));
        document.getElementById('dlFilterDownloaded')?.addEventListener('click', () => window.setDlFilter('downloaded'));
        document.getElementById('dlFilterJuz30')?.addEventListener('click', () => window.setDlFilter('juz30'));
        dom.dlSurahSearchInput?.addEventListener('input', (e) => renderSurahDownloadList(e.target.value));

        dom.clearBookmarksBtn?.addEventListener('click', async () => {
            const confirmed = await showAppConfirm({
                title: 'Clear All Bookmarks',
                message: 'Remove all saved Ayah bookmarks from this device?',
                confirmText: 'Clear Bookmarks',
                dangerous: true
            });
            if (confirmed) {
                appState.bookmarks = [];
                localStorage.removeItem('quran_bookmarks');
                renderBookmarks();
                updateDashboard();
                showToast('All bookmarks cleared.');
            }
        });

        // Audio controls
        dom.readPlayFullSurahBtn?.addEventListener('click', () => window.playVerseAudio(1));
        dom.readDownloadSurahBtn?.addEventListener('click', () => window.startSurahDownload(appState.currentSurah));
        dom.barDownloadBtn?.addEventListener('click', () => window.startSurahDownload(appState.currentSurah));

        dom.playPauseBtn?.addEventListener('click', () => {
            if (appState.isPlaying) {
                window.UnifiedAudioEngine?.pause();
                appState.isPlaying = false;
                if (dom.playIcon) dom.playIcon.innerHTML = `<use href="#icon-play"/>`;
            } else {
                window.playVerseAudio(appState.currentVerse);
            }
        });

        dom.prevVerseBtn?.addEventListener('click', () => {
            if (appState.currentVerse > 1) window.playVerseAudio(appState.currentVerse - 1);
        });
        dom.nextVerseBtn?.addEventListener('click', () => {
            const meta = window.OfflineQuranDB.getSurahMeta(appState.currentSurah);
            if (meta && appState.currentVerse < meta.verses) window.playVerseAudio(appState.currentVerse + 1);
        });
        dom.repeatBtn?.addEventListener('click', () => {
            applyRepeatVerse(!appState.repeatVerse);
            showToast(appState.repeatVerse ? 'Repeat Ayah: On' : 'Repeat Ayah: Off');
        });
        dom.audioProgress?.addEventListener('click', (e) => {
            const rect = dom.audioProgress.getBoundingClientRect();
            const fraction = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0;
            window.UnifiedAudioEngine?.seek(fraction);
        });

        // Prompt modal listeners
        dom.promptCloseBtn?.addEventListener('click', closeAudioPromptModal);
        dom.promptReciterSelect?.addEventListener('change', async (e) => {
            await window.selectReciter(e.target.value);
            await updatePromptModalStatus();
        });
        dom.promptPlayOnlineBtn?.addEventListener('click', () => {
            const target = appState.pendingPromptVerse || { surah: appState.currentSurah, verse: appState.currentVerse };
            closeAudioPromptModal();
            window.playVerseAudioDirect(target.surah, target.verse, false);
        });
        dom.promptDownloadAndPlayBtn?.addEventListener('click', async () => {
            const target = appState.pendingPromptVerse || { surah: appState.currentSurah, verse: appState.currentVerse };
            const reciterId = dom.promptReciterSelect ? dom.promptReciterSelect.value : appState.currentReciter;
            if (window.OfflineStorageEngine && await window.OfflineStorageEngine.isSurahDownloaded(reciterId, target.surah)) {
                closeAudioPromptModal();
                window.playVerseAudioDirect(target.surah, target.verse, true);
                return;
            }
            if (dom.promptDlProgressBar) dom.promptDlProgressBar.style.display = 'block';
            if (dom.promptDlStatusText) {
                dom.promptDlStatusText.style.display = 'block';
                dom.promptDlStatusText.textContent = 'Downloading audio...';
            }
            window.QuranDownloadManager?.downloadSurahAudio(
                reciterId,
                target.surah,
                (_loaded, _total, percent) => {
                    if (dom.promptDlProgressFill) dom.promptDlProgressFill.style.width = `${percent}%`;
                    if (dom.promptDlStatusText) dom.promptDlStatusText.textContent = `Downloading... ${percent}%`;
                },
                () => {
                    closeAudioPromptModal();
                    window.playVerseAudioDirect(target.surah, target.verse, true);
                },
                (err) => {
                    if (dom.promptDlStatusText) dom.promptDlStatusText.textContent = `Download error: ${err?.message || 'Failed'}`;
                }
            );
        });

        // Clear all & Juz 30 downloads
        dom.clearAllDownloadsBtn?.addEventListener('click', async () => {
            const confirmed = await showAppConfirm({
                title: 'Clear Offline Audio',
                message: 'Remove all downloaded audio recitations from device storage?',
                confirmText: 'Clear Audio',
                dangerous: true
            });
            if (confirmed) {
                await window.OfflineStorageEngine.clearAllAudio();
                showToast('All offline audio cleared.');
                await initDownloadsUI();
            }
        });

        dom.downloadJuz30Btn?.addEventListener('click', async () => {
            const reciterId = appState.currentReciter;
            const confirmed = await showAppConfirm({
                title: 'Download Juz 30 (Amma)',
                message: 'Download all 37 Surahs of Juz 30 for complete offline listening?',
                confirmText: 'Download Juz 30'
            });
            if (!confirmed) return;
            dom.downloadJuz30Btn.disabled = true;
            if (dom.juz30ProgressBar) dom.juz30ProgressBar.style.display = 'block';
            if (dom.juz30ProgressText) dom.juz30ProgressText.style.display = 'block';

            const surahs = Array.from({ length: 37 }, (_, i) => 78 + i);
            window.QuranDownloadManager.batchDownloadSurahs(
                reciterId,
                surahs,
                (done, total, curr) => {
                    const pct = Math.round((done / total) * 100);
                    if (dom.juz30ProgressFill) dom.juz30ProgressFill.style.width = `${pct}%`;
                    const m = window.OfflineQuranDB.getSurahMeta(curr);
                    if (dom.juz30ProgressText) dom.juz30ProgressText.textContent = `Downloading ${m ? m.name : 'Surah ' + curr} (${done}/${total}) · ${pct}%`;
                },
                async () => {
                    showToast('Juz 30 downloaded successfully.', 'success');
                    if (dom.juz30ProgressFill) dom.juz30ProgressFill.style.width = '100%';
                    setTimeout(() => {
                        if (dom.juz30ProgressBar) dom.juz30ProgressBar.style.display = 'none';
                        if (dom.juz30ProgressText) dom.juz30ProgressText.style.display = 'none';
                        if (dom.downloadJuz30Btn) dom.downloadJuz30Btn.disabled = false;
                    }, 2000);
                    await initDownloadsUI();
                },
                (err) => {
                    showToast(`Batch error: ${err.message}`, 'error');
                    if (dom.downloadJuz30Btn) dom.downloadJuz30Btn.disabled = false;
                }
            );
        });

        dom.continueReadingBtn?.addEventListener('click', () => {
            const raw = localStorage.getItem('quran_session');
            if (raw) {
                try {
                    const s = JSON.parse(raw);
                    window.loadSurah(s.surah, true, s.verse || 1);
                } catch (_) {}
            }
        });

        // Scroll Go Top
        let goTopRaf = false;
        let isGoTopShown = false;
        window.addEventListener('scroll', () => {
            if (!goTopRaf) {
                goTopRaf = true;
                requestAnimationFrame(() => {
                    const show = window.scrollY > 250;
                    if (isGoTopShown !== show) {
                        isGoTopShown = show;
                        dom.goTopBtn?.classList.toggle('show', show);
                    }
                    goTopRaf = false;
                });
            }
        }, { passive: true });
        dom.goTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // WBW & Tafsir selectors + font scaling + catalog controls
        dom.wbwScaleDownBtn?.addEventListener('click', () => applyWbwScale(appState.wbwScale - 0.1));
        dom.wbwScaleUpBtn?.addEventListener('click', () => applyWbwScale(appState.wbwScale + 0.1));
        dom.tafsirScaleDownBtn?.addEventListener('click', () => applyTafsirScale(appState.tafsirScale - 0.1));
        dom.tafsirScaleUpBtn?.addEventListener('click', () => applyTafsirScale(appState.tafsirScale + 0.1));
        dom.tafsirOpenDownloadsBtn?.addEventListener('click', window.openTafsirDownloads);
        dom.tafsirRefreshCatalogBtn?.addEventListener('click', window.refreshTafsirCatalogList);
        dom.tafsirFilterAllBtn?.addEventListener('click', () => window.setTafsirDlFilter('all'));
        dom.tafsirFilterInstalledBtn?.addEventListener('click', () => window.setTafsirDlFilter('installed'));
        dom.tafsirDlSearchInput?.addEventListener('input', (e) => {
            appState.tafsirDlSearch = e.target.value || '';
            renderTafsirList();
        });

        dom.wbwSurahSelect?.addEventListener('change', () => {
            const surahNum = Number(dom.wbwSurahSelect.value) || 1;
            setWbwSurahVerse(surahNum, 1, true);
        });
        dom.wbwVerseSelect?.addEventListener('change', () => {
            setWbwSurahVerse(
                Number(dom.wbwSurahSelect?.value || appState.currentSurah || 1),
                Number(dom.wbwVerseSelect?.value || 1),
                true
            );
        });
        dom.wbwPrevVerseBtn?.addEventListener('click', () => window.stepWbwVerse(-1));
        dom.wbwNextVerseBtn?.addEventListener('click', () => window.stepWbwVerse(1));

        dom.tafsirSurahSelect?.addEventListener('change', () => {
            const meta = window.OfflineQuranDB.getSurahMeta(dom.tafsirSurahSelect.value);
            if (!meta || !dom.tafsirVerseSelect) return;
            let opts = '';
            for (let i = 1; i <= meta.verses; i++) opts += `<option value="${i}">${i}</option>`;
            dom.tafsirVerseSelect.innerHTML = opts;
            renderTafsirView(Number(dom.tafsirSurahSelect.value), 1, appState.tafsirSource);
        });
        dom.tafsirVerseSelect?.addEventListener('change', () => {
            renderTafsirView(Number(dom.tafsirSurahSelect?.value || 1), Number(dom.tafsirVerseSelect?.value || 1), appState.tafsirSource);
        });
        dom.tafsirEditionSelect?.addEventListener('change', (e) => {
            window.setTafsirSource(
                Number(dom.tafsirSurahSelect?.value || appState.currentSurah || 1),
                Number(dom.tafsirVerseSelect?.value || 1),
                e.target.value
            );
        });

        // Complete Settings Section Listeners
        dom.settingsThemeDarkBtn?.addEventListener('click', () => applyTheme('dark'));
        dom.settingsThemeLightBtn?.addEventListener('click', () => applyTheme('light'));
        dom.settingsComfortToggle?.addEventListener('click', () => {
            applyReadingComfort(!appState.readingComfort);
            showToast(appState.readingComfort ? 'Reading Comfort: Warm Sepia On' : 'Reading Comfort: Off');
        });
        dom.settingsScriptSelect?.addEventListener('change', (e) => {
            applyScript(e.target.value);
            syncSettingsUI();
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
            if (appState.currentSection === 'wordbyword') renderWbwView(appState.currentSurah, appState.currentVerse);
        });
        dom.settingsArabicSizeRange?.addEventListener('input', (e) => applyArabicFontSize(e.target.value));
        dom.settingsArabicSizeDownBtn?.addEventListener('click', () => applyArabicFontSize(appState.arabicFontSize - 2));
        dom.settingsArabicSizeUpBtn?.addEventListener('click', () => applyArabicFontSize(appState.arabicFontSize + 2));
        dom.settingsTransSizeRange?.addEventListener('input', (e) => applyTransFontSize(e.target.value));
        dom.settingsTransSizeDownBtn?.addEventListener('click', () => applyTransFontSize(appState.transFontSize - 1));
        dom.settingsTransSizeUpBtn?.addEventListener('click', () => applyTransFontSize(appState.transFontSize + 1));
        dom.settingsWbwScaleDownBtn?.addEventListener('click', () => applyWbwScale(appState.wbwScale - 0.1));
        dom.settingsWbwScaleUpBtn?.addEventListener('click', () => applyWbwScale(appState.wbwScale + 0.1));
        dom.settingsTafsirScaleDownBtn?.addEventListener('click', () => applyTafsirScale(appState.tafsirScale - 0.1));
        dom.settingsTafsirScaleUpBtn?.addEventListener('click', () => applyTafsirScale(appState.tafsirScale + 0.1));

        dom.settingsTajweedOffBtn?.addEventListener('click', () => {
            appState.tajweedEnabled = false;
            syncTajweedControls();
            refreshTajweedSensitiveViews();
        });
        dom.settingsTajweedBasicBtn?.addEventListener('click', () => {
            appState.tajweedEnabled = true;
            appState.tajweedMode = 'basic';
            syncTajweedControls();
            refreshTajweedSensitiveViews();
        });
        dom.settingsTajweedAdvBtn?.addEventListener('click', () => {
            appState.tajweedEnabled = true;
            appState.tajweedMode = 'advanced';
            syncTajweedControls();
            refreshTajweedSensitiveViews();
        });
        dom.settingsAlwaysEnglishToggle?.addEventListener('click', () => {
            appState.alwaysEnglish = !appState.alwaysEnglish;
            localStorage.setItem('quran_always_english', appState.alwaysEnglish ? 'true' : 'false');
            if (dom.quickAlwaysEnglishToggle) dom.quickAlwaysEnglishToggle.classList.toggle('active', appState.alwaysEnglish);
            syncSettingsUI();
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
        });
        dom.settingsTranslationSelect?.addEventListener('change', (e) => {
            appState.selectedTranslation = e.target.value;
            localStorage.setItem('quran_translation', appState.selectedTranslation);
            if (dom.quickTranslationSelect) dom.quickTranslationSelect.value = appState.selectedTranslation;
            syncSettingsUI();
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
        });
        dom.settingsDefaultTafsirSelect?.addEventListener('change', (e) => {
            appState.tafsirSource = e.target.value;
            localStorage.setItem('quran_tafsir_source', appState.tafsirSource);
            if (dom.tafsirEditionSelect) dom.tafsirEditionSelect.value = appState.tafsirSource;
            showToast('Default Tafsir updated', 'success');
        });
        dom.settingsAutoPlayToggle?.addEventListener('click', () => applyAutoPlayNext(!appState.autoPlayNext));
        dom.settingsRepeatVerseToggle?.addEventListener('click', () => {
            applyRepeatVerse(!appState.repeatVerse);
            showToast(appState.repeatVerse ? 'Repeat Ayah: On' : 'Repeat Ayah: Off');
        });
        dom.settingsOpenPrayerConfigBtn?.addEventListener('click', () => {
            appState.prayerMiniSettingsOpen = true;
            window.showSection('qatar-prayers');
        });
        dom.settingsResetDefaultsBtn?.addEventListener('click', async () => {
            const ok = await showAppConfirm({
                title: 'Reset Reading Settings',
                message: 'Restore default theme, typography sizes, script, translations, and audio speed preferences?',
                confirmText: 'Reset Defaults'
            });
            if (!ok) return;
            applyScript('uthmani');
            appState.tajweedEnabled = true;
            appState.tajweedMode = 'basic';
            appState.alwaysEnglish = true;
            localStorage.setItem('quran_always_english', 'true');
            appState.selectedTranslation = '161';
            localStorage.setItem('quran_translation', '161');
            appState.tafsirSource = 'ibn-kathir';
            localStorage.setItem('quran_tafsir_source', 'ibn-kathir');

            applyTheme('dark');
            applyReadingComfort(false);
            applyArabicFontSize(25);
            applyTransFontSize(15);
            applyWbwScale(1.0);
            applyTafsirScale(1.0);
            applyPlaybackRate(1.0);
            applyAutoPlayNext(true);
            applyRepeatVerse(false);
            syncTajweedControls();

            if (dom.quickTranslationSelect) dom.quickTranslationSelect.value = '161';
            if (dom.quickAlwaysEnglishToggle) dom.quickAlwaysEnglishToggle.classList.add('active');
            await populateTafsirEditionSelect();
            await window.selectReciter('ar.alafasy');
            syncSettingsUI();
            window.loadSurah(appState.currentSurah, false, appState.currentVerse);
            showToast('Settings restored to defaults.', 'success');
        });

        // Prayer Times Mini Settings Panel, Regional Presets & GPS Listeners
        dom.prayerMiniSettingsToggleBtn?.addEventListener('click', window.togglePrayerMiniSettings);
        dom.prayerMiniSettingsCloseBtn?.addEventListener('click', () => window.openPrayerMiniSettings(false));
        dom.prayerMiniSettingsDoneBtn?.addEventListener('click', () => {
            appState.prayerConfig = {
                ...appState.prayerConfig,
                configured: true,
                mode: appState.prayerConfig.mode === 'unconfigured' ? 'preset' : appState.prayerConfig.mode
            };
            savePrayerConfig();
            window.openPrayerMiniSettings(false);
            renderQatarPrayers();
            syncSettingsUI();
        });
        dom.prayerDetectGpsBtn?.addEventListener('click', window.requestTemporaryPrayerGps);
        dom.prayerVerifyOnlineBtn?.addEventListener('click', window.verifyOnlinePrayerTimes);

        dom.prayerCountrySelect?.addEventListener('change', (e) => {
            const region = window.OfflinePrayerTimes?.getRegion(e.target.value);
            if (region && region.cities && region.cities.length) {
                window.applyQuickPrayerPreset(region.countryCode, region.cities[0].id);
            }
        });

        dom.prayerCitySelect?.addEventListener('change', (e) => {
            const region = window.OfflinePrayerTimes?.getRegion(appState.prayerConfig.countryCode);
            const city = region?.cities?.find((c) => c.id === e.target.value);
            if (city && region) {
                appState.prayerConfig = {
                    ...appState.prayerConfig,
                    configured: true,
                    mode: 'preset',
                    cityId: city.id,
                    cityName: city.name,
                    countryCode: region.countryCode,
                    countryName: region.country,
                    lat: city.lat,
                    lon: city.lon,
                    tz: city.tz,
                    locationLabel: `${city.name}, ${region.country}`
                };
                appState.livePrayerTimings = null;
                savePrayerConfig();
                renderQatarPrayers();
                syncSettingsUI();
            }
        });

        dom.prayerMethodSelect?.addEventListener('change', (e) => {
            appState.prayerConfig = {
                ...appState.prayerConfig,
                configured: true,
                methodId: e.target.value
            };
            appState.livePrayerTimings = null;
            savePrayerConfig();
            renderQatarPrayers();
            syncSettingsUI();
        });

        dom.prayerAsrStandardBtn?.addEventListener('click', () => {
            appState.prayerConfig = { ...appState.prayerConfig, configured: true, asrSchool: 'standard' };
            appState.livePrayerTimings = null;
            savePrayerConfig();
            populatePrayerDropdowns();
            renderQatarPrayers();
            syncSettingsUI();
        });
        dom.prayerAsrHanafiBtn?.addEventListener('click', () => {
            appState.prayerConfig = { ...appState.prayerConfig, configured: true, asrSchool: 'hanafi' };
            appState.livePrayerTimings = null;
            savePrayerConfig();
            populatePrayerDropdowns();
            renderQatarPrayers();
            syncSettingsUI();
        });
    }

    // ========== INITIALIZE ==========
    function initApp() {
        cacheDom();
        applyArabicFontSize(appState.arabicFontSize);
        applyTransFontSize(appState.transFontSize);
        applyTheme(appState.theme);
        applyReadingComfort(appState.readingComfort);
        applyScript(appState.currentScript);
        applyWbwScale(appState.wbwScale);
        applyTafsirScale(appState.tafsirScale);
        applyAutoPlayNext(appState.autoPlayNext);
        applyRepeatVerse(appState.repeatVerse);
        syncTajweedControls();
        applyPlaybackRate(appState.playbackRate);

        if (dom.quickTranslationSelect) dom.quickTranslationSelect.value = appState.selectedTranslation;
        if (dom.quickAlwaysEnglishToggle) dom.quickAlwaysEnglishToggle.classList.toggle('active', appState.alwaysEnglish);

        populateSurahDropdowns();
        populatePrayerDropdowns();
        renderSurahList();
        renderJuzList();
        renderQatarPrayers();
        renderPrayerTracker();
        renderBookmarks();
        updateDashboard();
        updateContinueReading();
        initDownloadsUI();
        populateTafsirEditionSelect();
        syncSettingsUI();

        const savedSession = localStorage.getItem('quran_session');
        let initialSurah = 1;
        let initialVerse = 1;
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                if (parsed.surah) initialSurah = Number(parsed.surah);
                if (parsed.verse) initialVerse = Number(parsed.verse);
            } catch (_) {}
        }

        window.addEventListener('resize', () => {
            if (dom.quickSettingsDropdown && dom.quickSettingsDropdown.classList.contains('show')) {
                syncQuickSettingsBounds();
            }
        }, { passive: true });

        window.loadSurah(initialSurah, false, initialVerse);
        setupEventListeners();

        // Warm cached authentic verses from IndexedDB into memory cleanly
        window.QuranTextHydrator?.loadCachedIntoMemory().then(() => {
            if (appState.currentSection === 'read') {
                window.loadSurah(appState.currentSurah, false, appState.currentVerse);
            } else if (appState.currentSection === 'wordbyword') {
                renderWbwView(appState.currentSurah, appState.currentVerse);
            }
        }).catch(() => {});

        // Hide HTML splash veil immediately (native Compose splash covers launch frame)
        if (dom.appSplashOverlay) {
            dom.appSplashOverlay.classList.add('splash-hidden');
            dom.appSplashOverlay.style.display = 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', initApp);
})();
