# Quran Explorer

*This app was ported as a final upgrade for [Gen 2 legacy](https://github.com/rabayakhanam82-a11y/Quran-Exploer)*

<div align="center">

[![Android Version](https://img.shields.io/badge/Android-7.0%2B%20(API%2024%2B)-10C98F?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Version](https://img.shields.io/badge/Version-v3.5%20(Build%2024)-E5B94C?style=for-the-badge&logo=google-play&logoColor=black)](./RELEASE_NOTES.md)
[![License](https://img.shields.io/badge/License-MIT-099A6C?style=for-the-badge)](./LICENSE)
[![Direct APK](https://img.shields.io/badge/APK-Direct%20Download-10C98F?style=for-the-badge&logo=android)](./QuranExplorer.apk)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-15222E?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AbdullahKarim/Quran-Explorer)
[![GitHub Repo Legacy](https://img.shields.io/badge/GitHub-Repository-15222E?style=for-the-badge&logo=github&logoColor=white)]([https://github.com/AbdullahKarim/Quran-Explorer](https://github.com/rabayakhanam82-a11y/Quran-Exploer))

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

> **Theme disclaimer:** These screenshots were taken in **Warm Sepia** and **Dark Mode**. They will appear the same only if you select the corresponding theme and reading-comfort settings; other settings may change the app appearance.

The screenshots are arranged in a single-row table. On narrow screens, scroll the table horizontally to browse them.

| Screenshot 1 | Screenshot 2 | Screenshot 3 | Screenshot 4 | Screenshot 5 | Screenshot 6 | Screenshot 7 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| <img src="./Screenshot_20261124_210424_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 1" width="190"> | <img src="./Screenshot_20261124_223607_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 2" width="190"> | <img src="./Screenshot_20261124_223616_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 3" width="190"> | <img src="./Screenshot_20261124_223624_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 4" width="190"> | <img src="./Screenshot_20261124_223632_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 5" width="190"> | <img src="./Screenshot_20261124_223640_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 6" width="190"> | <img src="./Screenshot_20261124_223651_Quran%20Explorer.jpg" alt="Quran Explorer Screenshot 7" width="190"> |

---

## Key Features

### Obsidian-Emerald, Warm Alabaster & Soft Warm Espresso Sepia
* **Intentional Color Hierarchy & AA Contrast:** Calibrated dark surfaces (`#070C10` canvas, `#0F1821` elevated cards, `#15222E` interactive tiles, `#10C98F` emerald accents, and `#E5B94C` warm gold).
* **Soft Warm Espresso Sepia:** Toned-down espresso background (`#15120F`), cream-sand typography (`#EFE6D8`), sage-emerald accents (`#3FA883`), and comfortable reading surfaces.
* **Root Theme Viewport Continuity:** Mirrors theme and reading-comfort attributes across `<html>` and `<body>` with a full-height flex layout.
* **Bundled Offline Typography:** Includes Plus Jakarta Sans, Uthmanic Hafs, IndoPak Nastaleeq, Noto Naskh Arabic, and Arabic-capable fallback fonts.
* **Cohesive Splash & UI:** Custom Jetpack Compose geometric Rub el Hizb splash, precision vector icons, and branded dialogs.

### Downloads → Alphabetical Multilingual Tafsir Library
* Browse multilingual tafsirs grouped A–Z by language.
* Download, pause, resume, retry, and remove complete 114-Surah commentary editions with live progress and IndexedDB caching.
* Open downloaded or built-in tafsirs in the inline reader or dedicated Tafsir reader.

### Global & Regional Prayer Times
* Timetable-first layout with next-prayer countdown, daily timetable, and prayer tracker.
* Prayer settings include area detection, online verification, regional presets, calculation methods, and manual controls.
* Privacy-first, single-shot coarse GPS lookup with timeout fallback; standard and Hanafi Asr calculations.

### Settings, Search & Navigation
* Configure theme, sepia comfort, Arabic script, font sizes, reciters, and translation preferences.
* Search Surah names, transliterations, chapter numbers, `Surah:Ayah` references, and English keywords, with scope and filter controls.
* Navigate by Juz, Hizb, or page using the tabbed navigator.

### Offline Quranic Study & Audio
* Synced word-by-word study with cached Quran.com metadata.
* Multiple reciters, Tajweed highlighting, prayer tracking, reading streaks, and Quran completion meter.

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
│   │   ├── res/                         # Fonts and window/bar themes
│   │   └── assets/
│   │       ├── index.html               # Modular HTML shell and UI
│   │       ├── styles.css               # Theme and responsive styles
│   │       ├── app.js                   # UI, readers, Tajweed, prayers & search
│   │       ├── quran-data.js            # Offline Quran index and prayer math
│   │       └── quran-audio-downloads.js # IndexedDB audio and Tafsir cache
│   └── build.gradle.kts                 # versionCode 24, versionName "3.5"
├── apk/
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
