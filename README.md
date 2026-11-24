# Quran Explorer

*This app was ported as a final upgrade for [Gen 2 legacy](https://github.com/rabayakhanam82-a11y/Quran-Exploer)*
 

<div align="center">

[![Android Version](https://img.shields.io/badge/Android-7.0%2B%20(API%2024%2B)-10C98F?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Version](https://img.shields.io/badge/Version-v3.5%20(Build%2024)-E5B94C?style=for-the-badge&logo=google-play&logoColor=black)](./RELEASE_NOTES.md)
[![License](https://img.shields.io/badge/License-MIT-099A6C?style=for-the-badge)](./LICENSE)
[![Direct APK](https://img.shields.io/badge/APK-Direct%20Download-10C98F?style=for-the-badge&logo=android)](./QuranExplorer.apk)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-15222E?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AbdullahKarim/Quran-Explorer)

**An offline-first Holy Quran application built with Kotlin, Jetpack Compose, Material Design 3, and a modular hardware-accelerated WebView reader.**

[Download Latest APK](https://github.com/24-25ht/Quran-Explorer/releases/download/v3.5-Taurus/QuranExplorer-v3.5.apk) · [Screenshots](#screenshots) · [Key Features](#key-features) · [Architecture](#technical-architecture) · [Building from Source](#building-from-source)

</div>

---

## Downloads

| Version | Download | Details |
| :--- | :--- | :--- |
| **Latest (v3.5)** | **[Download Latest APK](https://github.com/24-25ht/Quran-Explorer/releases/download/v3.5-Taurus/QuranExplorer-v3.5.apk)** | Universal APK · Generation 3 finale |
| **Direct Latest** | **[QuranExplorer.apk](./QuranExplorer.apk)** | Repository copy of the latest APK |
| **Version 2.5** | **[Download v2.5 APK](https://github.com/24-25ht/Quran-Explorer/releases/download/v2.5-Aries/Quran-explorer.2.5.apk)** | Legacy Generation 2 archive |

### Quick Installation

1. Download an APK from the table above.
2. Open the `.apk` file on your Android device and tap **Install** (enable **Install unknown apps** if prompted).
3. Launch **Quran Explorer** and begin reading or downloading offline audio and tafsirs.

---

## Screenshots

> **Theme note:** These screenshots show the app in **Warm Sepia** and **Dark Mode**. Your app will look the same only if you select the corresponding theme and reading-comfort settings; other settings may change its appearance.

<div align="center">

<img src="./Screenshot_20261124_210424_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 1" width="220">
<img src="./Screenshot_20261124_223607_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 2" width="220">
<img src="./Screenshot_20261124_223616_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 3" width="220">
<img src="./Screenshot_20261124_223624_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 4" width="220">
<img src="./Screenshot_20261124_223632_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 5" width="220">
<img src="./Screenshot_20261124_223640_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 6" width="220">
<img src="./Screenshot_20261124_223651_Quran%20Explorer.jpg" alt="Quran Explorer screenshot 7" width="220">

</div>

See the [screenshot index](./screenshots/README.md) for the ordered image list.

---

## Key Features

### Obsidian-Emerald, Warm Alabaster & Soft Warm Espresso Sepia
* **Intentional Color Hierarchy & AA Contrast:** Calibrated dark surfaces (`#070C10` Obsidian canvas, `#0F1821` elevated cards, `#15222E` interactive tiles, `#10C98F` emerald accents, and `#E5B94C` warm gold) for clear emphasis and accessible text.
* **Soft Warm Espresso Sepia (Dark + Reading Comfort):** Toned-down espresso background (`#15120F`), neutral cream-sand typography (`#EFE6D8`), restrained sage-emerald accents (`#3FA883`), muted gold highlights, and comfortable low-distraction reading surfaces.
* **Root Theme Viewport Continuity:** Mirrors theme and reading-comfort attributes across both `<html>` and `<body>` with full-height flex layout.
* **Bundled Offline Arabic & UI Typography:** Ships Plus Jakarta Sans, Uthmanic Hafs, IndoPak Nastaleeq, Noto Naskh Arabic, and full Arabic-capable fallback fonts.
* **Cohesive Launch Splash:** Custom Jetpack Compose geometric Rub el Hizb splash screen synced to the user's persisted theme with an animated fade-out sequence.
* **Precision Vector Iconography & Branded Dialogs:** Clean stroke-aligned SVG icons paired with styled in-app confirmation dialogs.

### Downloads → Alphabetical Multilingual Tafsir Library
* **Alphabetical Language Grouping:** Browse multilingual tafsirs grouped strictly A-Z by language.
* **Surah-by-Surah IndexedDB Caching:** Downloads, pauses, resumes, retries, and removes full 114-Surah commentary editions with live progress.
* **Seamless Reader & Standalone Integration:** Open downloaded or built-in tafsirs inside the inline reader or dedicated Tafsir reader.

### Global & Regional Prayer Times + Mini Settings Panel
* **Timetable-First Layout:** Displays the live next prayer countdown, daily timetable, and prayer tracker toggle immediately at the top.
* **Dedicated Prayer Mini Settings Drawer:** Includes area detection, online verification, regional presets, calculation methods, and manual controls.
* **Privacy-First Temporary Coarse GPS:** Uses `ACCESS_COARSE_LOCATION` for a single-shot city-level lookup with timeout fallback.
* **Fixed Astronomical Solar Math & Hanafi Support:** Supports standard and Hanafi Asr calculations with corrected solar wrap-around arithmetic.

### Complete Settings Hub & Reading Personalization
* **Dedicated Sidebar Settings:** Accessible through Preferences & About and the Quick Settings panel.
* **Typography, Audio & Commentary Controls:** Configure theme, sepia comfort, Arabic script, font sizes, reciters, and translation preferences.

### Search, Smart Filtering & Juz / Hizb / Page Navigation
* **Unified Surah & Ayah Search:** Matches Surah names, transliterations, chapter numbers, `Surah:Ayah` references, and English keywords.
* **Split Result Sections & Filter Chips:** Separates matching Surahs and Ayahs with scope and filter controls.
* **Tabbed Navigator:** Jump to any of 30 Juz, 60 Hizb, or 604 Pages.

### Offline Quranic Study, Synced Word-by-Word & Multi-Reciter Audio
* **Synced Word-by-Word & Quran.com Hydration:** Dedicated Surah/Ayah selectors with per-word Arabic tokens and cached metadata.
* **Multiple World-Class Qaris:** Includes Mishary Rashid Alafasy, Abdul Basit Abdul Samad, Mahmoud Khalil Al-Husary, Saad Al-Ghamdi, Muhammad Siddiq Al-Minshawi, and Abu Bakr Al-Shatri.
* **Tajweed & Progress Tracking:** Basic and full-color Tajweed highlighting, prayer tracker, reading streak, and Quran completion meter.

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
│   │   │   ├── font/                    # Bundled Arabic and UI fonts
│   │   │   └── values/themes.xml        # Obsidian window/bar configuration
│   │   └── assets/
│   │       ├── index.html               # Modular HTML shell, Prayer/Tafsir UI & SVG sprite
│   │       ├── styles.css               # Obsidian-Emerald, Espresso Sepia & responsive CSS
│   │       ├── app.js                   # UI, Tafsir reader, Tajweed, GPS prayers & search
│   │       ├── quran-data.js            # Offline Quran index, prayer math & regional catalog
│   │       └── quran-audio-downloads.js # IndexedDB audio and Tafsir cache engine
│   └── build.gradle.kts                 # versionCode 24, versionName "3.5"
├── apk/
│   ├── QuranExplorer-latest.apk
│   └── QuranExplorer-v3.5.apk
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
