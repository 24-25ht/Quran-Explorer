# Quran Explorer

*This app was ported as a final upgrade for [Gen 2 legacy](https://github.com/rabayakhanam82-a11y/Quran-Exploer)*
 

<div align="center">

[![Android Version](https://img.shields.io/badge/Android-7.0%2B%20(API%2024%2B)-10C98F?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Version](https://img.shields.io/badge/Version-v3.5%20(Build%2024)-E5B94C?style=for-the-badge&logo=google-play&logoColor=black)](./RELEASE_NOTES.md)
[![License](https://img.shields.io/badge/License-MIT-099A6C?style=for-the-badge)](./LICENSE)
[![Direct APK](https://img.shields.io/badge/APK-Direct%20Download-10C98F?style=for-the-badge&logo=android)](./QuranExplorer.apk)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-15222E?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AbdullahKarim/Quran-Explorer)

**An offline-first Holy Quran application built with Kotlin, Jetpack Compose, Material Design 3, and a modular hardware-accelerated WebView reader.**

[Download Latest APK](https://github.com/24-25ht/Quran-Explorer/releases/download/v3.5-Taurus/QuranExplorer-v3.5.apk) · [Key Features](#key-features) · [Architecture](#technical-architecture) · [Release Notes](./RELEASE_NOTES.md) · [GitHub Repo](https://github.com/AbdullahKarim/Quran-Explorer)

</div>

---

## Direct APK Download

Compiled Android application binaries are available directly inside this repository for quick installation:

| File | Architecture | Description |
| :--- | :---: | :--- |
| **[`QuranExplorer.apk`](./QuranExplorer.apk)** | Universal (`arm64-v8a`, `armeabi-v7a`, `x86_64`) | Latest v3.5 (Build 24) APK |
| **[`apk/QuranExplorer-latest.apk`](./apk/QuranExplorer-latest.apk)** | Universal | Latest distribution mirror |
| **[`apk/QuranExplorer-v3.5.apk`](./apk/QuranExplorer-v3.5.apk)** | Universal | Version 3.5 (Generation 3 Finale) archive |
| **[`apk/QuranExplorer-v3.4.apk`](./apk/QuranExplorer-v3.4.apk)** | Universal | Version 3.4 milestone archive |
| **[`apk/QuranExplorer-v3.3.apk`](./apk/QuranExplorer-v3.3.apk)** | Universal | Version 3.3 milestone archive |
| **[`apk/QuranExplorer-v3.1.apk`](./apk/QuranExplorer-v3.1.apk)** | Universal | Version 3.1 archive |
| **[`apk/QuranExplorer-v2.5.apk`](./apk/QuranExplorer-v2.5.apk)** | Universal | Version 2.5 archive |

### Quick Installation
1. In **Google AI Studio**, click **Settings -> Generate APK** (or **Export ZIP** / **Push to GitHub** to access `QuranExplorer.apk` and `apk/QuranExplorer-latest.apk`, as binary `.apk` files are hidden in the web Code text explorer).
2. Open the `.apk` file on your Android device and tap **Install** *(enable "Install unknown apps" if prompted)*.
3. Launch **Quran Explorer** and begin reading or downloading offline audio and tafsirs immediately.

---

## Key Features

### Obsidian-Emerald, Warm Alabaster & Soft Warm Espresso Sepia
* **Intentional Color Hierarchy & AA Contrast:** Calibrated dark surfaces (`#070C10` Obsidian canvas, `#0F1821` elevated cards, `#15222E` interactive tiles, `#10C98F` emerald accents, and `#E5B94C` champagne-gold highlights) paired with a high-contrast Warm Alabaster (`#F3EFE6`) light theme and live Android status/navigation bar sync.
* **Soft Warm Espresso Sepia (Dark + Reading Comfort):** Toned-down espresso background (`#15120F`), neutral cream-sand typography (`#EFE6D8`), restrained sage-emerald accents (`#3FA883`), muted gold-taupe highlights (`#C9A461`), and subtle inner card lining (`--card-lining`) for low-strain night reading.
* **Root Theme Viewport Continuity:** Mirrors theme and reading-comfort attributes across both `<html>` and `<body>` with full-height flex layout so short sections (Dashboard, Word-by-Word, Tafsir) never expose an unstyled dark bottom strip.
* **Bundled Offline Arabic & UI Typography:** Ships `Plus Jakarta Sans`, `Uthmanic Hafs` (`KFGQPC`), `IndoPak Nastaleeq` (including Quran.com PUA waqf glyphs), `Noto Naskh Arabic`, and full Arabic `Amiri` inside `res/font/` via `WebViewAssetLoader` (HTTP `200 OK`), paired with `data-script` font switching and multi-script Tajweed highlighting without missing diacritics or tofu glyphs.
* **Cohesive Launch Splash:** Custom Jetpack Compose geometric Rub el Hizb splash screen synced to the user's persisted theme (`Dark`, `Light`, `Sepia Dark`, `Sepia Light`) with animated fade-out once WebView finishes mounting.
* **Precision Vector Iconography & Branded Dialogs:** Clean stroke-aligned SVG sprite across navigation, settings, prayer tools, and media controls, paired with styled in-app confirmation dialogs.

### Downloads -> Alphabetical Multilingual Tafsir Library
* **Alphabetical Language Grouping:** Browse 16 downloadable tafsirs grouped strictly A-Z by language (including **Arabic**, **Bangla** — *Tafsir Zakariya*, *Ahsanul Bayaan*, *Abu Bakr Zakariya*, *Tafsir Fathul Majid*, **English**, **Indonesian**, **Kurdish**, **Russian**, and **Urdu**) alongside 3 always-offline built-in quick classics.
* **Surah-by-Surah IndexedDB Caching:** Downloads, pauses, resumes, retries, and removes full 114-Surah commentary editions inside IndexedDB (`tafsir_editions` & `tafsir_chapters`) with live megabyte usage tracking and search/installed filter pills.
* **Seamless Reader & Standalone Integration:** Open any downloaded or built-in tafsir directly inside the inline Quran Reader ayah drawer or the dedicated Tafsir reader with `A-`/`A+` font scaling, RTL/LTR directional rendering, and instant download shortcuts.

### Global & Regional Prayer Times + Mini Settings Panel
* **Timetable-First Layout:** Displays the live Next Prayer Countdown, daily prayer timetable, and Prayer Tracker toggle immediately at the top of the screen with zero scrolling past configuration forms.
* **Dedicated Prayer Mini Settings Drawer:** Auto-opens only on the first unconfigured visit and toggles via **Prayer Settings**, housing **Detect Area (GPS)**, **Verify Online**, regional presets (**Bangladesh**, **India**, **Indonesia**, **Qatar**), Country/City selectors, 7 calculation conventions, and Standard/Hanafi Asr toggle cleanly without flex overlaps.
* **Privacy-First Temporary Coarse GPS:** Uses least-privilege city-level `ACCESS_COARSE_LOCATION` for a single-shot lookup with an automatic 10-second timeout fallback and immediate hardware listener cleanup.
* **Fixed Astronomical Solar Math & Hanafi Support:** Corrected negative longitude/equation-of-time solar wrap-around arithmetic, Standard (Shafi'i) vs. Hanafi (2x shadow) Asr school toggle, and daily-cached optional online schedule verification.

### Complete Settings Hub & Reading Personalization
* **Dedicated Sidebar Settings Section:** Accessible from **Preferences & About -> Settings** and Quick Settings (**All Settings**) with a live Ayah preview card that updates in real time.
* **Typography, Audio & Commentary Controls:** Configure Theme, Warm Sepia Reading Comfort, Arabic Script (`Uthmani`, `IndoPak`, `Imla'i`), Arabic Font Size (`20px-42px`), Translation Font Size (`12px-22px`), WBW & Tafsir scales, Tajweed mode (`Off`, `Basic`, `Full`), Always Show English + Secondary Translation, **Default Tafsir edition**, **Default Qari (Reciter)**, Playback Speed (`0.75x-1.5x`), Auto-Play Next Ayah, Repeat Current Ayah, and Reset Defaults.

### Search, Smart Filtering & Juz / Hizb / Page Navigation
* **Unified Surah & Ayah Search:** Matches plain Surah names (Arabic, English, normalized transliteration, and chapter numbers) alongside `Surah:Ayah` references and English keywords.
* **Split Result Sections & Filter Chips:** Defaults to **Matching Surahs** and **Matching Ayahs** in separate sections with scope chips (**All**, **Surahs Only**, **Ayahs Only**, **Filter Out All**) and revelation chips (**All**, **Meccan**, **Medinan**).
* **Tabbed Navigator & Compact Verse Metadata:** Jump to any of **30 Juz**, **60 Hizb**, or **604 Pages**, with unobtrusive muted gray `Juz X · Hizb Y · Page Z` footer tags on verse cards.

### Offline Quranic Study, Synced Word-by-Word & Multi-Reciter Audio
* **Synced Word-by-Word & Quran.com Hydration:** Dedicated Surah/Ayah selectors, `Prev`/`Next` verse steppers, and bottom-bar synchronization fetch and cache authentic per-word Arabic tokens (`QuranExplorerOfflineStorage_v2` DB v5 `verse_cache`) whenever viewing chapters outside the bundled starter Surahs, eliminating stale fallback tokens while preserving `A-`/`A+` containment scaling.
* **6 World-Class Qaris & Batch Audio Cache:** Mishary Rashid Alafasy, Abdul Basit Abdul Samad, Mahmoud Khalil Al-Husary, Saad Al-Ghamdi, Muhammad Siddiq Al-Minshawi, and Abu Bakr Al-Shatri with `0.75x`-`1.5x` speed, Ayah loop, Auto-Play Next Ayah, and 114-Surah / Juz 30 IndexedDB downloads.
* **Tajweed & Progress Tracking:** Basic and Full-Color Tajweed highlighting rules, daily prayer tracker checklist, reading streak calculator, and Quran completion meter.

---

## Technical Architecture

```text
QuranExplorer/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml          # INTERNET, ACCESS_COARSE_LOCATION only
│   │   ├── java/com/example/
│   │   │   ├── MainActivity.kt          # Edge-to-Edge Compose host, Splash & Location Bridge
│   │   │   └── ui/theme/                # Material 3 Color.kt & Theme.kt
│   │   ├── res/
│   │   │   ├── font/                    # Bundled Uthmanic Hafs, IndoPak Nastaleeq, Noto Naskh, Amiri, Plus Jakarta Sans
│   │   │   └── values/themes.xml        # Obsidian window/bar configuration
│   │   └── assets/
│   │       ├── index.html               # Modular HTML shell, Prayer/Tafsir UI & SVG sprite
│   │       ├── styles.css               # Obsidian-Emerald, Espresso Sepia & responsive grid CSS
│   │       ├── app.js                   # UI controller, Tafsir reader, multi-script Tajweed, GPS prayers & search
│   │       ├── quran-data.js            # Offline Quran index, solar prayer math & regional catalog
│   │       └── quran-audio-downloads.js # IndexedDB audio + multilingual Tafsir cache engine
│   └── build.gradle.kts                 # versionCode 24, versionName "3.5"
├── apk/
│   ├── QuranExplorer-latest.apk
│   ├── QuranExplorer-v3.5.apk
│   ├── QuranExplorer-v3.4.apk
│   ├── QuranExplorer-v3.3.apk
│   ├── QuranExplorer-v3.1.apk
│   ├── QuranExplorer-v3.0.apk
│   └── QuranExplorer-v2.5.apk
├── QuranExplorer.apk
├── RELEASE_NOTES.md
└── README.md
```

---

## Building from Source

### Prerequisites
* **JDK:** OpenJDK 17 or 21
* **Android SDK:** Compile SDK 36, Target SDK 35, Min SDK 24

### Gradle Commands
```bash
# Assemble Debug APK
gradle :app:assembleDebug

# Run Unit & Robolectric Tests
gradle :app:testDebugUnitTest
```

The compiled APK is generated at `app/build/outputs/apk/debug/app-debug.apk`.

---

## Release History

For complete itemized release notes covering **v1.0** through **v3.5 (Generation 3 Finale)**, see **[RELEASE_NOTES.md](./RELEASE_NOTES.md)**.

## Credits & Copyright

* **Developer:** **Abdullah Karim**
* **Repository:** [github.com/AbdullahKarim/Quran-Explorer](https://github.com/AbdullahKarim/Quran-Explorer)

Copyright &copy; 2026 Abdullah Karim. Licensed under the [MIT License](./LICENSE).
