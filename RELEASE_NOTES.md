# Quran Explorer - Complete Version History & Release Notes

Official changelog and version history for **Quran Explorer** across all releases from **v1.0** to **v3.5 (Generation 3 Finale)**.

---

## Generation 3 Mega Release Overview (v3.0 - v3.5)

> **Major Generation Upgrade:** Following the v2.0-v2.5 foundational overhaul, **Generation 3 (v3.0 through v3.5)** marks the second and largest architectural leap in Quran Explorer's history. Every core pillar of reading, typography, offline commentary, prayer accuracy, navigation, and Android UI craft was rebuilt from the ground up:
>
> * **Full Static Quranic Script Fonts & Glyph Perfection (v3.3 -> v3.5):** Eliminated WebView fallback to broken system fonts by bundling full static `KFGQPC Uthmanic Hafs`, `IndoPak Nastaleeq` (including PUA waqf marks), `Noto Naskh Arabic`, and full `Amiri`, resolving Sifr Mistadir (`U+06DF`) dotted-circle rendering defects across both Tajweed-on and Tajweed-off states, ensuring universal Ayah end-markers across every Surah, and locking down accidental Android text selection traps.
> * **Multilingual Offline Tafsir Library & Alphabetical Catalog (v3.0):** Added a dedicated A-Z Downloads catalog supporting Bangla (*Tafsir Zakariya*, *Ahsanul Bayaan*, *Abu Bakr Zakariya*, *Fathul Majid*), Arabic, English, Indonesian, Kurdish, Russian, and Urdu backed by Surah-by-Surah IndexedDB caching, pause/resume progress tracking, and inline Reader / standalone Tafsir integration.
> * **Synced Word-by-Word Hydration & Full Settings Hub (v3.1):** Eliminated Surah/Ayah sync mismatches with IndexedDB v5 `verse_cache` per-word hydration across all 114 Surahs, responsive overflow-safe WBW cards, bottom audio synchronization, and a dedicated Sidebar **Settings** screen with live typography previews.
> * **Decluttered Timetable-First Prayer Times + Temporary GPS (v3.0 -> v3.1):** Moved countdown and daily schedules straight to the top of the screen, introduced a Prayer-scoped collapsible mini settings panel (auto-opening on first unconfigured visit), repaired solar negative-longitude arithmetic, added Standard/Hanafi Asr calculation, and integrated single-shot coarse GPS lookup.
> * **Soft Warm Espresso Sepia, Sleek Media Player Card & Custom Adaptive Launcher Icon (v3.0 -> v3.4):** Recalibrated Dark + Reading Comfort into low-strain warm espresso surfaces with gold-taupe hairline borders, synced native Android system bars and Compose Rub el Hizb splash, removed bottom player badge clutter in favor of sleek notification-card styling, and introduced the signature teal geometric emblem icon.

---

## Version 3.5 (Current Release - Build 24)
**Release Focus:** Sifr Mistadir Glyph Repair, Universal Ayah End-Numbering, Unselectable Reader Lock Prevention & Generation 3 Release Notes

### Arabic Typography, Diacritic Shaping & Verse Completeness
* **Sifr Mistadir (`U+06DF`) Multi-Script & Tajweed-Off Fix:** Fixed the visual defect where Sifr Mistadir on silent letters (e.g., `كَفَرُوا۟`) appeared as an outlined dotted circle in Uthmani (when Tajweed was disabled) or disappeared in IndoPak. Root binary inspection revealed `uthmanic_hafs.ttf` v0.18 mapped `U+06DF` to a wide dotted-circle composite glyph and `indopak_nastaleeq.ttf` mapped `U+06DF` to an empty glyph, whereas `U+0652` is properly GPOS-anchored (`gdefClass=3`, zero advance) in both fonts. Added `normalizeFontMarksForScript()` plus full Unicode-cluster shaping in `applyClientTajweedHtml()` even when Tajweed is turned off so Sifr Mistadir renders cleanly across **Uthmani**, **IndoPak**, **Imla'i**, **Search**, and **Word-by-Word** regardless of Tajweed state.
* **Universal Ayah End-Numbering Across All Surahs:** Added explicit ornate verse ending suffixes (`﴿1﴾`-`﴿7﴾`) across curated bundled chapters (**Surah Al-Fatihah**, **Al-Ikhlas**, **Al-Falaq**, **An-Nas**, and **Ayat al-Kursi `2:255`**), and introduced a universal `ensureVerseEndingNumber()` guard inside `renderVerseArabicHtml()` and Search rendering so any Surah or hydrated Ayah missing a trailing badge automatically displays its matching script marker.
* **Word-by-Word Fallback Token Filter:** Excluded trailing verse-number markers (`﴿N﴾` / `(N)`) from synthetic word splitting in `getVerseWords()` so verse numbers never appear as extra clickable word cards.

### Android Interaction & Documentation Polish
* **Unselectable Reader & UI Surfaces:** Applied `-webkit-user-select: none` / `user-select: none` and `-webkit-touch-callout: none` across reader cards, Arabic verses, translations, Tafsir text, and Word-by-Word grids (preserving selection inside `input`, `textarea`, and `select`), preventing accidental Android WebView long-press selection handles from locking hardware Back navigation.
* **Complete Generation 3 (v3.0-v3.5) Changelog & GitHub Notes:** Updated in-app Version History (`#section-releases`), one-tap `Copy v3.0-v3.5 (Gen 3)` controls, `RELEASE_NOTES.md`, and `README.md` with full coverage of v3.4 and v3.5.

---

## Version 3.4 (Build 23)
**Release Focus:** Audio Player Bar Decluttering & Android Media Notification Card Polish

### Bottom Audio Bar Enhancements
* **Removed Redundant Offline/Stream Badge:** Stripped the unnecessary status pill from the compact bottom audio player bar so Surah names, Ayah positions, and Qari titles display with full clarity on compact handheld viewports.
* **Media Notification Player Card Styling:** Upgraded `.bottom-audio-bar` with sleek frosted glass elevation, subtle top specular highlight, refined spacing, and high-contrast circular playback controls inspired by modern Android media notification cards.

---

## Version 3.3 (Build 22)
**Release Focus:** Bundled Quranic Arabic Fonts, Full Script Switching (`Uthmani` / `IndoPak` / `Imla'i`) & Universal Multi-Script Tajweed

### Static Quranic Typography & Missing-Letter Fix
* **Replaced Broken Font Stub:** Replaced the 47 KB Latin-only `amiri.ttf` subset (which previously forced Android WebView onto basic system fonts missing specialized Quranic symbols) with full static Arabic TTF fonts bundled inside `app/src/main/res/font/`:
  * `uthmanic_hafs.ttf` (King Fahd Glorious Quran Printing Complex Hafs script)
  * `indopak_nastaleeq.ttf` (IndoPak Nastaleeq including Quran.com PUA waqf glyphs)
  * `noto_naskh_arabic.ttf` (Imla'i Naskh typography)
  * `amiri.ttf` (Full 1,699-glyph Arabic/Quranic/Urdu fallback font)
* **Local `@font-face` & CSS Script Binding:** Registered all fonts in `styles.css` via `WebViewAssetLoader` (`/res/font/*.ttf`) and wired `--arabic-font-family` + `data-script` rules across Reader verses, Bismillah banners, Search cards, Tafsir viewer, Settings live preview, and Word-by-Word tiles.

### Script Switching & Multi-Script Tajweed Engine
* **Eliminated Tajweed Override Bug:** Fixed `loadSurah` and `updateSettingsPreview` where Uthmani Tajweed markup previously overrode IndoPak and Imla'i script selections whenever Tajweed was enabled.
* **API v4 Field Hydration Upgrade:** Updated `QuranTextHydratorEngine` to request `&fields=text_uthmani,text_indopak,text_imlaei,text_uthmani_tajweed` and automatically upgrade previously cached `verse_cache` records in the background while retaining immediate offline fallback.
* **Cluster-Safe Tajweed Highlighter:** Added `sanitizeTajweedHtml` and a Unicode-cluster Tajweed engine (`applyClientTajweedHtml`) so Tajweed color rules (`Ghunnah`, `Ikhfa`, `Idgham`, `Iqlab`, `Qalqalah`, `Madd`, `Laam Shamsiyah`, `Hamzat al-Wasl`) render across Uthmani, IndoPak, Imla'i, and Word-by-Word cards without breaking Arabic cursive ligatures.

---

## Version 3.1 (Build 20)
**Release Focus:** Synced Word-by-Word Hydration, Timetable-First Prayer Layout + Mini Settings Drawer & Complete Settings Hub

### Word-by-Word Surah/Ayah Sync & IndexedDB Hydration
* **Authentic Per-Verse Word Breakdown:** Added `QuranTextHydratorEngine` backed by IndexedDB (`QuranExplorerOfflineStorage_v2` DB v5 `verse_cache` store) to fetch and cache authentic Arabic word tokens, transliterations, literal word meanings, and Sahih International text whenever viewing Surahs or Ayahs beyond the bundled starter set, eliminating repeated placeholder words.
* **Interactive Selector Bar & Bottom Audio Sync:** Added dedicated Surah and Ayah dropdowns with `Prev`/`Next` verse steppers inside Word-by-Word, kept inline ayah breakdowns and the bottom audio player synchronized with the selected Ayah, and added instant **Retry Sync** recovery cards when offline without cached words.

### Decluttered Prayer Times & Mini Settings Panel
* **Schedule-First Viewport:** Placed the Next Prayer Countdown Banner and 6-prayer timetable directly at the top of **Prayer Times** so timings are immediately visible without scrolling past configuration forms.
* **Dedicated Prayer Mini Settings Drawer:** Added a collapsible **Prayer Settings** panel scoped exclusively to Prayer Times—auto-opening on the first unconfigured launch and housing **Detect Area (GPS)**, **Verify Online**, regional presets (**Bangladesh**, **India**, **Indonesia**, **Qatar**), Country/City selectors, calculation convention, and Standard/Hanafi Asr toggle without badge collisions.

### Complete Settings Hub (`#section-settings`)
* **Dedicated Sidebar & Quick Settings Entry:** Added **Settings** in the navigation drawer (`Preferences & About -> Settings`) and an **All Settings** button inside Quick Settings.
* **Live Preview & Granular Preferences:** Includes a real-time preview Ayah card plus controls for Theme (`Dark`/`Light`), Reading Comfort (`Warm Sepia`), Arabic Script (`Uthmani`/`IndoPak`/`Imla'i`), Arabic Font Size (`20px-42px`), Translation Font Size (`12px-22px`), WBW Scale, Tafsir Scale, Tajweed Mode (`Off`/`Basic`/`Full Color`), Always Show English + Secondary Translation, Default Tafsir edition, Default Qari (Reciter), Playback Speed (`0.75x-1.5x`), Auto-Play Next Ayah, Repeat Current Ayah, and Reset Defaults.

---

## Version 3.0 (Build 19)
**Release Focus:** Word-by-Word Containment & Viewport Theme Continuity, Espresso Sepia Polish, Multilingual Offline Tafsir Library & Temporary GPS Regional Prayer Times

### Visuals, Layout & Dark + Warm Sepia Polish
* **Word-by-Word Overflow & Containment Fix:** Updated `.inline-wbw-grid` and `.word-by-word-container` to responsive `minmax(min(..., 100%), 1fr)` layouts with `overflow-wrap: anywhere` and `A-`/`A+` scaling controls (`85%`-`135%`) so long Arabic glyphs and translations never clip or break mobile card borders.
* **Root Viewport Bottom Theme Continuity:** Mirrored `data-theme` and `reading-comfort` tokens onto both `<html>` (`:root`) and `<body>` with full-height flex canvas layout, eliminating the unstyled `#070C10` bottom strip on shorter screens such as Dashboard, Tafsir, and Word-by-Word.
* **Soft Warm Espresso Dark Sepia:** Refreshed Dark + Reading Comfort with warm espresso surfaces (`#15120F`), neutral cream-sand text (`#EFE6D8`), restrained sage-emerald accents (`#3FA883`), muted gold-taupe highlights (`#C9A461`), hairline gold-taupe borders, and subtle inner card lining (`--card-lining`) synced with Android system bars.

### Major Highlight 1: Downloads -> Multilingual Tafsir Library
* **Alphabetical Language Grouping (A-Z):** Added a dedicated Tafsir catalog in Downloads covering **Arabic**, **Bangla** (*Tafsir Zakariya*, *Ahsanul Bayaan*, *Abu Bakr Zakariya*, *Tafsir Fathul Majid*), **English**, **Indonesian**, **Kurdish**, **Russian**, and **Urdu**, plus 3 bundled Always-Offline classics.
* **IndexedDB Surah-by-Surah Offline Cache:** Upgraded IndexedDB (`QuranExplorerOfflineStorage_v2` DB v4) with `tafsir_editions` and `tafsir_chapters` stores, live progress/pause/resume/delete controls, storage telemetry, and filter pills (`All`, `Installed Only`, live search).
* **Direct Reader & Tafsir Viewer Integration:** Downloaded and built-in tafsirs appear immediately inside the Quran Reader ayah drawer and dedicated Tafsir section with `A-`/`A+` font scaling, proper RTL/LTR text alignment, and direct Download shortcuts.

### Major Highlight 2: Global & Regional Prayer Times + Temporary GPS
* **First-Open Region & GPS Onboarding:** Renamed Qatar-only branding to **Prayer Times** with an initial prompt offering **Detect My Area (Temporary GPS)** and quick presets for **Bangladesh (Dhaka)**, **India (New Delhi)**, **Indonesia (Jakarta)**, and **Qatar (Doha)**.
* **Single-Shot Least-Privilege Coarse GPS:** Added `AndroidLocationBridge` requesting only `ACCESS_COARSE_LOCATION` for a temporary single-shot location check with automatic 10-second timeout fallback and immediate listener teardown (`onDestroy()` cleanup included).
* **Fixed Solar Calculation Math & Method Controls:** Resolved negative longitude and solar equation-of-time wrap bugs (`normDeg` to `[0, 360)`, `totalMinutes` modulo `1440`), added 7 regional methods (`IFB Bangladesh`, `Karachi`, `KEMENAG Indonesia`, `Qatar`, `MWL`, `Umm al-Qura`, `ISNA`), Standard vs. Hanafi (2x shadow) Asr toggle, and daily-cached optional online timing verification.

---

## Version 2.5 (Build 18)
**Release Focus:** Obsidian-Emerald Theme Redesign, Bundled Offline Typography, Live System-Bar Sync, Studio Compositing & Layout QA Overhaul

### Visuals, Theme, Typography & Splash Screen
* **Obsidian-Emerald & Warm Alabaster Palette (WCAG AA):** Calibrated 4-tier dark surfaces (`#070C10` Obsidian canvas, `#0F1821` cards, `#15222E` interactive tiles, `#10C98F` emerald accents, `#E5B94C` gold highlights) paired with a balanced Warm Alabaster (`#F3EFE6`) light theme and semantic `--on-accent` / `--on-gold` ink contrast across both modes.
* **Bundled UI Typography & Safe Font Interception:** Ships `Plus Jakarta Sans` (`res/font/plus_jakarta_sans.ttf`) loaded via `WebViewAssetLoader` with explicit HTTP `200 OK` status headers (preventing Chromium IO thread crashes on resource fonts), while rendering Arabic Mushaf scripts cleanly using Android's full system Arabic font stack without missing-glyph subsets.
* **Lean Offline APK & Startup Speed:** Removed unused third-party SDK bloat from `app/build.gradle.kts` and deferred synchronous WebView service-worker initialization so app startup and Android emulator preview launch quickly and reliably.
* **Live Android System-Bar & Splash Theme Sync:** Added `AndroidThemeBridge` + persisted preference sync so Android status bar, navigation bar, Compose container, and startup Rub el Hizb splash screen match Dark, Light, Sepia Dark, and Sepia Light themes seamlessly with no startup flash.
* **Studio Compositing & Crisp Surface Pipeline:** Removed problematic `View.LAYER_TYPE_HARDWARE` WebView FBO wrapping, fixed wide-viewport scaling, eliminated heavy fixed-layer transforms and CSS `color-mix()`/`dvh` edge cases so scrolling, navigation drawers, and sticky bars render cleanly with zero tile stamping or tearing.
* **Styled In-App Confirmations & Soft Keyboard Handling:** Replaced native `window.confirm()` dialogs with themed `#appConfirmModal` prompts, and hid fixed bottom audio/floating controls while typing so inputs and filter views are never obscured.
* **Clean Precision Iconography & Responsive Layout:** Redesigned Quick Settings gear, navigation, mosque, and reader icons without Unicode emojis; refactored Read header actions into structured grids; made Downloads tabs, Quick Settings controls, and bottom audio player bars fit compact handheld widths cleanly.

### Bug Fixes, Navigation & Search Upgrades
* **Quick Settings Overlay Fix:** Moved Quick Settings into a top-level `<body>` layer (`z-index: 2600`) with explicit pixel height clamping from `window.innerHeight`, backdrop dismiss, Escape key handling, and grouped *Recitation & Speed* (`0.75x`, `1.0x`, `1.25x`, `1.5x`), *Script & Translation*, and *Study & Eye Care* controls.
* **Reading Comfort Mode (Edge-to-Edge Warm Sepia):** Applied calibrated Warm Sepia tokens across the entire document, bars, and system UI in both Dark and Light themes without blurry CSS `filter`, preserving crisp Arabic diacritics.
* **Search & Filtering Overhaul:**
  * Supports plain Surah name/number matching alongside `Surah:Ayah` references and verse text.
  * Displays results by default in two distinct, organized sections (**Matching Surahs** and **Matching Ayahs**) with query highlighting.
  * Adds Scope filter chips (**All**, **Surahs Only**, **Ayahs Only**, **Filter Out All**) and Origin filter chips (**All Revelations**, **Meccan**, **Medinan**).
* **Juz, Hizb & Page Navigator:** Segmented **Juz (30)**, **Hizb (60)**, and **Pages (1-604)** tabs with direct jump controls for every Juz, Hizb, and popular Mushaf landmarks.
* **Compact Location Metadata:** Added unobtrusive muted gray `Juz · Hizb · Page` indicators neatly at the bottom-left of Ayah, Search, Bookmark, Word-by-Word, and Tafsir cards.
* **In-App Tool & Compose Preview Repairs:** Fixed Downloads tabs/filters (`Audio`, `Translations`, `Tafsir`; `All`, `Saved`, `Juz 30`), replaced placeholder translation/tafsir download toggles with direct offline activation controls, repaired Word-by-Word speed/play/batch methods, synced prompt modal reciter selection, wired multi-source Tafsir switching (*Ibn Kathir*, *Al-Jalalayn*, *As-Saadi*), added live Qatar next-prayer countdown and Dashboard completion bar, and upgraded Compose `@Preview` screens.

---

## Version 2.4 (Build 15)
**Release Focus:** High-Refresh Rendering Performance & Virtualization

* Replaced expensive Gaussian backdrop blurs on fixed bars with hardware-composited surfaces.
* Applied CSS rendering containment (`content-visibility: auto`) to verse containers, Surah cards, and Word-by-Word tiles so long chapters render under 30ms.
* Bound scroll listeners with `{ passive: true }` and `requestAnimationFrame`, and disabled WebView stretch overscroll jitter.

---

## Version 2.3 (Build 14)
**Release Focus:** Responsive Orientation, Safe-Area Insets & History Stack

* Added adaptive sizing rules across portrait handhelds, landscape viewports, foldables, and tablets.
* Handled dynamic `safe-area-inset` boundaries to prevent overlaps with camera cutouts and Android system bars.
* Added top-bar and hardware Back history navigation across sections.

---

## Version 2.2 (Build 13)
**Release Focus:** Full Quran (114 Surahs) Batch Downloader & IndexedDB Cache

* Added one-tap batch downloader for all 114 Surahs or Juz 30 with pause/resume progress tracking.
* Added IndexedDB storage usage monitoring and per-reciter audio cache cleanup.
* Displayed online stream vs. offline saved status badges across reader and catalog screens.

---

## Version 2.1 (Build 12)
**Release Focus:** Multi-Reciter Audio Engine & Ayah Loop Mode

* Integrated multiple Qari profiles (Mishary Alafasy, Abdul Basit, Al-Husary, Saad Al-Ghamdi, Al-Minshawi, Abu Bakr Al-Shatri).
* Added single-Ayah repeat loop mode for Hifz memorization and a Quick Settings control menu.

---

## Version 2.0 (Builds 9-11)
**Release Focus:** Word-by-Word Breakdown, Tajweed Highlighting & Classical Tafsir

* Added interactive Word-by-Word breakdown with transliteration, literal translation, and per-word audio playback.
* Added dynamic color-coded Tajweed rules (Ghunnah, Ikhfa, Idgham, Qalqalah, Madd) with a visual guide.
* Introduced classical Tafsir commentary viewer and personal reading streak dashboard.

---

## Version 1.7 (Builds 7-8)
**Release Focus:** Global Full-Text Search, Variable Speeds & Multi-Script Support

* Indexed all 114 Surahs and 6,236 Ayahs for instant offline keyword lookup.
* Added selectable audio playback speeds (`0.75x`, `1.0x`, `1.25x`, `1.5x`) and Uthmani / IndoPak / Imla'i script switching.

---

## Version 1.5 (Builds 5-6)
**Release Focus:** Juz Index, Qatar Solar Prayer Times & Additional Translations

* Added the 30 Juz index and astronomical solar calculation engine for Doha, Qatar prayer times plus daily checklist.
* Added Bengali, Urdu, and French translations alongside bundled English text.

---

## Version 1.4 (Build 4)
**Release Focus:** Continuous Audio Autoplay & Offline Assets

* Added automatic Ayah-to-Ayah recitation progression with scrubbable bottom player seekbar.
* Added Surah catalog filtering, collapsible navigation drawer, and persistent session restore.

---

## Version 1.0 (Builds 1-3)
**Release Focus:** Initial Platform Foundation

* Packaged all 114 Surahs and 6,236 Ayahs offline inside a Jetpack Compose + `WebViewAssetLoader` Android application.
