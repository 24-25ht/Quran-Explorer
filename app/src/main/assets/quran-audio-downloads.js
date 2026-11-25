// Quran Explorer - Audio Player, Reciters Catalog & Offline Download Engine
// Production-grade implementation for offline storage and high-fidelity recitation streaming

(function (window) {
  'use strict';

  function getGlobalAyahNumber(surahNum, verseNum) {
    const s = Number(surahNum) || 1;
    const v = Number(verseNum) || 1;
    const surahs = (window.OfflineQuranDB && typeof window.OfflineQuranDB.getSurahs === 'function')
      ? window.OfflineQuranDB.getSurahs()
      : null;
    if (!Array.isArray(surahs) || !surahs.length) return v;
    let offset = 0;
    for (let i = 0; i < surahs.length; i++) {
      if (Number(surahs[i].number) === s) break;
      offset += Number(surahs[i].verses) || 0;
    }
    return offset + v;
  }

  // ========== RECITERS CATALOG ==========
  const RECITERS = [
    {
      id: 'ar.alafasy',
      name: 'Mishary Rashid Alafasy',
      arabic: 'مشاري راشد العفاسي',
      country: 'Kuwait',
      bitrate: '128 kbps',
      style: "Hafs 'an 'Asim (Clear & Melodious)",
      surahUrl: (num) => `https://server8.mp3quran.net/afs/${String(num).padStart(3, '0')}.mp3`,
      surahBackupUrl: (num) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${num}.mp3`,
      ayahUrl: (s, a) => `https://everyayah.com/data/Alafasy_128kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`,
      ayahBackupUrl: (s, a) => `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${getGlobalAyahNumber(s, a)}.mp3`
    },
    {
      id: 'ar.abdulbasitmurattal',
      name: 'Abdul Basit Abdul Samad',
      arabic: 'عبد الباسط عبد الصمد (مرتل)',
      country: 'Egypt',
      bitrate: '192 kbps',
      style: 'Murattal (Classic & Reverent)',
      surahUrl: (num) => `https://server7.mp3quran.net/basit/${String(num).padStart(3, '0')}.mp3`,
      surahBackupUrl: (num) => `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${num}.mp3`,
      ayahUrl: (s, a) => `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`,
      ayahBackupUrl: (s, a) => `https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/${getGlobalAyahNumber(s, a)}.mp3`
    },
    {
      id: 'ar.husary',
      name: 'Mahmoud Khalil Al-Husary',
      arabic: 'محمود خليل الحصري',
      country: 'Egypt',
      bitrate: '128 kbps',
      style: 'Tajweed Master (Ideal for Learning)',
      surahUrl: (num) => `https://server13.mp3quran.net/husr/${String(num).padStart(3, '0')}.mp3`,
      surahBackupUrl: (num) => `https://server13.mp3quran.net/husr/${String(num).padStart(3, '0')}.mp3`,
      ayahUrl: (s, a) => `https://everyayah.com/data/Husary_128kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`,
      ayahBackupUrl: (s, a) => `https://cdn.islamic.network/quran/audio/128/ar.husary/${getGlobalAyahNumber(s, a)}.mp3`
    },
    {
      id: 'ar.saadalghamidi',
      name: 'Saad Al-Ghamdi',
      arabic: 'سعد الغامدي',
      country: 'Saudi Arabia',
      bitrate: '128 kbps',
      style: 'Heartfelt & Serene Recitation',
      surahUrl: (num) => `https://server7.mp3quran.net/s_gmd/${String(num).padStart(3, '0')}.mp3`,
      surahBackupUrl: (num) => `https://server7.mp3quran.net/s_gmd/${String(num).padStart(3, '0')}.mp3`,
      ayahUrl: (s, a) => `https://everyayah.com/data/Ghamadi_40kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`,
      ayahBackupUrl: (s, a) => `https://verses.quran.com/Ghamadi_40kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`
    },
    {
      id: 'ar.minshawi',
      name: 'Muhammad Siddiq Al-Minshawi',
      arabic: 'محمد صديق المنشاوي (مرتل)',
      country: 'Egypt',
      bitrate: '128 kbps',
      style: 'Soul-Stirring Classical Murattal',
      surahUrl: (num) => `https://server10.mp3quran.net/minsh/${String(num).padStart(3, '0')}.mp3`,
      surahBackupUrl: (num) => `https://server10.mp3quran.net/minsh/${String(num).padStart(3, '0')}.mp3`,
      ayahUrl: (s, a) => `https://everyayah.com/data/Minshawy_Murattal_128kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`,
      ayahBackupUrl: (s, a) => `https://cdn.islamic.network/quran/audio/128/ar.minshawi/${getGlobalAyahNumber(s, a)}.mp3`
    },
    {
      id: 'ar.shaatree',
      name: 'Abu Bakr Al-Shatri',
      arabic: 'أبو بكر الشاطري',
      country: 'Saudi Arabia',
      bitrate: '128 kbps',
      style: 'Expressive & Melodic Tartil',
      surahUrl: (num) => `https://server11.mp3quran.net/shatri/${String(num).padStart(3, '0')}.mp3`,
      surahBackupUrl: (num) => `https://server11.mp3quran.net/shatri/${String(num).padStart(3, '0')}.mp3`,
      ayahUrl: (s, a) => `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`,
      ayahBackupUrl: (s, a) => `https://cdn.islamic.network/quran/audio/128/ar.shaatree/${getGlobalAyahNumber(s, a)}.mp3`
    }
  ];

  // Helper: Estimate Surah download size
  function getEstimatedSurahAudioSize(versesCount) {
    if (versesCount <= 10) return '0.8 MB';
    if (versesCount <= 30) return '1.5 MB';
    if (versesCount <= 60) return '3.2 MB';
    if (versesCount <= 120) return '7.5 MB';
    if (versesCount <= 180) return '12.0 MB';
    return '18.5 MB';
  }

  // ========== TRANSLATIONS & TAFSIR CATALOGS ==========
  const TRANSLATIONS = [
    { id: 'en.saheeh', name: 'English - Saheeh International', lang: 'English', native: 'English', size: '2.4 MB', bundled: true },
    { id: 'bn.bengali', name: 'Bengali - Dr. Abu Bakr Zakaria', lang: 'Bengali', native: 'বাংলা (আবু বকর জাকারিয়া)', size: '2.8 MB', bundled: true },
    { id: 'ur.jalandhry', name: 'Urdu - Fateh Muhammad Jalandhry', lang: 'Urdu', native: 'اردو (جالندھری)', size: '2.6 MB', bundled: true },
    { id: 'fr.hamidullah', name: 'French - Muhammad Hamidullah', lang: 'French', native: 'Français (Hamidullah)', size: '2.5 MB', bundled: true },
    { id: 'hi.farooq', name: 'Hindi - Muhammad Farooq Khan', lang: 'Hindi', native: 'हिन्दी (फारूक खान)', size: '2.7 MB', bundled: false },
    { id: 'id.indonesian', name: 'Indonesian - Bahasa Indonesia Kemenag', lang: 'Indonesian', native: 'Bahasa Indonesia', size: '2.5 MB', bundled: false },
    { id: 'tr.diyanet', name: 'Turkish - Diyanet Isleri', lang: 'Turkish', native: 'Türkçe (Diyanet)', size: '2.6 MB', bundled: false },
    { id: 'es.garcia', name: 'Spanish - Muhammad Isa Garcia', lang: 'Spanish', native: 'Español (Garcia)', size: '2.4 MB', bundled: false }
  ];

  const TAFSIR_CATALOG = [
    // Arabic
    { slug: 'ar-tafsir-al-jalalayn', name: 'Tafsir Al-Jalalayn', author: 'Al-Mahalli & As-Suyuti', language: 'Arabic', dir: 'rtl', quranComId: null, sizeEstimate: '4.5 MB', desc: 'Concise classical Arabic exegesis renowned for word-by-word clarity.' },
    { slug: 'ar-tafsir-muyassar', name: 'Tafsir Al-Muyassar', author: 'King Fahd Complex', language: 'Arabic', dir: 'rtl', quranComId: 16, sizeEstimate: '5.2 MB', desc: 'Accessible contemporary Arabic explanation commissioned by King Fahd Complex.' },
    { slug: 'ar-tafsir-ibn-kathir', name: 'Tafsir Ibn Kathir (Arabic)', author: 'Al-Hafiz Ibn Kathir', language: 'Arabic', dir: 'rtl', quranComId: 14, sizeEstimate: '18.5 MB', desc: 'Complete classical Tafsir al-Quran al-Azim in original Arabic.' },
    { slug: 'ar-tafsir-al-tabari', name: 'Tafsir Al-Tabari', author: 'Imam Muhammad ibn Jarir al-Tabari', language: 'Arabic', dir: 'rtl', quranComId: 15, sizeEstimate: '24.0 MB', desc: 'Foundational encyclopedic narration-based exegesis.' },

    // Bangla (strictly normalized under "Bangla" for alphabetical B grouping)
    { slug: 'bn-tafisr-fathul-majid', altSlugs: ['bn-tafsir-fathul-majid'], name: 'Tafsir Fathul Majid (Bangla)', author: 'Mawlana Abdur Rahim', language: 'Bangla', dir: 'ltr', quranComId: 381, sizeEstimate: '8.4 MB', desc: 'Clear, practical Bangla tafsir explaining legal, creed, and linguistic lessons.' },
    { slug: 'bn-tafsir-abu-bakr-zakaria', name: 'Tafsir Abu Bakr Zakaria (Bangla)', author: 'Dr. Abu Bakr Muhammad Zakaria', language: 'Bangla', dir: 'ltr', quranComId: 166, sizeEstimate: '9.8 MB', desc: 'Widely trusted scholarly Bangla tafsir published with King Fahd Complex backing.' },
    { slug: 'bn-tafsir-ahsanul-bayaan', name: 'Tafsir Ahsanul Bayaan (Bangla)', author: 'Salahuddin Yusuf / Mufti Mujibur Rahman', language: 'Bangla', dir: 'ltr', quranComId: 165, sizeEstimate: '7.9 MB', desc: 'Concise authentic Salafi-oriented Bangla commentary.' },
    { slug: 'bn-tafsir-ibn-kathir', altSlugs: ['bn-tafisr-ibn-kathir'], name: 'Tafsir Ibn Kathir (Bangla)', author: 'Al-Hafiz Ibn Kathir (Dr. Mujibur Rahman trans.)', language: 'Bangla', dir: 'ltr', quranComId: 164, sizeEstimate: '16.2 MB', desc: 'Comprehensive classical tafsir translated faithfully into Bangla.' },

    // English
    { slug: 'en-tafisr-ibn-kathir', altSlugs: ['en-tafsir-ibn-kathir'], name: 'Tafsir Ibn Kathir (Abridged English)', author: 'Al-Hafiz Ibn Kathir', language: 'English', dir: 'ltr', quranComId: 169, sizeEstimate: '14.5 MB', desc: 'Renowned classical exegesis with authentic hadiths and revelation context.' },
    { slug: 'en-tafsir-maarif-ul-quran', name: 'Maarif-ul-Quran (English)', author: 'Mufti Muhammad Shafi', language: 'English', dir: 'ltr', quranComId: 168, sizeEstimate: '17.0 MB', desc: 'Detailed eight-volume modern scholarly commentary translated to English.' },
    { slug: 'en-al-jalalayn', name: 'Tafsir Al-Jalalayn (English)', author: 'Al-Mahalli & As-Suyuti (Feras Hamza trans.)', language: 'English', dir: 'ltr', quranComId: 74, sizeEstimate: '4.9 MB', desc: 'English rendering of the concise classical Al-Jalalayn commentary.' },

    // Indonesian
    { slug: 'id-tafsir-ibn-kathir', name: 'Tafsir Ibn Katsir (Bahasa Indonesia)', author: 'Al-Hafiz Ibn Kathir', language: 'Indonesian', dir: 'ltr', quranComId: null, sizeEstimate: '13.4 MB', desc: 'Classical tafsir edition for Bahasa Indonesia readers.' },

    // Kurdish
    { slug: 'ku-tafsir-rebar', name: 'Rebar Kurdish Tafsir', author: 'Kurdish Scholarly Team', language: 'Kurdish', dir: 'rtl', quranComId: 804, sizeEstimate: '7.2 MB', desc: 'Accessible Central Kurdish commentary across all 114 chapters.' },

    // Russian
    { slug: 'ru-tafsir-al-saadi', name: 'Tafsir As-Saadi (Russian)', author: 'Shaykh Abdur-Rahman as-Saadi', language: 'Russian', dir: 'ltr', quranComId: 170, sizeEstimate: '9.1 MB', desc: 'Fluid spiritual exegesis in Russian.' },

    // Urdu
    { slug: 'ur-tafseer-ibn-e-kaseer', altSlugs: ['ur-tafsir-ibn-kathir'], name: 'Tafsir Ibn Kathir (Urdu)', author: 'Al-Hafiz Ibn Kathir (Junagarhi trans.)', language: 'Urdu', dir: 'rtl', quranComId: 160, sizeEstimate: '15.8 MB', desc: 'Classical Urdu translation of Tafsir Ibn Kathir.' },
    { slug: 'ur-tafsir-bayan-ul-quran', name: 'Tafsir Bayan-ul-Quran (Urdu)', author: 'Dr. Israr Ahmad', language: 'Urdu', dir: 'rtl', quranComId: 159, sizeEstimate: '11.2 MB', desc: 'Thematic and linguistic Urdu tafsir commentary.' }
  ];

  function normalizeTafsirLanguage(rawLang, slug = '') {
    const val = String(rawLang || '').trim().toLowerCase();
    const s = String(slug || '').toLowerCase();
    if (val === 'bn' || val === 'bengali' || val === 'bangla' || s.startsWith('bn-')) return 'Bangla';
    if (val === 'ar' || val === 'arabic' || s.startsWith('ar-')) return 'Arabic';
    if (val === 'en' || val === 'english' || s.startsWith('en-')) return 'English';
    if (val === 'id' || val === 'indonesian' || s.startsWith('id-')) return 'Indonesian';
    if (val === 'ku' || val === 'kurdish' || s.startsWith('ku-')) return 'Kurdish';
    if (val === 'ml' || val === 'malayalam' || s.startsWith('ml-')) return 'Malayalam';
    if (val === 'ru' || val === 'russian' || s.startsWith('ru-')) return 'Russian';
    if (val === 'tr' || val === 'turkish' || s.startsWith('tr-')) return 'Turkish';
    if (val === 'ur' || val === 'urdu' || s.startsWith('ur-')) return 'Urdu';
    if (!val) return 'Other';
    return rawLang.charAt(0).toUpperCase() + rawLang.slice(1);
  }

  // ========== INDEXED-DB OFFLINE STORAGE ENGINE ==========
  class OfflineStorageEngine {
    constructor() {
      this.dbName = 'QuranExplorerOfflineStorage_v2';
      this.db = null;
      this.initPromise = this.init();
    }

    init() {
      return new Promise((resolve) => {
        if (!window.indexedDB) {
          console.warn('IndexedDB not supported');
          resolve(null);
          return;
        }

        const request = window.indexedDB.open(this.dbName, 6);

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('audio_surahs')) {
            db.createObjectStore('audio_surahs', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('ayah_audio')) {
            db.createObjectStore('ayah_audio', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('translations')) {
            db.createObjectStore('translations', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('tafsir')) {
            db.createObjectStore('tafsir', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('wbw_audio')) {
            db.createObjectStore('wbw_audio', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('tafsir_editions')) {
            db.createObjectStore('tafsir_editions', { keyPath: 'slug' });
          }
          if (!db.objectStoreNames.contains('tafsir_chapters')) {
            db.createObjectStore('tafsir_chapters', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('verse_cache')) {
            db.createObjectStore('verse_cache', { keyPath: 'key' });
          }
        };

        request.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };

        request.onerror = (e) => {
          console.error('IndexedDB open error:', e);
          resolve(null);
        };
      });
    }

    async ensureReady() {
      if (!this.db) {
        await this.initPromise;
      }
      return this.db;
    }

    getAudioKey(reciterId, surahNum) {
      return `${reciterId}_${Number(surahNum)}`;
    }

    getAyahAudioKey(reciterId, surahNum, verseNum) {
      return `${reciterId}_${Number(surahNum)}_${Number(verseNum)}`;
    }

    async isSurahDownloaded(reciterId, surahNum) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('audio_surahs', 'readonly');
          const store = tx.objectStore('audio_surahs');
          const req = store.get(this.getAudioKey(reciterId, surahNum));
          req.onsuccess = () => resolve(!!(req.result && req.result.mode === 'ayahs'));
          req.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    // Alias for index.html compatibility
    async isSurahAudioDownloaded(reciterId, surahNum) {
      return this.isSurahDownloaded(reciterId, surahNum);
    }

    async getDownloadedSurahIds(reciterId) {
      const db = await this.ensureReady();
      if (!db) return [];

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('audio_surahs', 'readonly');
          const store = tx.objectStore('audio_surahs');
          const req = store.getAll();
          req.onsuccess = () => {
            const list = (req.result || [])
              .filter(item => item.reciterId === reciterId && item.mode === 'ayahs')
              .map(item => Number(item.surahNum));
            resolve(list);
          };
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    // Alias for index.html compatibility
    async getDownloadedSurahsForReciter(reciterId) {
      return this.getDownloadedSurahIds(reciterId);
    }

    async getAllDownloadedAudio() {
      const db = await this.ensureReady();
      if (!db) return [];

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('audio_surahs', 'readonly');
          const store = tx.objectStore('audio_surahs');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async saveSurahAudio(reciterId, surahNum, blob, size) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('audio_surahs', 'readwrite');
          const store = tx.objectStore('audio_surahs');
          const id = this.getAudioKey(reciterId, surahNum);
          store.put({
            id,
            reciterId,
            surahNum: Number(surahNum),
            mode: 'legacy',
            blob,
            size: size || (blob ? blob.size : 0),
            date: Date.now()
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      });
    }

    async saveSurahSplitManifest(reciterId, surahNum, versesCount, totalBytes) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('audio_surahs', 'readwrite');
          const store = tx.objectStore('audio_surahs');
          const id = this.getAudioKey(reciterId, surahNum);
          store.put({
            id,
            reciterId,
            surahNum: Number(surahNum),
            mode: 'ayahs',
            versesCount: Number(versesCount),
            size: Number(totalBytes) || 0,
            date: Date.now()
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      });
    }

    async saveAyahAudio(reciterId, surahNum, verseNum, blob, size) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('ayah_audio')) return false;

      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('ayah_audio', 'readwrite');
          const store = tx.objectStore('ayah_audio');
          const id = this.getAyahAudioKey(reciterId, surahNum, verseNum);
          store.put({
            id,
            reciterId,
            surahNum: Number(surahNum),
            verseNum: Number(verseNum),
            blob,
            size: size || (blob ? blob.size : 0),
            date: Date.now()
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getAyahAudioRecord(reciterId, surahNum, verseNum) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('ayah_audio')) return null;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('ayah_audio', 'readonly');
          const req = tx.objectStore('ayah_audio').get(this.getAyahAudioKey(reciterId, surahNum, verseNum));
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async getAyahAudioBlob(reciterId, surahNum, verseNum) {
      const rec = await this.getAyahAudioRecord(reciterId, surahNum, verseNum);
      return (rec && rec.blob) ? rec.blob : null;
    }

    async getAllDownloadedAyahAudio() {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('ayah_audio')) return [];

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('ayah_audio', 'readonly');
          const req = tx.objectStore('ayah_audio').getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async getSurahAudioBlob(reciterId, surahNum) {
      const db = await this.ensureReady();
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('audio_surahs', 'readonly');
          const store = tx.objectStore('audio_surahs');
          const req = store.get(this.getAudioKey(reciterId, surahNum));
          req.onsuccess = () => {
            if (req.result && req.result.blob) {
              resolve(req.result.blob);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    getWordAudioKey(surahNum, verseNum, wordIndex) {
      return `${Number(surahNum)}_${Number(verseNum)}_${Number(wordIndex)}`;
    }

    async saveWordAudio(surahNum, verseNum, wordIndex, blob, size) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('wbw_audio', 'readwrite');
          const store = tx.objectStore('wbw_audio');
          const id = this.getWordAudioKey(surahNum, verseNum, wordIndex);
          store.put({
            id,
            surahNum: Number(surahNum),
            verseNum: Number(verseNum),
            wordIndex: Number(wordIndex),
            blob,
            size: size || blob.size,
            date: Date.now()
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getWordAudioBlob(surahNum, verseNum, wordIndex) {
      const db = await this.ensureReady();
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('wbw_audio', 'readonly');
          const store = tx.objectStore('wbw_audio');
          const req = store.get(this.getWordAudioKey(surahNum, verseNum, wordIndex));
          req.onsuccess = () => {
            if (req.result && req.result.blob) {
              resolve(req.result.blob);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async isWordAudioDownloaded(surahNum, verseNum, wordIndex) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('wbw_audio', 'readonly');
          const store = tx.objectStore('wbw_audio');
          const req = store.get(this.getWordAudioKey(surahNum, verseNum, wordIndex));
          req.onsuccess = () => resolve(!!req.result);
          req.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getAllDownloadedWordAudio() {
      const db = await this.ensureReady();
      if (!db) return [];

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('wbw_audio', 'readonly');
          const store = tx.objectStore('wbw_audio');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async clearAllWordAudio() {
      const db = await this.ensureReady();
      if (!db) return;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('wbw_audio', 'readwrite');
          tx.objectStore('wbw_audio').clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async deleteSurahAudio(reciterId, surahNum) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const stores = ['audio_surahs'];
          if (db.objectStoreNames.contains('ayah_audio')) stores.push('ayah_audio');
          const tx = db.transaction(stores, 'readwrite');
          tx.objectStore('audio_surahs').delete(this.getAudioKey(reciterId, surahNum));
          if (db.objectStoreNames.contains('ayah_audio')) {
            const ayahStore = tx.objectStore('ayah_audio');
            const prefix = `${reciterId}_${Number(surahNum)}_`;
            const req = ayahStore.getAllKeys();
            req.onsuccess = () => {
              (req.result || []).forEach((k) => {
                if (typeof k === 'string' && k.startsWith(prefix)) ayahStore.delete(k);
              });
            };
          }
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getTotalStorageUsage() {
      const allAudio = await this.getAllDownloadedAudio();
      const legacySurahBytes = allAudio
        .filter(item => item && item.mode !== 'ayahs')
        .reduce((acc, item) => acc + (item.size || 0), 0);
      const allAyahAudio = await this.getAllDownloadedAyahAudio();
      const ayahBytes = allAyahAudio.reduce((acc, item) => acc + (item.size || 0), 0);
      const tafsirEds = await this.getAllTafsirEditions();
      const tafsirBytes = tafsirEds.reduce((acc, item) => acc + (item.byteSize || 0), 0);
      return legacySurahBytes + ayahBytes + tafsirBytes;
    }

    // Alias for index.html returning formatted string
    async calculateStorageUsage() {
      const bytes = await this.getTotalStorageUsage();
      if (!bytes || bytes === 0) return '0.0 MB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async saveTafsirEditionMeta(meta) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('tafsir_editions')) return false;
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('tafsir_editions', 'readwrite');
          tx.objectStore('tafsir_editions').put(meta);
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getTafsirEditionMeta(slug) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('tafsir_editions')) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('tafsir_editions', 'readonly');
          const req = tx.objectStore('tafsir_editions').get(slug);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async getAllTafsirEditions() {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('tafsir_editions')) return [];
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('tafsir_editions', 'readonly');
          const req = tx.objectStore('tafsir_editions').getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async saveTafsirChapter(slug, surahNum, ayahsMap, byteSize) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('tafsir_chapters')) return false;
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('tafsir_chapters', 'readwrite');
          tx.objectStore('tafsir_chapters').put({
            id: `${slug}_${Number(surahNum)}`,
            slug,
            surahNum: Number(surahNum),
            ayahs: ayahsMap,
            byteSize: byteSize || 0,
            date: Date.now()
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getTafsirChapter(slug, surahNum) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('tafsir_chapters')) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('tafsir_chapters', 'readonly');
          const req = tx.objectStore('tafsir_chapters').get(`${slug}_${Number(surahNum)}`);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async deleteTafsirEdition(slug) {
      const db = await this.ensureReady();
      if (!db) return false;
      return new Promise((resolve) => {
        try {
          const stores = [];
          if (db.objectStoreNames.contains('tafsir_editions')) stores.push('tafsir_editions');
          if (db.objectStoreNames.contains('tafsir_chapters')) stores.push('tafsir_chapters');
          if (!stores.length) { resolve(true); return; }
          const tx = db.transaction(stores, 'readwrite');
          if (db.objectStoreNames.contains('tafsir_editions')) {
            tx.objectStore('tafsir_editions').delete(slug);
          }
          if (db.objectStoreNames.contains('tafsir_chapters')) {
            const chStore = tx.objectStore('tafsir_chapters');
            const req = chStore.getAllKeys();
            req.onsuccess = () => {
              const prefix = `${slug}_`;
              (req.result || []).forEach((k) => {
                if (typeof k === 'string' && k.startsWith(prefix)) chStore.delete(k);
              });
            };
          }
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async saveCachedVerse(key, data) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('verse_cache')) return false;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('verse_cache', 'readwrite');
          tx.objectStore('verse_cache').put({ key: String(key), data, date: Date.now() });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async saveCachedVersesBulk(records) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('verse_cache') || !Array.isArray(records) || !records.length) return false;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('verse_cache', 'readwrite');
          const store = tx.objectStore('verse_cache');
          const now = Date.now();
          records.forEach((r) => {
            if (r && r.key && r.data) {
              store.put({ key: String(r.key), data: r.data, date: now });
            }
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getCachedVerse(key) {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('verse_cache')) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('verse_cache', 'readonly');
          const req = tx.objectStore('verse_cache').get(String(key));
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async getAllCachedVerses() {
      const db = await this.ensureReady();
      if (!db || !db.objectStoreNames.contains('verse_cache')) return [];
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('verse_cache', 'readonly');
          const req = tx.objectStore('verse_cache').getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async clearAllData() {
      const db = await this.ensureReady();
      if (!db) return;

      return new Promise((resolve) => {
        try {
          const stores = ['audio_surahs', 'translations', 'tafsir'];
          if (db.objectStoreNames.contains('ayah_audio')) stores.push('ayah_audio');
          if (db.objectStoreNames.contains('wbw_audio')) stores.push('wbw_audio');
          if (db.objectStoreNames.contains('tafsir_editions')) stores.push('tafsir_editions');
          if (db.objectStoreNames.contains('tafsir_chapters')) stores.push('tafsir_chapters');
          if (db.objectStoreNames.contains('verse_cache')) stores.push('verse_cache');
          const tx = db.transaction(stores, 'readwrite');
          stores.forEach(s => tx.objectStore(s).clear());
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async clearReciterAudio(reciterId) {
      const db = await this.ensureReady();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const stores = ['audio_surahs'];
          if (db.objectStoreNames.contains('ayah_audio')) stores.push('ayah_audio');
          const tx = db.transaction(stores, 'readwrite');
          const surahStore = tx.objectStore('audio_surahs');
          const req = surahStore.getAllKeys();
          const prefix = `${reciterId}_`;
          req.onsuccess = () => {
            (req.result || []).forEach((k) => {
              if (typeof k === 'string' && k.startsWith(prefix)) surahStore.delete(k);
            });
          };
          if (db.objectStoreNames.contains('ayah_audio')) {
            const ayahStore = tx.objectStore('ayah_audio');
            const req2 = ayahStore.getAllKeys();
            req2.onsuccess = () => {
              (req2.result || []).forEach((k) => {
                if (typeof k === 'string' && k.startsWith(prefix)) ayahStore.delete(k);
              });
            };
          }
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async clearAllAudio() {
      const db = await this.ensureReady();
      if (!db) return;

      return new Promise((resolve) => {
        try {
          const stores = ['audio_surahs'];
          if (db.objectStoreNames.contains('ayah_audio')) stores.push('ayah_audio');
          const tx = db.transaction(stores, 'readwrite');
          stores.forEach(s => tx.objectStore(s).clear());
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }
  }

  const offlineStorage = new OfflineStorageEngine();

  // ========== DOWNLOAD MANAGER ==========
  const DownloadManager = {
    RECITERS: RECITERS,
    activeDownloads: new Map(),

    getReciters: () => RECITERS,
    getReciter: (id) => RECITERS.find(r => r.id === id) || RECITERS[0],
    getTranslations: () => TRANSLATIONS,
    getTafsirList: () => TAFSIR_CATALOG,
    getEstimatedSurahAudioSize: getEstimatedSurahAudioSize,

    isSurahDownloaded: (reciterId, surahNum) => offlineStorage.isSurahDownloaded(reciterId, surahNum),
    isSurahAudioDownloaded: (reciterId, surahNum) => offlineStorage.isSurahDownloaded(reciterId, surahNum),
    getDownloadedSurahs: (reciterId) => offlineStorage.getDownloadedSurahIds(reciterId),
    deleteSurah: (reciterId, surahNum) => offlineStorage.deleteSurahAudio(reciterId, surahNum),
    deleteSurahAudio: (reciterId, surahNum) => offlineStorage.deleteSurahAudio(reciterId, surahNum),
    getTotalStorageUsage: () => offlineStorage.getTotalStorageUsage(),
    calculateStorageUsage: () => offlineStorage.calculateStorageUsage(),
    clearAllData: () => offlineStorage.clearAllData(),
    clearAllAudio: () => offlineStorage.clearAllAudio(),

    // Core per-Ayah split download method returning Promise
    async downloadSurah(reciterId, surahNum, onProgress) {
      const s = Number(surahNum) || 1;
      const reciter = this.getReciter(reciterId);
      const downloadKey = `${reciterId}_${s}`;
      const meta = (window.OfflineQuranDB && typeof window.OfflineQuranDB.getSurahMeta === 'function')
        ? window.OfflineQuranDB.getSurahMeta(s)
        : null;
      const versesCount = (meta && Number(meta.verses)) ? Number(meta.verses) : 7;

      if (this.activeDownloads.has(downloadKey)) {
        return;
      }

      this.activeDownloads.set(downloadKey, true);

      try {
        let completed = 0;
        let totalBytes = 0;
        const queue = Array.from({ length: versesCount }, (_, i) => i + 1);
        const concurrency = Math.min(5, Math.max(1, versesCount));
        let firstError = null;

        const downloadSingleAyah = async (v) => {
          const existing = await offlineStorage.getAyahAudioRecord(reciterId, s, v);
          if (existing && existing.blob) {
            totalBytes += existing.size || existing.blob.size || 0;
            completed++;
            if (onProgress) {
              onProgress(completed, versesCount, Math.min(99, Math.round((completed / versesCount) * 100)));
            }
            return;
          }

          const primaryUrl = reciter.ayahUrl(s, v);
          const backupUrl = typeof reciter.ayahBackupUrl === 'function' ? reciter.ayahBackupUrl(s, v) : primaryUrl;
          let response = null;
          try {
            response = await fetch(primaryUrl);
            if (!response.ok) throw new Error('Primary Ayah CDN HTTP ' + response.status);
          } catch (e) {
            response = await fetch(backupUrl);
            if (!response.ok) throw new Error('Backup Ayah CDN HTTP ' + response.status);
          }

          const blob = await response.blob();
          if (!blob || blob.size === 0) throw new Error(`Empty audio blob for ${s}:${v}`);
          await offlineStorage.saveAyahAudio(reciterId, s, v, blob, blob.size);
          totalBytes += blob.size;
          completed++;
          if (onProgress) {
            onProgress(completed, versesCount, Math.min(99, Math.round((completed / versesCount) * 100)));
          }
        };

        const workers = Array.from({ length: concurrency }, async () => {
          while (queue.length > 0 && !firstError) {
            if (this.isBatchRunning && this.batchCancelled) return;
            const verseNum = queue.shift();
            if (!verseNum) break;
            try {
              await downloadSingleAyah(verseNum);
            } catch (err) {
              firstError = err;
              return;
            }
          }
        });

        await Promise.all(workers);

        if (this.isBatchRunning && this.batchCancelled) {
          return;
        }
        if (firstError) {
          throw firstError;
        }

        await offlineStorage.saveSurahSplitManifest(reciterId, s, versesCount, totalBytes);
        if (onProgress) onProgress(versesCount, versesCount, 100);
      } catch (err) {
        console.error('Download surah failed:', err);
        throw err;
      } finally {
        this.activeDownloads.delete(downloadKey);
      }
    },

    // Callback-style method called by index.html: downloadSurahAudio(reciterId, surahNum, onProgress, onSuccess, onError)
    downloadSurahAudio(reciterId, surahNum, onProgress, onSuccess, onError) {
      this.downloadSurah(reciterId, surahNum, (loaded, total, percent) => {
        if (onProgress) onProgress(loaded, total, percent);
      }).then(() => {
        if (onSuccess) onSuccess();
      }).catch((err) => {
        if (onError) onError(err);
      });
    },

    // Batch download control state
    batchCancelled: false,
    isBatchRunning: false,

    cancelBatchDownload() {
      this.batchCancelled = true;
      this.isBatchRunning = false;
    },

    cancelBatch() {
      this.cancelBatchDownload();
    },

    // Batch download method called by index.html: batchDownloadSurahs(reciterId, surahList, onProgress, onComplete, onError, onCancelled)
    async batchDownloadSurahs(reciterId, surahList, onProgress, onComplete, onError, onCancelled) {
      this.batchCancelled = false;
      this.isBatchRunning = true;
      try {
        let completedCount = 0;
        const total = surahList.length;

        for (const surahNum of surahList) {
          if (this.batchCancelled) {
            this.isBatchRunning = false;
            if (onCancelled) onCancelled(completedCount, total);
            return;
          }

          const isDownloaded = await offlineStorage.isSurahDownloaded(reciterId, surahNum);
          if (isDownloaded) {
            completedCount++;
            if (onProgress) onProgress(completedCount, total, surahNum, 100);
            continue;
          }

          if (onProgress) onProgress(completedCount, total, surahNum, 0);
          try {
            await this.downloadSurah(reciterId, surahNum, (loaded, totalBytes, pct) => {
              if (onProgress) onProgress(completedCount, total, surahNum, pct);
            });
          } catch (e) {
            console.warn(`Failed surah ${surahNum}, skipping:`, e);
          }

          if (this.batchCancelled) {
            this.isBatchRunning = false;
            if (onCancelled) onCancelled(completedCount, total);
            return;
          }

          completedCount++;
          if (onProgress) onProgress(completedCount, total, surahNum, 100);
        }

        this.isBatchRunning = false;
        if (onComplete) onComplete();
      } catch (err) {
        this.isBatchRunning = false;
        if (onError) onError(err);
      }
    }
  };

  // ========== UNIFIED AUDIO PLAYBACK ENGINE ==========
  class UnifiedAudioEngine {
    constructor() {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.currentReciterId = localStorage.getItem('quran_reciter') || 'ar.alafasy';
      this.playbackRate = parseFloat(localStorage.getItem('quran_playback_rate') || '1.0') || 1.0;
      this.currentSurah = 1;
      this.currentVerse = 1;
      this.isPlaying = false;
      this.isOffline = false;
      this.activeBlobUrl = null;
      this.onTimeUpdate = null;
      this.onEnded = null;
      this._playToken = 0;

      this.setupEventListeners();
    }

    setupEventListeners() {
      this.audio.addEventListener('timeupdate', () => {
        if (this.onTimeUpdate && this.audio.duration) {
          this.onTimeUpdate(this.audio.currentTime, this.audio.duration);
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.onTimeUpdate && this.audio.duration) {
          this.onTimeUpdate(this.audio.currentTime || 0, this.audio.duration);
        }
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        if (this.onEnded) {
          this.onEnded();
        }
      });

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
      });
    }

    hasActiveSource(surahNum, verseNum, reciterId) {
      return !!(
        this.audio &&
        this.audio.src &&
        !this.audio.ended &&
        Number(this.currentSurah) === Number(surahNum) &&
        Number(this.currentVerse) === Number(verseNum) &&
        String(this.currentReciterId) === String(reciterId || this.currentReciterId)
      );
    }

    getReciter() {
      return DownloadManager.getReciter(this.currentReciterId);
    }

    setReciter(reciterId) {
      this.currentReciterId = reciterId;
      localStorage.setItem('quran_reciter', reciterId);
    }

    // Supports both (surah, verse, reciterId, onTimeUpdate, onEnded, onError) and (surah, verse, onTimeUpdate, onEnded)
    async playVerse(surahNum, verseNum, arg3, arg4, arg5, arg6) {
      let reciterId = this.currentReciterId;
      let onTimeUpdate = null;
      let onEnded = null;
      let onError = null;

      if (typeof arg3 === 'string') {
        reciterId = arg3;
        onTimeUpdate = typeof arg4 === 'function' ? arg4 : null;
        onEnded = typeof arg5 === 'function' ? arg5 : null;
        onError = typeof arg6 === 'function' ? arg6 : null;
      } else if (typeof arg3 === 'function') {
        onTimeUpdate = arg3;
        onEnded = typeof arg4 === 'function' ? arg4 : null;
        onError = typeof arg5 === 'function' ? arg5 : null;
      }

      const playToken = ++this._playToken;
      this.currentReciterId = reciterId;
      this.currentSurah = Number(surahNum);
      this.currentVerse = Number(verseNum);
      this.onTimeUpdate = onTimeUpdate;
      this.onEnded = onEnded;

      const reciter = DownloadManager.getReciter(reciterId);

      // 1. Check per-Ayah offline blob in IndexedDB (never hijack with concatenated full-surah MP3)
      try {
        const ayahBlob = await offlineStorage.getAyahAudioBlob(reciterId, this.currentSurah, this.currentVerse);
        if (playToken !== this._playToken) return;
        if (ayahBlob) {
          if (this.activeBlobUrl) URL.revokeObjectURL(this.activeBlobUrl);
          this.activeBlobUrl = URL.createObjectURL(ayahBlob);
          this.audio.src = this.activeBlobUrl;
          this.audio.playbackRate = this.playbackRate;
          this.isOffline = true;
          try {
            await this.audio.play();
            if (playToken !== this._playToken) return;
            this.audio.playbackRate = this.playbackRate;
            this.isPlaying = true;
            return;
          } catch (e) {
            console.warn('Offline ayah blob playback failed, trying ayah stream:', e);
          }
        }
      } catch (e) {
        console.warn('Ayah offline lookup error:', e);
      }

      if (playToken !== this._playToken) return;

      // 2. Online stream: single-Ayah audio from EveryAyah (never unsplit 82-min full-surah stream)
      this.isOffline = false;
      const ayahUrl = reciter.ayahUrl(this.currentSurah, this.currentVerse);
      this.audio.src = ayahUrl;
      this.audio.playbackRate = this.playbackRate;

      try {
        await this.audio.play();
        if (playToken !== this._playToken) return;
        this.audio.playbackRate = this.playbackRate;
        this.isPlaying = true;
      } catch (err) {
        if (playToken !== this._playToken) return;
        const backupUrl = typeof reciter.ayahBackupUrl === 'function'
          ? reciter.ayahBackupUrl(this.currentSurah, this.currentVerse)
          : null;
        if (backupUrl && backupUrl !== ayahUrl) {
          try {
            this.audio.src = backupUrl;
            this.audio.playbackRate = this.playbackRate;
            await this.audio.play();
            if (playToken !== this._playToken) return;
            this.audio.playbackRate = this.playbackRate;
            this.isPlaying = true;
            return;
          } catch (e2) {
            console.error('All single-Ayah audio sources failed:', e2);
            if (onError) onError(e2);
            return;
          }
        }
        console.error('Single-Ayah audio stream failed:', err);
        if (onError) onError(err);
      }
    }

    async playSurah(surahNum, reciterId, onTimeUpdate, onEnded, onError) {
      if (reciterId) this.currentReciterId = reciterId;
      this.currentSurah = Number(surahNum);
      this.onTimeUpdate = onTimeUpdate;
      this.onEnded = onEnded;

      const reciter = DownloadManager.getReciter(this.currentReciterId);
      const isDownloaded = await offlineStorage.isSurahDownloaded(this.currentReciterId, this.currentSurah);

      if (isDownloaded) {
        const blob = await offlineStorage.getSurahAudioBlob(this.currentReciterId, this.currentSurah);
        if (blob) {
          if (this.activeBlobUrl) URL.revokeObjectURL(this.activeBlobUrl);
          this.activeBlobUrl = URL.createObjectURL(blob);
          this.audio.src = this.activeBlobUrl;
          this.audio.playbackRate = this.playbackRate;
          this.isOffline = true;
          try {
            await this.audio.play();
            this.audio.playbackRate = this.playbackRate;
            this.isPlaying = true;
            return;
          } catch (e) {
            console.warn('Blob audio play failed:', e);
          }
        }
      }

      this.isOffline = false;
      this.audio.src = reciter.surahUrl(this.currentSurah);
      this.audio.playbackRate = this.playbackRate;
      try {
        await this.audio.play();
        this.audio.playbackRate = this.playbackRate;
        this.isPlaying = true;
      } catch (err) {
        try {
          this.audio.src = reciter.surahBackupUrl(this.currentSurah);
          this.audio.playbackRate = this.playbackRate;
          await this.audio.play();
          this.audio.playbackRate = this.playbackRate;
          this.isPlaying = true;
        } catch (e2) {
          if (onError) onError(e2);
        }
      }
    }

    pause() {
      this.audio.pause();
      this.isPlaying = false;
    }

    resume() {
      if (this.audio.src) {
        this.audio.playbackRate = this.playbackRate;
        this.audio.play().then(() => {
          this.isPlaying = true;
        }).catch(err => console.warn('Resume error:', err));
      }
    }

    stop() {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }

    seek(fraction) {
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.audio.currentTime = this.audio.duration * Math.max(0, Math.min(1, fraction));
      }
    }

    setPlaybackRate(rate) {
      this.playbackRate = Number(rate) || 1.0;
      localStorage.setItem('quran_playback_rate', String(this.playbackRate));
      this.audio.playbackRate = this.playbackRate;
    }
  }

  // ========== WORD-BY-WORD AUDIO ENGINE ==========
  class WordAudioEngine {
    constructor(storageEngine) {
      this.storage = storageEngine;
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.isPlaying = false;
      this.currentSurah = 1;
      this.currentVerse = 1;
      this.currentWordIdx = 0;
      this.playbackRate = 1.0;
      this.isSequencePlaying = false;
      this.sequenceTimeout = null;
      this.activeBlobUrl = null;
      this.activeElement = null;
      this.sequenceWordsCount = 0;
      this.sequenceCurrentIndex = 0;
      this.onStateChange = null;

      this.audio.addEventListener('ended', () => {
        this.clearActiveHighlight();
        this.isPlaying = false;
        if (this.singleWordCallback) {
          const cb = this.singleWordCallback;
          this.singleWordCallback = null;
          cb();
        }
        if (this.isSequencePlaying) {
          this.sequenceTimeout = setTimeout(() => {
            this.advanceSequence();
          }, 140);
        } else if (this.onStateChange) {
          this.onStateChange({ status: 'idle' });
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Word audio playback error:', e);
        this.clearActiveHighlight();
        this.isPlaying = false;
        if (this.singleWordCallback) {
          const cb = this.singleWordCallback;
          this.singleWordCallback = null;
          cb(e);
        }
        if (this.isSequencePlaying) {
          this.sequenceTimeout = setTimeout(() => {
            this.advanceSequence();
          }, 220);
        } else if (this.onStateChange) {
          this.onStateChange({ status: 'error', error: e });
        }
      });
    }

    clearActiveHighlight() {
      if (this.activeElement && this.activeElement.classList) {
        this.activeElement.classList.remove('word-playing');
        this.activeElement = null;
      }
      document.querySelectorAll('.word-item.word-playing').forEach(el => el.classList.remove('word-playing'));
    }

    setPlaybackRate(rate) {
      this.playbackRate = Number(rate) || 1.0;
      this.audio.playbackRate = this.playbackRate;
    }

    setRate(rate) {
      this.setPlaybackRate(rate);
    }

    stopSequence() {
      this.stop();
    }

    getWordFilename(surah, verse, wordIndex) {
      const sPad = String(surah).padStart(3, '0');
      const vPad = String(verse).padStart(3, '0');
      const wPad = String(wordIndex).padStart(3, '0');
      return `${sPad}_${vPad}_${wPad}.mp3`;
    }

    async getWordAudioSource(surah, verse, wordIndex) {
      const filename = this.getWordFilename(surah, verse, wordIndex);

      // 1. Check offline IndexedDB blob
      try {
        const blob = await this.storage.getWordAudioBlob(surah, verse, wordIndex);
        if (blob) {
          if (this.activeBlobUrl) URL.revokeObjectURL(this.activeBlobUrl);
          this.activeBlobUrl = URL.createObjectURL(blob);
          return { src: this.activeBlobUrl, isOffline: true };
        }
      } catch (e) {
        console.warn('IndexedDB word audio check error:', e);
      }

      // 2. Check pre-bundled asset in app bundle
      const bundledAssetPath = `audio/wbw/${filename}`;
      try {
        const resp = await fetch(bundledAssetPath, { method: 'HEAD' });
        if (resp.ok) {
          return { src: bundledAssetPath, isOffline: true };
        }
      } catch (_) {}

      // 3. Online stream from Quran.com CDN
      const cdnUrl = `https://audio.qurancdn.com/wbw/${filename}`;
      this.cacheWordToStorage(surah, verse, wordIndex, cdnUrl);
      return { src: cdnUrl, isOffline: false };
    }

    async cacheWordToStorage(surah, verse, wordIndex, url) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          await this.storage.saveWordAudio(surah, verse, wordIndex, blob, blob.size);
        }
      } catch (_) {}
    }

    async playWord(surah, verse, wordIndex, elementOrCallback, maybeCallback) {
      this.clearActiveHighlight();
      if (this.sequenceTimeout) clearTimeout(this.sequenceTimeout);
      this.isSequencePlaying = false;

      let element = null;
      let onDone = null;
      if (typeof elementOrCallback === 'function') {
        onDone = elementOrCallback;
      } else if (elementOrCallback && elementOrCallback.classList) {
        element = elementOrCallback;
        if (typeof maybeCallback === 'function') onDone = maybeCallback;
      }

      this.singleWordCallback = onDone;
      this.currentSurah = Number(surah);
      this.currentVerse = Number(verse);
      this.currentWordIdx = Number(wordIndex);

      if (!element) {
        element = document.getElementById(`wbw-word-${this.currentSurah}-${this.currentVerse}-${this.currentWordIdx}`);
      }

      if (element && element.classList) {
        this.activeElement = element;
        element.classList.add('word-playing');
      }

      const source = await this.getWordAudioSource(surah, verse, wordIndex);
      this.audio.src = source.src;
      this.audio.playbackRate = this.playbackRate;

      try {
        await this.audio.play();
        this.audio.playbackRate = this.playbackRate;
        this.isPlaying = true;
        if (this.onStateChange) {
          this.onStateChange({ status: 'playing', surah, verse, wordIndex, isOffline: source.isOffline });
        }
      } catch (err) {
        console.warn('Single word play error:', err);
        this.clearActiveHighlight();
        this.isPlaying = false;
        if (this.singleWordCallback) {
          const cb = this.singleWordCallback;
          this.singleWordCallback = null;
          cb(err);
        }
        if (this.onStateChange) {
          this.onStateChange({ status: 'error', error: err });
        }
      }
    }

    async playAyahWords(surah, verse, wordsCount, onWordStep, onFinished) {
      this.stop();
      this.currentSurah = Number(surah);
      this.currentVerse = Number(verse);
      this.sequenceWordsCount = Number(wordsCount) || 1;
      this.sequenceCurrentIndex = 0;
      this.isSequencePlaying = true;
      this.onWordStep = onWordStep;
      this.onFinished = onFinished;
      this.advanceSequence();
    }

    async advanceSequence() {
      if (!this.isSequencePlaying) return;

      if (this.sequenceCurrentIndex >= this.sequenceWordsCount) {
        this.stop();
        if (this.onFinished) this.onFinished();
        return;
      }

      this.sequenceCurrentIndex++;
      const wIdx = this.sequenceCurrentIndex;
      const el =
        document.getElementById(`wbw-word-${this.currentSurah}-${this.currentVerse}-${wIdx}`) ||
        document.getElementById(`wbw-card-${wIdx}`) ||
        document.querySelector(`[data-word-idx="${wIdx}"]`);

      if (this.onWordStep) {
        this.onWordStep(wIdx, this.sequenceWordsCount, el);
      }

      this.currentWordIdx = wIdx;
      this.clearActiveHighlight();
      if (el && el.classList) {
        this.activeElement = el;
        el.classList.add('word-playing');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }

      const source = await this.getWordAudioSource(this.currentSurah, this.currentVerse, wIdx);
      this.audio.src = source.src;
      this.audio.playbackRate = this.playbackRate;

      try {
        await this.audio.play();
        this.audio.playbackRate = this.playbackRate;
        this.isPlaying = true;
      } catch (err) {
        console.warn('Sequence word play error:', err);
        this.sequenceTimeout = setTimeout(() => {
          this.clearActiveHighlight();
          this.advanceSequence();
        }, 420);
      }
    }

    pause() {
      this.isSequencePlaying = false;
      if (this.sequenceTimeout) clearTimeout(this.sequenceTimeout);
      this.audio.pause();
      this.isPlaying = false;
      this.clearActiveHighlight();
      if (this.onStateChange) this.onStateChange({ status: 'paused' });
    }

    resume() {
      if (this.audio.src) {
        this.audio.playbackRate = this.playbackRate;
        this.audio.play().then(() => {
          this.isPlaying = true;
          if (this.onStateChange) this.onStateChange({ status: 'playing' });
        }).catch(err => console.warn('Word audio resume error:', err));
      }
    }

    stop() {
      this.isSequencePlaying = false;
      this.singleWordCallback = null;
      if (this.sequenceTimeout) clearTimeout(this.sequenceTimeout);
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (_) {}
      this.isPlaying = false;
      this.clearActiveHighlight();
      if (this.onStateChange) this.onStateChange({ status: 'stopped' });
    }

    async downloadSurahWords(surah, arg2, arg3) {
      let verseWordCounts = null;
      let onProgress = null;
      if (typeof arg2 === 'function') {
        onProgress = arg2;
      } else if (Array.isArray(arg2)) {
        verseWordCounts = arg2;
        onProgress = typeof arg3 === 'function' ? arg3 : null;
      }

      const meta = window.OfflineQuranDB ? window.OfflineQuranDB.getSurahMeta(surah) : null;
      if (!meta) return false;

      let totalWords = 0;
      const verses = [];
      for (let v = 1; v <= meta.verses; v++) {
        let count = 0;
        if (verseWordCounts && verseWordCounts[v - 1] != null) {
          count = Number(verseWordCounts[v - 1]) || 0;
        } else {
          const verseData = window.OfflineQuranDB.getVerseByKey(`${surah}:${v}`);
          count = (verseData && verseData.words) ? verseData.words.length : 0;
        }
        verses.push({ verse: v, count });
        totalWords += count;
      }

      if (totalWords === 0) return false;

      let downloaded = 0;
      for (const item of verses) {
        for (let w = 1; w <= item.count; w++) {
          const isDown = await this.storage.isWordAudioDownloaded(surah, item.verse, w);
          if (!isDown) {
            const filename = this.getWordFilename(surah, item.verse, w);
            const url = `https://audio.qurancdn.com/wbw/${filename}`;
            try {
              const res = await fetch(url);
              if (res.ok) {
                const blob = await res.blob();
                await this.storage.saveWordAudio(surah, item.verse, w, blob, blob.size);
              }
            } catch (err) {
              console.warn(`Word download failed ${surah}:${item.verse}:${w}`, err);
            }
          }
          downloaded++;
          const pct = Math.min(100, Math.round((downloaded / totalWords) * 100));
          if (onProgress) onProgress(downloaded, totalWords, pct);
        }
      }
      return true;
    }
  }

  // ========== TAFSIR DOWNLOAD & OFFLINE READER ENGINE ==========
  function stripHtmlToText(raw) {
    if (!raw) return '';
    return String(raw)
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  class TafsirManagerEngine {
    constructor(storage) {
      this.storage = storage;
      this.catalog = [...TAFSIR_CATALOG];
      this.activeDownloads = new Map(); // slug -> { paused, progress, total, state, error }
    }

    getEdition(slug) {
      return this.catalog.find((e) => e.slug === slug) || null;
    }

    getCatalogSorted() {
      const normalized = this.catalog.map((e) => ({
        ...e,
        language: normalizeTafsirLanguage(e.language, e.slug)
      }));
      normalized.sort((a, b) => {
        const langCmp = a.language.localeCompare(b.language, 'en', { sensitivity: 'base' });
        if (langCmp !== 0) return langCmp;
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      });
      return normalized;
    }

    getGroupedCatalog() {
      const sorted = this.getCatalogSorted();
      const map = new Map();
      sorted.forEach((ed) => {
        if (!map.has(ed.language)) map.set(ed.language, []);
        map.get(ed.language).push(ed);
      });
      const groups = [];
      Array.from(map.keys())
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
        .forEach((language) => {
          groups.push({
            language,
            letter: language.charAt(0).toUpperCase(),
            editions: map.get(language)
          });
        });
      return groups;
    }

    async refreshCatalogFromApi() {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 7000) : null;
      try {
        const res = await fetch(
          'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@latest/tafsir/editions.json',
          controller ? { signal: controller.signal } : undefined
        );
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const list = await res.json();
        if (!Array.isArray(list)) return this.getGroupedCatalog();

        const existingBySlug = new Map(this.catalog.map((e) => [e.slug, e]));
        list.forEach((item) => {
          if (!item || !item.slug) return;
          const lang = normalizeTafsirLanguage(item.language_name, item.slug);
          const dir = ['Arabic', 'Kurdish', 'Urdu'].includes(lang) ? 'rtl' : 'ltr';
          if (existingBySlug.has(item.slug)) {
            const cur = existingBySlug.get(item.slug);
            cur.name = cur.name || item.name;
            cur.author = cur.author || item.author_name || 'Scholarly Edition';
            cur.language = lang;
          } else {
            this.catalog.push({
              slug: item.slug,
              name: item.name || item.slug,
              author: item.author_name || 'Scholarly Commentary',
              language: lang,
              dir,
              quranComId: item.id || null,
              sizeEstimate: '6-18 MB',
              desc: `${item.name || item.slug} (${lang}) available via spa5k/tafsir_api for offline IndexedDB caching.`
            });
          }
        });
      } finally {
        if (timer) clearTimeout(timer);
      }
      return this.getGroupedCatalog();
    }

    async fetchSurahTafsir(edition, surahNum) {
      const slugCandidates = [edition.slug, ...(edition.altSlugs || [])];
      for (const candidateSlug of slugCandidates) {
        try {
          const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@latest/tafsir/${encodeURIComponent(candidateSlug)}/${surahNum}.json`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const ayahsArr = Array.isArray(data && data.ayahs) ? data.ayahs : (Array.isArray(data) ? data : null);
            if (ayahsArr && ayahsArr.length) {
              const map = {};
              let rawChars = 0;
              ayahsArr.forEach((entry) => {
                const vNum = Number(entry.ayah || entry.verse_number || entry.verse);
                if (!vNum) return;
                const clean = stripHtmlToText(entry.text || '');
                map[String(vNum)] = clean;
                rawChars += clean.length;
              });
              return { ayahs: map, byteSize: rawChars * 2 };
            }
          }
        } catch (_) {}
      }

      if (edition.quranComId) {
        const fallbackUrl = `https://api.quran.com/api/v4/quran/tafsirs/${edition.quranComId}?chapter_number=${surahNum}`;
        const res = await fetch(fallbackUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const tafsirs = Array.isArray(json && json.tafsirs) ? json.tafsirs : [];
        if (!tafsirs.length) throw new Error('Empty tafsir payload');
        const map = {};
        let rawChars = 0;
        tafsirs.forEach((entry, idx) => {
          const vk = String(entry.verse_key || '');
          const vNum = vk.includes(':') ? Number(vk.split(':')[1]) : (idx + 1);
          const clean = stripHtmlToText(entry.text || '');
          map[String(vNum)] = clean;
          rawChars += clean.length;
        });
        return { ayahs: map, byteSize: rawChars * 2 };
      }

      throw new Error(`Unable to fetch Surah ${surahNum} for ${edition.name}`);
    }

    async fetchSingleSurahOnDemand(slug, surahNum) {
      const existing = await this.storage.getTafsirChapter(slug, surahNum);
      if (existing && existing.ayahs) return existing.ayahs;
      const edition = this.getEdition(slug);
      if (!edition) return null;
      const fetched = await this.fetchSurahTafsir(edition, surahNum);
      await this.storage.saveTafsirChapter(slug, surahNum, fetched.ayahs, fetched.byteSize);
      return fetched.ayahs;
    }

    async downloadEdition(slug, onProgress) {
      const edition = this.getEdition(slug);
      if (!edition) throw new Error('Unknown tafsir edition: ' + slug);

      const existingState = this.activeDownloads.get(slug);
      if (existingState && existingState.state === 'downloading') return;

      const prevMeta = (await this.storage.getTafsirEditionMeta(slug)) || {
        slug: edition.slug,
        name: edition.name,
        author: edition.author,
        language: edition.language,
        dir: edition.dir || 'ltr',
        downloadedSurahsCount: 0,
        byteSize: 0,
        state: 'downloading'
      };

      const job = { paused: false, state: 'downloading', done: prevMeta.downloadedSurahsCount || 0, total: 114, error: null };
      this.activeDownloads.set(slug, job);

      let totalBytes = 0;
      let doneCount = 0;
      let hadError = false;

      try {
        for (let s = 1; s <= 114; s++) {
          if (job.paused) {
            job.state = 'paused';
            await this.storage.saveTafsirEditionMeta({
              ...prevMeta,
              downloadedSurahsCount: doneCount,
              byteSize: totalBytes,
              state: 'paused',
              lastUpdated: Date.now()
            });
            if (onProgress) onProgress({ slug, done: doneCount, total: 114, surahNum: s, pct: Math.round((doneCount / 114) * 100), state: 'paused' });
            return { paused: true, done: doneCount };
          }

          const cached = await this.storage.getTafsirChapter(slug, s);
          if (cached) {
            totalBytes += cached.byteSize || 0;
            doneCount++;
            job.done = doneCount;
            if (onProgress) onProgress({ slug, done: doneCount, total: 114, surahNum: s, pct: Math.round((doneCount / 114) * 100), state: 'downloading' });
            continue;
          }

          const chapter = await this.fetchSurahTafsir(edition, s);
          await this.storage.saveTafsirChapter(slug, s, chapter.ayahs, chapter.byteSize);
          totalBytes += chapter.byteSize || 0;
          doneCount++;
          job.done = doneCount;

          if (doneCount % 5 === 0 || doneCount === 1 || doneCount === 114) {
            await this.storage.saveTafsirEditionMeta({
              slug: edition.slug,
              name: edition.name,
              author: edition.author,
              language: edition.language,
              dir: edition.dir || 'ltr',
              downloadedSurahsCount: doneCount,
              byteSize: totalBytes,
              state: doneCount === 114 ? 'installed' : 'downloading',
              lastUpdated: Date.now()
            });
          }

          if (onProgress) {
            onProgress({
              slug,
              done: doneCount,
              total: 114,
              surahNum: s,
              pct: Math.round((doneCount / 114) * 100),
              state: doneCount === 114 ? 'installed' : 'downloading'
            });
          }
        }

        job.state = 'installed';
        await this.storage.saveTafsirEditionMeta({
          slug: edition.slug,
          name: edition.name,
          author: edition.author,
          language: edition.language,
          dir: edition.dir || 'ltr',
          downloadedSurahsCount: 114,
          byteSize: totalBytes,
          state: 'installed',
          lastUpdated: Date.now()
        });
        return { paused: false, done: 114, byteSize: totalBytes };
      } catch (err) {
        hadError = true;
        job.state = 'error';
        job.error = err && err.message ? err.message : 'Download failed';
        await this.storage.saveTafsirEditionMeta({
          ...prevMeta,
          downloadedSurahsCount: doneCount,
          byteSize: totalBytes,
          state: 'error',
          error: job.error,
          lastUpdated: Date.now()
        });
        if (onProgress) {
          onProgress({ slug, done: doneCount, total: 114, pct: Math.round((doneCount / 114) * 100), state: 'error', error: job.error });
        }
        throw err;
      } finally {
        if (!hadError && job.state === 'installed') {
          this.activeDownloads.delete(slug);
        }
      }
    }

    pauseDownload(slug) {
      const job = this.activeDownloads.get(slug);
      if (job) {
        job.paused = true;
      }
    }

    async deleteEdition(slug) {
      this.pauseDownload(slug);
      this.activeDownloads.delete(slug);
      return this.storage.deleteTafsirEdition(slug);
    }

    async getInstalledEditions() {
      const all = await this.storage.getAllTafsirEditions();
      return all.filter((m) => m && m.downloadedSurahsCount > 0);
    }

    async getAllEditionStatuses() {
      const stored = await this.storage.getAllTafsirEditions();
      const map = {};
      stored.forEach((m) => {
        if (m && m.slug) map[m.slug] = m;
      });
      this.activeDownloads.forEach((job, slug) => {
        map[slug] = {
          ...(map[slug] || {}),
          slug,
          downloadedSurahsCount: job.done,
          state: job.state,
          error: job.error
        };
      });
      return map;
    }

    async getVerseTafsir(slug, surahNum, verseNum) {
      const cached = await this.storage.getTafsirChapter(slug, surahNum);
      if (cached && cached.ayahs) {
        return cached.ayahs[String(verseNum)] || null;
      }
      return null;
    }
  }

  // ========== AUTHENTIC VERSE & WORD-BY-WORD HYDRATION ==========
  function stripFootnoteHtml(raw) {
    return String(raw || '')
      .replace(/<sup\b[^>]*>.*?<\/sup>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeApiVerse(apiVerse, surahNum) {
    if (!apiVerse) return null;
    const vNum = Number(apiVerse.verse_number || (String(apiVerse.verse_key || '').split(':')[1])) || 1;
    const rawWords = Array.isArray(apiVerse.words) ? apiVerse.words : [];
    const tokens = rawWords.filter(w => w && w.char_type_name === 'word');

    const words = tokens.map((w, idx) => ({
      text_uthmani: w.text_uthmani || w.text || '',
      text_indopak: w.text_indopak || w.text_uthmani || w.text || '',
      text_imlaei: w.text_imlaei || w.text_uthmani || w.text || '',
      transliteration: (w.transliteration && w.transliteration.text) ? String(w.transliteration.text) : '',
      translation: (w.translation && w.translation.text) ? String(w.translation.text) : '',
      audio_url: w.audio_url || `wbw/${String(surahNum).padStart(3, '0')}_${String(vNum).padStart(3, '0')}_${String(idx + 1).padStart(3, '0')}.mp3`
    }));

    const joinedUthmani = words.map(w => w.text_uthmani).filter(Boolean).join(' ').trim();
    const joinedIndopak = words.map(w => w.text_indopak).filter(Boolean).join(' ').trim();
    const joinedImlaei = words.map(w => w.text_imlaei).filter(Boolean).join(' ').trim();
    const fieldUthmani = String(apiVerse.text_uthmani || '').trim() || joinedUthmani;
    const fieldIndopak = String(apiVerse.text_indopak || '').trim() || joinedIndopak || fieldUthmani;
    const fieldImlaei = String(apiVerse.text_imlaei || '').trim() || joinedImlaei || fieldUthmani;
    const fieldTajweed = String(apiVerse.text_uthmani_tajweed || '').trim();
    const transObj = Array.isArray(apiVerse.translations) && apiVerse.translations.length ? apiVerse.translations[0] : null;
    const english = transObj ? stripFootnoteHtml(transObj.text) : '';

    return {
      hydratorVersion: 2,
      verse_number: vNum,
      verse_key: `${surahNum}:${vNum}`,
      text_uthmani: fieldUthmani ? `${fieldUthmani} ﴿${vNum}﴾` : '',
      text_indopak: fieldIndopak ? `${fieldIndopak} ﴿${vNum}﴾` : '',
      text_imlaei: fieldImlaei ? `${fieldImlaei} (${vNum})` : '',
      text_uthmani_tajweed: fieldTajweed,
      english,
      words
    };
  }

  class QuranTextHydratorEngine {
    constructor(storage) {
      this.storage = storage;
      this.inFlightVerses = new Map();
      this.inFlightChapters = new Map();
      this.bootLoaded = false;
    }

    async loadCachedIntoMemory() {
      if (this.bootLoaded || !window.OfflineQuranDB) return;
      this.bootLoaded = true;
      try {
        const records = await this.storage.getAllCachedVerses();
        if (records && records.length) {
          window.OfflineQuranDB.hydrateCachedVerses(records);
        }
      } catch (_) {}
    }

    async fetchVerseWithWords(surahNum, verseNum) {
      const s = Number(surahNum);
      const v = Number(verseNum);
      const key = `${s}:${v}`;

      let existingData = (window.OfflineQuranDB && window.OfflineQuranDB.hasAuthenticVerse(s, v))
        ? window.OfflineQuranDB.getVerseByKey(key)
        : null;

      if (!existingData) {
        const cached = await this.storage.getCachedVerse(key);
        if (cached && cached.data) {
          window.OfflineQuranDB?.setCachedVerse(key, cached.data);
          existingData = cached.data;
        }
      }

      const needsUpgrade = window.OfflineQuranDB && typeof window.OfflineQuranDB.needsTajweedUpgrade === 'function'
        ? window.OfflineQuranDB.needsTajweedUpgrade(s, v)
        : false;

      if (existingData && !needsUpgrade) {
        return existingData;
      }

      if (this.inFlightVerses.has(key)) {
        return this.inFlightVerses.get(key);
      }

      const promise = (async () => {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), 7000) : null;
        try {
          const url = `https://api.quran.com/api/v4/verses/by_key/${s}:${v}?language=en&words=true&fields=text_uthmani,text_indopak,text_imlaei,text_uthmani_tajweed&word_fields=text_uthmani,text_indopak,text_imlaei&translations=20`;
          const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const json = await res.json();
          const parsed = normalizeApiVerse(json && json.verse, s);
          if (!parsed || !parsed.words || !parsed.words.length) throw new Error('Empty verse words');
          window.OfflineQuranDB?.setCachedVerse(key, parsed);
          await this.storage.saveCachedVerse(key, parsed);
          return parsed;
        } catch (err) {
          if (existingData) return existingData;
          throw err;
        } finally {
          if (timer) clearTimeout(timer);
          this.inFlightVerses.delete(key);
        }
      })();

      this.inFlightVerses.set(key, promise);
      return promise;
    }

    async fetchChapterWithWords(surahNum) {
      const s = Number(surahNum);
      const meta = window.OfflineQuranDB ? window.OfflineQuranDB.getSurahMeta(s) : null;
      if (!meta) return null;
      const needsUpgrade = typeof window.OfflineQuranDB.needsTajweedUpgrade === 'function'
        ? (window.OfflineQuranDB.needsTajweedUpgrade(s, 1) || window.OfflineQuranDB.needsTajweedUpgrade(s, meta.verses))
        : false;
      if (window.OfflineQuranDB.hasAuthenticVerse(s, 1) && window.OfflineQuranDB.hasAuthenticVerse(s, meta.verses) && !needsUpgrade) {
        return window.OfflineQuranDB.getVersesByChapter(s);
      }
      if (this.inFlightChapters.has(s)) {
        return this.inFlightChapters.get(s);
      }

      const promise = (async () => {
        try {
          const totalPages = Math.max(1, Math.ceil(meta.verses / 50));
          const allRecords = [];
          for (let page = 1; page <= totalPages; page++) {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = controller ? setTimeout(() => controller.abort(), 8000) : null;
            try {
              const url = `https://api.quran.com/api/v4/verses/by_chapter/${s}?language=en&words=true&fields=text_uthmani,text_indopak,text_imlaei,text_uthmani_tajweed&word_fields=text_uthmani,text_indopak,text_imlaei&translations=20&per_page=50&page=${page}`;
              const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const json = await res.json();
              const list = Array.isArray(json && json.verses) ? json.verses : [];
              list.forEach((rawV) => {
                const parsed = normalizeApiVerse(rawV, s);
                if (parsed) {
                  allRecords.push({ key: parsed.verse_key, data: parsed });
                  window.OfflineQuranDB?.setCachedVerse(parsed.verse_key, parsed);
                }
              });
            } finally {
              if (timer) clearTimeout(timer);
            }
          }
          if (allRecords.length) {
            await this.storage.saveCachedVersesBulk(allRecords);
          }
          return window.OfflineQuranDB.getVersesByChapter(s);
        } finally {
          this.inFlightChapters.delete(s);
        }
      })();

      this.inFlightChapters.set(s, promise);
      return promise;
    }
  }

  const audioEngineInstance = new UnifiedAudioEngine();
  const wordAudioEngineInstance = new WordAudioEngine(offlineStorage);
  const tafsirManagerInstance = new TafsirManagerEngine(offlineStorage);
  const textHydratorInstance = new QuranTextHydratorEngine(offlineStorage);

  // Export to Global Scope with all expected aliases
  window.QuranDownloadManager = DownloadManager;
  window.OfflineStorageEngine = offlineStorage;
  window.QuranAudioEngine = audioEngineInstance;
  window.UnifiedAudioEngine = audioEngineInstance;
  window.WordAudioEngine = wordAudioEngineInstance;
  window.TafsirManager = tafsirManagerInstance;
  window.QuranTextHydrator = textHydratorInstance;

})(window);
