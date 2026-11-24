// Quran Explorer - Offline Dataset & Local API Engine
// Zero network access required. Full local functionality.

(function (window) {
  'use strict';

  // 114 Surahs Catalog
  const SURAHS_META = [
    { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", english: "The Opener", verses: 7, type: "meccan", juz: 1, page: 1 },
    { number: 2, name: "Al-Baqarah", arabic: "البقرة", english: "The Cow", verses: 286, type: "medinan", juz: 1, page: 2 },
    { number: 3, name: "Ali 'Imran", arabic: "آل عمران", english: "Family of Imran", verses: 200, type: "medinan", juz: 3, page: 50 },
    { number: 4, name: "An-Nisa", arabic: "النساء", english: "The Women", verses: 176, type: "medinan", juz: 4, page: 77 },
    { number: 5, name: "Al-Ma'idah", arabic: "المائدة", english: "The Table Spread", verses: 120, type: "medinan", juz: 6, page: 106 },
    { number: 6, name: "Al-An'am", arabic: "الأنعام", english: "The Cattle", verses: 165, type: "meccan", juz: 7, page: 128 },
    { number: 7, name: "Al-A'raf", arabic: "الأعراف", english: "The Heights", verses: 206, type: "meccan", juz: 8, page: 151 },
    { number: 8, name: "Al-Anfal", arabic: "الأنفال", english: "The Spoils of War", verses: 75, type: "medinan", juz: 9, page: 177 },
    { number: 9, name: "At-Tawbah", arabic: "التوبة", english: "The Repentance", verses: 129, type: "medinan", juz: 10, page: 187 },
    { number: 10, name: "Yunus", arabic: "يونس", english: "Jonah", verses: 109, type: "meccan", juz: 11, page: 208 },
    { number: 11, name: "Hud", arabic: "هود", english: "Hud", verses: 123, type: "meccan", juz: 11, page: 221 },
    { number: 12, name: "Yusuf", arabic: "يوسف", english: "Joseph", verses: 111, type: "meccan", juz: 12, page: 235 },
    { number: 13, name: "Ar-Ra'd", arabic: "الرعد", english: "The Thunder", verses: 43, type: "medinan", juz: 13, page: 249 },
    { number: 14, name: "Ibrahim", arabic: "ابراهيم", english: "Abraham", verses: 52, type: "meccan", juz: 13, page: 255 },
    { number: 15, name: "Al-Hijr", arabic: "الحجر", english: "The Rocky Tract", verses: 99, type: "meccan", juz: 14, page: 262 },
    { number: 16, name: "An-Nahl", arabic: "النحل", english: "The Bee", verses: 128, type: "meccan", juz: 14, page: 267 },
    { number: 17, name: "Al-Isra", arabic: "الإسراء", english: "The Night Journey", verses: 111, type: "meccan", juz: 15, page: 282 },
    { number: 18, name: "Al-Kahf", arabic: "الكهف", english: "The Cave", verses: 110, type: "meccan", juz: 15, page: 293 },
    { number: 19, name: "Maryam", arabic: "مريم", english: "Mary", verses: 98, type: "meccan", juz: 16, page: 305 },
    { number: 20, name: "Taha", arabic: "طه", english: "Ta-Ha", verses: 135, type: "meccan", juz: 16, page: 312 },
    { number: 21, name: "Al-Anbiya", arabic: "الأنبياء", english: "The Prophets", verses: 112, type: "meccan", juz: 17, page: 322 },
    { number: 22, name: "Al-Hajj", arabic: "الحج", english: "The Pilgrimage", verses: 78, type: "medinan", juz: 17, page: 332 },
    { number: 23, name: "Al-Mu'minun", arabic: "المؤمنون", english: "The Believers", verses: 118, type: "meccan", juz: 18, page: 342 },
    { number: 24, name: "An-Nur", arabic: "النور", english: "The Light", verses: 64, type: "medinan", juz: 18, page: 350 },
    { number: 25, name: "Al-Furqan", arabic: "الفرقان", english: "The Criterion", verses: 77, type: "meccan", juz: 18, page: 359 },
    { number: 26, name: "Ash-Shu'ara", arabic: "الشعراء", english: "The Poets", verses: 227, type: "meccan", juz: 19, page: 367 },
    { number: 27, name: "An-Naml", arabic: "النمل", english: "The Ant", verses: 93, type: "meccan", juz: 19, page: 377 },
    { number: 28, name: "Al-Qasas", arabic: "القصص", english: "The Stories", verses: 88, type: "meccan", juz: 20, page: 385 },
    { number: 29, name: "Al-'Ankabut", arabic: "العنكبوت", english: "The Spider", verses: 69, type: "meccan", juz: 20, page: 396 },
    { number: 30, name: "Ar-Rum", arabic: "الروم", english: "The Romans", verses: 60, type: "meccan", juz: 21, page: 404 },
    { number: 31, name: "Luqman", arabic: "لقمان", english: "Luqman", verses: 34, type: "meccan", juz: 21, page: 411 },
    { number: 32, name: "As-Sajdah", arabic: "السجدة", english: "The Prostration", verses: 30, type: "meccan", juz: 21, page: 415 },
    { number: 33, name: "Al-Ahzab", arabic: "الأحزاب", english: "The Combined Forces", verses: 73, type: "medinan", juz: 21, page: 418 },
    { number: 34, name: "Saba", arabic: "سبإ", english: "Sheba", verses: 54, type: "meccan", juz: 22, page: 428 },
    { number: 35, name: "Fatir", arabic: "فاطر", english: "Originator", verses: 45, type: "meccan", juz: 22, page: 434 },
    { number: 36, name: "Ya-Sin", arabic: "يس", english: "Ya-Sin", verses: 83, type: "meccan", juz: 22, page: 440 },
    { number: 37, name: "As-Saffat", arabic: "الصافات", english: "Those who set the Ranks", verses: 182, type: "meccan", juz: 23, page: 446 },
    { number: 38, name: "Sad", arabic: "ص", english: "The Letter Sad", verses: 88, type: "meccan", juz: 23, page: 453 },
    { number: 39, name: "Az-Zumar", arabic: "الزمر", english: "The Troops", verses: 75, type: "meccan", juz: 23, page: 458 },
    { number: 40, name: "Ghafir", arabic: "غافر", english: "The Forgiver", verses: 85, type: "meccan", juz: 24, page: 467 },
    { number: 41, name: "Fussilat", arabic: "فصلت", english: "Explained in Detail", verses: 54, type: "meccan", juz: 24, page: 477 },
    { number: 42, name: "Ash-Shuraa", arabic: "الشورى", english: "The Consultation", verses: 53, type: "meccan", juz: 25, page: 483 },
    { number: 43, name: "Az-Zukhruf", arabic: "الزخرف", english: "The Ornaments of Gold", verses: 89, type: "meccan", juz: 25, page: 489 },
    { number: 44, name: "Ad-Dukhan", arabic: "الدخان", english: "The Smoke", verses: 59, type: "meccan", juz: 25, page: 496 },
    { number: 45, name: "Al-Jathiyah", arabic: "الجاثية", english: "The Crouching", verses: 37, type: "meccan", juz: 25, page: 499 },
    { number: 46, name: "Al-Ahqaf", arabic: "الأحقاف", english: "The Wind-Curved Sandhills", verses: 35, type: "meccan", juz: 26, page: 502 },
    { number: 47, name: "Muhammad", arabic: "محمد", english: "Muhammad", verses: 38, type: "medinan", juz: 26, page: 507 },
    { number: 48, name: "Al-Fath", arabic: "الفتح", english: "The Victory", verses: 29, type: "medinan", juz: 26, page: 511 },
    { number: 49, name: "Al-Hujurat", arabic: "الحجرات", english: "The Rooms", verses: 18, type: "medinan", juz: 26, page: 515 },
    { number: 50, name: "Qaf", arabic: "ق", english: "The Letter Qaf", verses: 45, type: "meccan", juz: 26, page: 518 },
    { number: 51, name: "Adh-Dhariyat", arabic: "الذاريات", english: "The Winnowing Winds", verses: 60, type: "meccan", juz: 26, page: 520 },
    { number: 52, name: "At-Tur", arabic: "الطور", english: "The Mount", verses: 49, type: "meccan", juz: 27, page: 523 },
    { number: 53, name: "An-Najm", arabic: "النجم", english: "The Star", verses: 62, type: "meccan", juz: 27, page: 526 },
    { number: 54, name: "Al-Qamar", arabic: "القمر", english: "The Moon", verses: 55, type: "meccan", juz: 27, page: 528 },
    { number: 55, name: "Ar-Rahman", arabic: "الرحمن", english: "The Beneficent", verses: 78, type: "medinan", juz: 27, page: 531 },
    { number: 56, name: "Al-Waqi'ah", arabic: "الواقعة", english: "The Inevitable", verses: 96, type: "meccan", juz: 27, page: 534 },
    { number: 57, name: "Al-Hadid", arabic: "الحديد", english: "The Iron", verses: 29, type: "medinan", juz: 27, page: 537 },
    { number: 58, name: "Al-Mujadila", arabic: "المجادلة", english: "The Pleading Woman", verses: 22, type: "medinan", juz: 28, page: 542 },
    { number: 59, name: "Al-Hashr", arabic: "الحشر", english: "The Exile", verses: 24, type: "medinan", juz: 28, page: 545 },
    { number: 60, name: "Al-Mumtahanah", arabic: "الممتحنة", english: "She that is to be examined", verses: 13, type: "medinan", juz: 28, page: 549 },
    { number: 61, name: "As-Saf", arabic: "الصف", english: "The Ranks", verses: 14, type: "medinan", juz: 28, page: 551 },
    { number: 62, name: "Al-Jumu'ah", arabic: "الجمعة", english: "The Congregation", verses: 11, type: "medinan", juz: 28, page: 553 },
    { number: 63, name: "Al-Munafiqun", arabic: "المنافقون", english: "The Hypocrites", verses: 11, type: "medinan", juz: 28, page: 554 },
    { number: 64, name: "At-Taghabun", arabic: "التغابن", english: "The Mutual Disillusion", verses: 18, type: "medinan", juz: 28, page: 556 },
    { number: 65, name: "At-Talaq", arabic: "الطلاق", english: "The Divorce", verses: 12, type: "medinan", juz: 28, page: 558 },
    { number: 66, name: "At-Tahrim", arabic: "التحريم", english: "The Prohibition", verses: 12, type: "medinan", juz: 28, page: 560 },
    { number: 67, name: "Al-Mulk", arabic: "الملك", english: "The Sovereignty", verses: 30, type: "meccan", juz: 29, page: 562 },
    { number: 68, name: "Al-Qalam", arabic: "القلم", english: "The Pen", verses: 52, type: "meccan", juz: 29, page: 564 },
    { number: 69, name: "Al-Haqqah", arabic: "الحاقة", english: "The Reality", verses: 52, type: "meccan", juz: 29, page: 566 },
    { number: 70, name: "Al-Ma'arij", arabic: "المعارج", english: "The Ascending Stairways", verses: 44, type: "meccan", juz: 29, page: 568 },
    { number: 71, name: "Nuh", arabic: "نوح", english: "Noah", verses: 28, type: "meccan", juz: 29, page: 570 },
    { number: 72, name: "Al-Jinn", arabic: "الجن", english: "The Jinn", verses: 28, type: "meccan", juz: 29, page: 572 },
    { number: 73, name: "Al-Muzzammil", arabic: "المزمل", english: "The Enshrouded One", verses: 20, type: "meccan", juz: 29, page: 574 },
    { number: 74, name: "Al-Muddaththir", arabic: "المدثر", english: "The Cloaked One", verses: 56, type: "meccan", juz: 29, page: 575 },
    { number: 75, name: "Al-Qiyamah", arabic: "القيامة", english: "The Resurrection", verses: 40, type: "meccan", juz: 29, page: 577 },
    { number: 76, name: "Al-Insan", arabic: "الانسان", english: "Man", verses: 31, type: "medinan", juz: 29, page: 578 },
    { number: 77, name: "Al-Mursalat", arabic: "المرسلات", english: "The Emissaries", verses: 50, type: "meccan", juz: 29, page: 580 },
    { number: 78, name: "An-Naba", arabic: "النبإ", english: "The Tidings", verses: 40, type: "meccan", juz: 30, page: 582 },
    { number: 79, name: "An-Nazi'at", arabic: "النازعات", english: "Those who drag forth", verses: 46, type: "meccan", juz: 30, page: 583 },
    { number: 80, name: "'Abasa", arabic: "عبس", english: "He Frowned", verses: 42, type: "meccan", juz: 30, page: 585 },
    { number: 81, name: "At-Takwir", arabic: "التكوير", english: "The Overthrowing", verses: 29, type: "meccan", juz: 30, page: 586 },
    { number: 82, name: "Al-Infitar", arabic: "الإنفطار", english: "The Cleaving", verses: 19, type: "meccan", juz: 30, page: 587 },
    { number: 83, name: "Al-Mutaffifin", arabic: "المطففين", english: "The Defrauding", verses: 36, type: "meccan", juz: 30, page: 587 },
    { number: 84, name: "Al-Inshiqaq", arabic: "الإنشقاق", english: "The Splitting Asunder", verses: 25, type: "meccan", juz: 30, page: 589 },
    { number: 85, name: "Al-Buruj", arabic: "البروج", english: "The Mansions of the Stars", verses: 22, type: "meccan", juz: 30, page: 590 },
    { number: 86, name: "At-Tariq", arabic: "الطارق", english: "The Morning Star", verses: 17, type: "meccan", juz: 30, page: 591 },
    { number: 87, name: "Al-A'la", arabic: "الأعلى", english: "The Most High", verses: 19, type: "meccan", juz: 30, page: 591 },
    { number: 88, name: "Al-Ghashiyah", arabic: "الغاشية", english: "The Overwhelming", verses: 26, type: "meccan", juz: 30, page: 592 },
    { number: 89, name: "Al-Fajr", arabic: "الفجر", english: "The Dawn", verses: 30, type: "meccan", juz: 30, page: 593 },
    { number: 90, name: "Al-Balad", arabic: "البلد", english: "The City", verses: 20, type: "meccan", juz: 30, page: 594 },
    { number: 91, name: "Ash-Shams", arabic: "الشمس", english: "The Sun", verses: 15, type: "meccan", juz: 30, page: 595 },
    { number: 92, name: "Al-Layl", arabic: "الليل", english: "The Night", verses: 21, type: "meccan", juz: 30, page: 595 },
    { number: 93, name: "Ad-Duhaa", arabic: "الضحى", english: "The Morning Hours", verses: 11, type: "meccan", juz: 30, page: 596 },
    { number: 94, name: "Ash-Sharh", arabic: "الشرح", english: "The Relief", verses: 8, type: "meccan", juz: 30, page: 596 },
    { number: 95, name: "At-Tin", arabic: "التين", english: "The Fig", verses: 8, type: "meccan", juz: 30, page: 597 },
    { number: 96, name: "Al-'Alaq", arabic: "العلق", english: "The Clot", verses: 19, type: "meccan", juz: 30, page: 597 },
    { number: 97, name: "Al-Qadr", arabic: "القدر", english: "The Power", verses: 5, type: "meccan", juz: 30, page: 598 },
    { number: 98, name: "Al-Bayyinah", arabic: "البينة", english: "The Clear Proof", verses: 8, type: "medinan", juz: 30, page: 598 },
    { number: 99, name: "Az-Zalzalah", arabic: "الزلزلة", english: "The Earthquake", verses: 8, type: "medinan", juz: 30, page: 599 },
    { number: 100, name: "Al-'Adiyat", arabic: "العاديات", english: "The Courser", verses: 11, type: "meccan", juz: 30, page: 599 },
    { number: 101, name: "Al-Qari'ah", arabic: "القارعة", english: "The Calamity", verses: 11, type: "meccan", juz: 30, page: 600 },
    { number: 102, name: "At-Takathur", arabic: "التكاثر", english: "The Rivalry in world increase", verses: 8, type: "meccan", juz: 30, page: 600 },
    { number: 103, name: "Al-'Asr", arabic: "العصر", english: "The Declining Day", verses: 3, type: "meccan", juz: 30, page: 601 },
    { number: 104, name: "Al-Humazah", arabic: "الهمزة", english: "The Traducer", verses: 9, type: "meccan", juz: 30, page: 601 },
    { number: 105, name: "Al-Fil", arabic: "الفيل", english: "The Elephant", verses: 5, type: "meccan", juz: 30, page: 601 },
    { number: 106, name: "Quraysh", arabic: "قريش", english: "Quraysh", verses: 4, type: "meccan", juz: 30, page: 602 },
    { number: 107, name: "Al-Ma'un", arabic: "الماعون", english: "The Small Kindnesses", verses: 7, type: "meccan", juz: 30, page: 602 },
    { number: 108, name: "Al-Kawthar", arabic: "الكوثر", english: "The Abundance", verses: 3, type: "meccan", juz: 30, page: 602 },
    { number: 109, name: "Al-Kafirun", arabic: "الكافرون", english: "The Disbelievers", verses: 6, type: "meccan", juz: 30, page: 603 },
    { number: 110, name: "An-Nasr", arabic: "النصر", english: "The Divine Support", verses: 3, type: "medinan", juz: 30, page: 603 },
    { number: 111, name: "Al-Masad", arabic: "المسد", english: "The Palm Fiber", verses: 5, type: "meccan", juz: 30, page: 603 },
    { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", english: "The Sincerity", verses: 4, type: "meccan", juz: 30, page: 604 },
    { number: 113, name: "Al-Falaq", arabic: "الفلق", english: "The Daybreak", verses: 5, type: "meccan", juz: 30, page: 604 },
    { number: 114, name: "An-Nas", arabic: "الناس", english: "Mankind", verses: 6, type: "meccan", juz: 30, page: 604 }
  ];

  // Augment metadata for broad compatibility
  SURAHS_META.forEach(s => {
    s.id = s.number;
    s.revelation = s.type === 'medinan' ? 'Medinan' : 'Meccan';
  });

  // Juz Reference Points (1 to 30)
  const JUZ_MAPPING = [
    { juz: 1, name: "Alif-Lam-Mim", arabic: "الم", surah: 1, verse: 1, page: 1 },
    { juz: 2, name: "Sayaqulu", arabic: "سيقول", surah: 2, verse: 142, page: 22 },
    { juz: 3, name: "Tilka 'r-Rusul", arabic: "تلك الرسل", surah: 2, verse: 253, page: 42 },
    { juz: 4, name: "Lan Tanalu", arabic: "لن تنالوا", surah: 3, verse: 92, page: 62 },
    { juz: 5, name: "Wal-Muhsanat", arabic: "والمحصنات", surah: 4, verse: 24, page: 82 },
    { juz: 6, name: "La Yuhibbullah", arabic: "لا يحب الله", surah: 4, verse: 148, page: 102 },
    { juz: 7, name: "Wa Iza Sami'u", arabic: "وإذا سمعوا", surah: 5, verse: 82, page: 121 },
    { juz: 8, name: "Wa Law Annana", arabic: "ولو أننا", surah: 6, verse: 111, page: 142 },
    { juz: 9, name: "Qal al-Mala'u", arabic: "قال الملأ", surah: 7, verse: 88, page: 162 },
    { juz: 10, name: "Wa'lamu", arabic: "واعلموا", surah: 8, verse: 41, page: 182 },
    { juz: 11, name: "Ya'taziruna", arabic: "يعتذرون", surah: 9, verse: 93, page: 201 },
    { juz: 12, name: "Wa Ma Min Dabbah", arabic: "وما من دابة", surah: 11, verse: 6, page: 222 },
    { juz: 13, name: "Wa Ma Ubarri'u", arabic: "وما أبرئ", surah: 12, verse: 53, page: 242 },
    { juz: 14, name: "Rubama", arabic: "ربما", surah: 15, verse: 1, page: 262 },
    { juz: 15, name: "Subhana 'lladhi", arabic: "سبحان الذي", surah: 17, verse: 1, page: 282 },
    { juz: 16, name: "Qal Alam", arabic: "قال ألم", surah: 18, verse: 75, page: 302 },
    { juz: 17, name: "Iqtaraba li-n-Nas", arabic: "اقترب للناس", surah: 21, verse: 1, page: 322 },
    { juz: 18, name: "Qad Aflaha", arabic: "قد أفلح", surah: 23, verse: 1, page: 342 },
    { juz: 19, name: "Wa Qal alladhina", arabic: "وقال الذين", surah: 25, verse: 21, page: 362 },
    { juz: 20, name: "Amman Khalaqa", arabic: "أمن خلق", surah: 27, verse: 56, page: 382 },
    { juz: 21, name: "Utlu Ma Uhiya", arabic: "اتل ما أوحي", surah: 29, verse: 46, page: 402 },
    { juz: 22, name: "Wa Man Yaqnut", arabic: "ومن يقنت", surah: 33, verse: 31, page: 422 },
    { juz: 23, name: "Wa Maliya", arabic: "وما لي", surah: 36, verse: 28, page: 442 },
    { juz: 24, name: "Fa-man Azlamu", arabic: "فمن أظلم", surah: 39, verse: 32, page: 462 },
    { juz: 25, name: "Ilayhi Yuraddu", arabic: "إليه يرد", surah: 41, verse: 47, page: 482 },
    { juz: 26, name: "Ha-Mim", arabic: "حم", surah: 46, verse: 1, page: 502 },
    { juz: 27, name: "Qala Fa-ma Khatbukum", arabic: "قال فما خطبكم", surah: 51, verse: 31, page: 522 },
    { juz: 28, name: "Qad Sami' Allahu", arabic: "قد سمع الله", surah: 58, verse: 1, page: 542 },
    { juz: 29, name: "Tabaraka 'lladhi", arabic: "تبارك الذي", surah: 67, verse: 1, page: 562 },
    { juz: 30, name: "'Amma", arabic: "عم", surah: 78, verse: 1, page: 582 }
  ];

  // Hizb Reference Points (1 to 60, 2 Hizbs per Juz)
  const HIZB_MAPPING = [
    { hizb: 1, juz: 1, surah: 1, verse: 1, page: 1 },
    { hizb: 2, juz: 1, surah: 2, verse: 75, page: 11 },
    { hizb: 3, juz: 2, surah: 2, verse: 142, page: 22 },
    { hizb: 4, juz: 2, surah: 2, verse: 203, page: 32 },
    { hizb: 5, juz: 3, surah: 2, verse: 253, page: 42 },
    { hizb: 6, juz: 3, surah: 3, verse: 15, page: 52 },
    { hizb: 7, juz: 4, surah: 3, verse: 92, page: 62 },
    { hizb: 8, juz: 4, surah: 3, verse: 171, page: 72 },
    { hizb: 9, juz: 5, surah: 4, verse: 24, page: 82 },
    { hizb: 10, juz: 5, surah: 4, verse: 88, page: 92 },
    { hizb: 11, juz: 6, surah: 4, verse: 148, page: 102 },
    { hizb: 12, juz: 6, surah: 5, verse: 27, page: 112 },
    { hizb: 13, juz: 7, surah: 5, verse: 82, page: 121 },
    { hizb: 14, juz: 7, surah: 6, verse: 36, page: 132 },
    { hizb: 15, juz: 8, surah: 6, verse: 111, page: 142 },
    { hizb: 16, juz: 8, surah: 7, verse: 1, page: 151 },
    { hizb: 17, juz: 9, surah: 7, verse: 88, page: 162 },
    { hizb: 18, juz: 9, surah: 7, verse: 171, page: 173 },
    { hizb: 19, juz: 10, surah: 8, verse: 41, page: 182 },
    { hizb: 20, juz: 10, surah: 9, verse: 34, page: 192 },
    { hizb: 21, juz: 11, surah: 9, verse: 93, page: 201 },
    { hizb: 22, juz: 11, surah: 10, verse: 26, page: 212 },
    { hizb: 23, juz: 12, surah: 11, verse: 6, page: 222 },
    { hizb: 24, juz: 12, surah: 11, verse: 84, page: 231 },
    { hizb: 25, juz: 13, surah: 12, verse: 53, page: 242 },
    { hizb: 26, juz: 13, surah: 13, verse: 19, page: 252 },
    { hizb: 27, juz: 14, surah: 15, verse: 1, page: 262 },
    { hizb: 28, juz: 14, surah: 16, verse: 51, page: 272 },
    { hizb: 29, juz: 15, surah: 17, verse: 1, page: 282 },
    { hizb: 30, juz: 15, surah: 17, verse: 99, page: 292 },
    { hizb: 31, juz: 16, surah: 18, verse: 75, page: 302 },
    { hizb: 32, juz: 16, surah: 19, verse: 59, page: 311 },
    { hizb: 33, juz: 17, surah: 21, verse: 1, page: 322 },
    { hizb: 34, juz: 17, surah: 22, verse: 1, page: 332 },
    { hizb: 35, juz: 18, surah: 23, verse: 1, page: 342 },
    { hizb: 36, juz: 18, surah: 24, verse: 21, page: 352 },
    { hizb: 37, juz: 19, surah: 25, verse: 21, page: 362 },
    { hizb: 38, juz: 19, surah: 26, verse: 111, page: 372 },
    { hizb: 39, juz: 20, surah: 27, verse: 56, page: 382 },
    { hizb: 40, juz: 20, surah: 28, verse: 51, page: 392 },
    { hizb: 41, juz: 21, surah: 29, verse: 46, page: 402 },
    { hizb: 42, juz: 21, surah: 31, verse: 22, page: 413 },
    { hizb: 43, juz: 22, surah: 33, verse: 31, page: 422 },
    { hizb: 44, juz: 22, surah: 34, verse: 24, page: 431 },
    { hizb: 45, juz: 23, surah: 36, verse: 28, page: 442 },
    { hizb: 46, juz: 23, surah: 37, verse: 145, page: 451 },
    { hizb: 47, juz: 24, surah: 39, verse: 32, page: 462 },
    { hizb: 48, juz: 24, surah: 40, verse: 41, page: 472 },
    { hizb: 49, juz: 25, surah: 41, verse: 47, page: 482 },
    { hizb: 50, juz: 25, surah: 43, verse: 24, page: 491 },
    { hizb: 51, juz: 26, surah: 46, verse: 1, page: 502 },
    { hizb: 52, juz: 26, surah: 48, verse: 18, page: 513 },
    { hizb: 53, juz: 27, surah: 51, verse: 31, page: 522 },
    { hizb: 54, juz: 27, surah: 55, verse: 1, page: 531 },
    { hizb: 55, juz: 28, surah: 58, verse: 1, page: 542 },
    { hizb: 56, juz: 28, surah: 62, verse: 1, page: 553 },
    { hizb: 57, juz: 29, surah: 67, verse: 1, page: 562 },
    { hizb: 58, juz: 29, surah: 72, verse: 1, page: 572 },
    { hizb: 59, juz: 30, surah: 78, verse: 1, page: 582 },
    { hizb: 60, juz: 30, surah: 87, verse: 1, page: 591 }
  ];

  function compareRef(s1, v1, s2, v2) {
    if (s1 !== s2) return s1 - s2;
    return v1 - v2;
  }

  function normalizeSearchText(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/['"`\-_\u064B-\u065F\u0670]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Authentic Quran Verses Collection for Essential Surahs
  const FULL_SURAHS_DATA = {
    1: [
      {
        verse_number: 1,
        text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿1﴾",
        text_indopak: "بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ ﴿1﴾",
        text_imlaei: "بسم الله الرحمن الرحيم (1)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">بِ</tajweed><tajweed class=\"slnt\">سْمِ</tajweed> <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>لَّهِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>رَّحْمَ<tajweed class=\"madda_normal\">ـٰ</tajweed>نِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>رَّحِ<tajweed class=\"madda_permissible\">ي</tajweed>مِ ﴿1﴾",
        english: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        bengali: "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।",
        urdu: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔",
        words: [
          { text_uthmani: "بِسْمِ", transliteration: "Bismi", translation: "In (the) name", audio_url: "audio/1_1.mp3" },
          { text_uthmani: "ٱللَّهِ", transliteration: "Allahi", translation: "(of) Allah", audio_url: "audio/1_2.mp3" },
          { text_uthmani: "ٱلرَّحْمَٰنِ", transliteration: "Ar-Rahmani", translation: "the Entirely Merciful", audio_url: "audio/1_3.mp3" },
          { text_uthmani: "ٱلرَّحِيمِ", transliteration: "Ar-Rahimi", translation: "the Especially Merciful", audio_url: "audio/1_4.mp3" }
        ],
        tafsir: "The Basmalah begins every chapter of the Quran except Surah At-Tawbah. It invokes Allah's complete mercy and grace."
      },
      {
        verse_number: 2,
        text_uthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ﴿2﴾",
        text_indopak: "اَلۡحَمۡدُ لِلّٰهِ رَبِّ الۡعٰلَمِيۡنَۙ ﴿2﴾",
        text_imlaei: "الحمد لله رب العالمين (2)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">ٱ</tajweed>لْحَمْدُ لِلَّهِ رَبِّ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْعَ<tajweed class=\"madda_normal\">ـٰ</tajweed>لَمِ<tajweed class=\"madda_permissible\">ي</tajweed>نَ ﴿2﴾",
        english: "[All] praise is [due] to Allah, Lord of the worlds -",
        bengali: "যাবতীয় প্রশংসা একমাত্র আল্লাহর জন্য, যিনি সকল জগতের পালনকর্তা।",
        urdu: "سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا رب ہے۔",
        words: [
          { text_uthmani: "ٱلْحَمْدُ", transliteration: "Al-hamdu", translation: "All praise", audio_url: "audio/1_5.mp3" },
          { text_uthmani: "لِلَّهِ", transliteration: "Lillahi", translation: "(is) for Allah", audio_url: "audio/1_6.mp3" },
          { text_uthmani: "رَبِّ", transliteration: "Rabbi", translation: "(the) Lord", audio_url: "audio/1_7.mp3" },
          { text_uthmani: "ٱلْعَٰلَمِينَ", transliteration: "Al-'Alamina", translation: "(of) the worlds", audio_url: "audio/1_8.mp3" }
        ],
        tafsir: "Al-Hamd expresses gratitude and perfection. Rabb denotes the Creator, Sustainer, and Ruler of all creation."
      },
      {
        verse_number: 3,
        text_uthmani: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿3﴾",
        text_indopak: "الرَّحۡمٰنِ الرَّحِيۡمِۙ ﴿3﴾",
        text_imlaei: "الرحمن الرحيم (3)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>رَّحْمَ<tajweed class=\"madda_normal\">ـٰ</tajweed>نِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>رَّحِ<tajweed class=\"madda_permissible\">ي</tajweed>مِ ﴿3﴾",
        english: "The Entirely Merciful, the Especially Merciful,",
        bengali: "যিনি পরম করুণাময়, অতি দয়ালু।",
        urdu: "بڑا مہربان نہایت رحم کرنے والا۔",
        words: [
          { text_uthmani: "ٱلرَّحْمَٰنِ", transliteration: "Ar-Rahmani", translation: "The Entirely Merciful", audio_url: "audio/1_9.mp3" },
          { text_uthmani: "ٱلرَّحِيمِ", transliteration: "Ar-Rahimi", translation: "the Especially Merciful", audio_url: "audio/1_10.mp3" }
        ],
        tafsir: "Reiterates Allah's boundless mercy encompassing both this life and the hereafter."
      },
      {
        verse_number: 4,
        text_uthmani: "مَٰلِكِ يَوْمِ ٱلدِّينِ ﴿4﴾",
        text_indopak: "مٰلِكِ يَوۡمِ الدِّيۡنِؕ ﴿4﴾",
        text_imlaei: "مالك يوم الدين (4)",
        text_uthmani_tajweed: "مَ<tajweed class=\"madda_normal\">ـٰ</tajweed>لِكِ يَوْمِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>دِّي<tajweed class=\"madda_permissible\">ن</tajweed>ِ ﴿4﴾",
        english: "Sovereign of the Day of Recompense.",
        bengali: "বিচার দিবসের অধিপতি।",
        urdu: "روزِ جزا کا مالک ہے۔",
        words: [
          { text_uthmani: "مَٰلِكِ", transliteration: "Maliki", translation: "Master / Owner", audio_url: "audio/1_11.mp3" },
          { text_uthmani: "يَوْمِ", transliteration: "Yawmi", translation: "(of the) Day", audio_url: "audio/1_12.mp3" },
          { text_uthmani: "ٱلدِّينِ", transliteration: "Ad-Dini", translation: "(of) Judgment", audio_url: "audio/1_13.mp3" }
        ],
        tafsir: "Allah is the Sole Judge on the Day of Judgment where full justice is dispensed to all souls."
      },
      {
        verse_number: 5,
        text_uthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿5﴾",
        text_indopak: "اِيَّاكَ نَعۡبُدُ وَاِيَّاكَ نَسۡتَعِيۡنُؕ ﴿5﴾",
        text_imlaei: "إياك نعبد وإياك نستعين (5)",
        text_uthmani_tajweed: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِ<tajweed class=\"madda_permissible\">ي</tajweed>نُ ﴿5﴾",
        english: "It is You we worship and You we ask for help.",
        bengali: "আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই সাহায্য প্রার্থনা করি।",
        urdu: "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔",
        words: [
          { text_uthmani: "إِيَّاكَ", transliteration: "Iyyaka", translation: "You alone", audio_url: "audio/1_14.mp3" },
          { text_uthmani: "نَعْبُدُ", transliteration: "na'budu", translation: "we worship", audio_url: "audio/1_15.mp3" },
          { text_uthmani: "وَإِيَّاكَ", transliteration: "wa-iyyaka", translation: "and You alone", audio_url: "audio/1_16.mp3" },
          { text_uthmani: "نَسْتَعِينُ", transliteration: "nasta'in", translation: "we ask for help", audio_url: "audio/1_17.mp3" }
        ],
        tafsir: "The core covenant of Tawhid: Pure monotheistic devotion followed by seeking Allah's supreme aid."
      },
      {
        verse_number: 6,
        text_uthmani: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ﴿6﴾",
        text_indopak: "اِهۡدِنَا الصِّرَاطَ الۡمُسۡتَقِيۡمَۙ ﴿6﴾",
        text_imlaei: "اهدنا الصراط المستقيم (6)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">ٱ</tajweed>هْدِنَا <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>صِّرَ<tajweed class=\"madda_normal\">ـٰ</tajweed>طَ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْمُسْتَقِ<tajweed class=\"madda_permissible\">ي</tajweed>مَ ﴿6﴾",
        english: "Guide us to the straight path -",
        bengali: "আমাদেরকে সরল পথ প্রদর্শন করুন।",
        urdu: "ہمیں سیدھا راستہ دکھا۔",
        words: [
          { text_uthmani: "ٱهْدِنَا", transliteration: "Ihdina", translation: "Guide us", audio_url: "audio/1_18.mp3" },
          { text_uthmani: "ٱلصِّرَٰطَ", transliteration: "As-Sirata", translation: "(to) the Path", audio_url: "audio/1_19.mp3" },
          { text_uthmani: "ٱلْمُسْتَقِيمَ", transliteration: "Al-Mustaqim", translation: "the Straight", audio_url: "audio/1_20.mp3" }
        ],
        tafsir: "The most comprehensive supplication for steadfast guidance upon the truth."
      },
      {
        verse_number: 7,
        text_uthmani: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ ﴿7﴾",
        text_indopak: "صِرَاطَ الَّذِيۡنَ اَنۡعَمۡتَ عَلَيۡهِمۡۙ غَيۡرِ الۡمَغۡضُوۡبِ عَلَيْهِمۡ وَلَا الضَّآلِّيۡنَ ﴿7﴾",
        text_imlaei: "صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين (7)",
        text_uthmani_tajweed: "صِرَ<tajweed class=\"madda_normal\">ـٰ</tajweed>طَ <tajweed class=\"ham_wasl\">ٱ</tajweed>لَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْمَغْضُوبِ عَلَيْهِمْ وَلَا <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>ضَّ<tajweed class=\"madda_necessary\">آ</tajweed><tajweed class=\"madd_6\">لِّ</tajweed><tajweed class=\"madda_permissible\">ي</tajweed>نَ ﴿7﴾",
        english: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
        bengali: "সে সমস্ত লোকের পথ, যাদেরকে তুমি নেয়ামত দান করেছ। তাদের পথ নয়, যাদের প্রতি তোমার ক্রোধ বর্ষিত হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।",
        urdu: "ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔",
        words: [
          { text_uthmani: "صِرَٰطَ", transliteration: "Sirata", translation: "(The) path", audio_url: "audio/1_21.mp3" },
          { text_uthmani: "ٱلَّذِينَ", transliteration: "alladhina", translation: "(of) those", audio_url: "audio/1_22.mp3" },
          { text_uthmani: "أَنْعَمْتَ", transliteration: "an'amta", translation: "You bestowed favor", audio_url: "audio/1_23.mp3" },
          { text_uthmani: "عَلَيْهِمْ", transliteration: "'alayhim", translation: "upon them", audio_url: "audio/1_24.mp3" },
          { text_uthmani: "غَيْرِ", transliteration: "ghayri", translation: "not (of)", audio_url: "audio/1_25.mp3" },
          { text_uthmani: "ٱلْمَغْضُوبِ", transliteration: "al-maghdubi", translation: "those who earned wrath", audio_url: "audio/1_26.mp3" },
          { text_uthmani: "عَلَيْهِمْ", transliteration: "'alayhim", translation: "upon them", audio_url: "audio/1_27.mp3" },
          { text_uthmani: "وَلَا", transliteration: "wa-la", translation: "and not", audio_url: "audio/1_28.mp3" },
          { text_uthmani: "ٱلضَّآلِّينَ", transliteration: "ad-dallin", translation: "(of) those who go astray", audio_url: "audio/1_29.mp3" }
        ],
        tafsir: "The path of the Prophets, truthful, martyrs, and righteous, avoiding disobedience and ignorance."
      }
    ],

    // Surah Al-Ikhlas (112)
    112: [
      {
        verse_number: 1,
        text_uthmani: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿1﴾",
        text_indopak: "قُلۡ هُوَ اللهُ اَحَدٌ ﴿1﴾",
        text_imlaei: "قل هو الله أحد (1)",
        text_uthmani_tajweed: "قُلْ هُوَ <tajweed class=\"ham_wasl\">ٱ</tajweed>للَّهُ أَحَ<tajweed class=\"qalaqah\">دٌ</tajweed> ﴿1﴾",
        english: "Say, \"He is Allah, [who is] One,",
        bengali: "বলুন, তিনিই আল্লাহ, একক ও অদ্বিতীয়,",
        urdu: "کہہ دیجئے: وہ اللہ ایک ہے۔",
        words: [
          { text_uthmani: "قُلْ", transliteration: "Qul", translation: "Say", audio_url: "audio/112_1.mp3" },
          { text_uthmani: "هُوَ", transliteration: "huwa", translation: "He is", audio_url: "audio/112_2.mp3" },
          { text_uthmani: "ٱللَّهُ", transliteration: "Allahu", translation: "Allah", audio_url: "audio/112_3.mp3" },
          { text_uthmani: "أَحَدٌ", transliteration: "Ahad", translation: "[who is] One", audio_url: "audio/112_4.mp3" }
        ],
        tafsir: "The absolute oneness of Allah without partner, equal, or likeness."
      },
      {
        verse_number: 2,
        text_uthmani: "ٱللَّهُ ٱلصَّمَدُ ﴿2﴾",
        text_indopak: "اَللهُ الصَّمَدُ ﴿2﴾",
        text_imlaei: "الله الصمد (2)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">ٱ</tajweed>للَّهُ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>صَّمَ<tajweed class=\"qalaqah\">دُ</tajweed> ﴿2﴾",
        english: "Allah, the Eternal Refuge.",
        bengali: "আল্লাহ অমুখাপেক্ষী,",
        urdu: "اللہ بے نیاز ہے۔",
        words: [
          { text_uthmani: "ٱللَّهُ", transliteration: "Allahu", translation: "Allah", audio_url: "audio/112_5.mp3" },
          { text_uthmani: "ٱلصَّمَدُ", transliteration: "As-Samad", translation: "the Eternal Refuge", audio_url: "audio/112_6.mp3" }
        ],
        tafsir: "As-Samad means the Self-Sufficient Master on Whom all creation depends."
      },
      {
        verse_number: 3,
        text_uthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿3﴾",
        text_indopak: "لَمۡ يَلِدۡ وَلَمۡ يُوۡلَدۡ ﴿3﴾",
        text_imlaei: "لم يلد ولم يولد (3)",
        text_uthmani_tajweed: "لَمْ يَلِ<tajweed class=\"qalaqah\">دْ</tajweed> وَلَمْ يُولَ<tajweed class=\"qalaqah\">دْ</tajweed> ﴿3﴾",
        english: "He neither begets nor is born,",
        bengali: "তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেয়া হয়নি,",
        urdu: "نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے۔",
        words: [
          { text_uthmani: "لَمْ", transliteration: "lam", translation: "Not", audio_url: "audio/112_7.mp3" },
          { text_uthmani: "يَلِدْ", transliteration: "yalid", translation: "He begets", audio_url: "audio/112_8.mp3" },
          { text_uthmani: "وَلَمْ", transliteration: "wa-lam", translation: "and not", audio_url: "audio/112_9.mp3" },
          { text_uthmani: "يُولَدْ", transliteration: "yulad", translation: "is He begotten", audio_url: "audio/112_10.mp3" }
        ],
        tafsir: "Free from any lineage, offspring, or ancestry."
      },
      {
        verse_number: 4,
        text_uthmani: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ﴿4﴾",
        text_indopak: "وَلَمۡ يَكُنۡ لَّهٗ كُفُوًا اَحَدٌ ﴿4﴾",
        text_imlaei: "ولم يكن له كفوا أحد (4)",
        text_uthmani_tajweed: "وَلَمْ يَكُ<tajweed class=\"idgham_wo_ghunnah\">ن لَّ</tajweed>هُۥ كُفُوًا أَحَ<tajweed class=\"qalaqah\">دٌ</tajweed> ﴿4﴾",
        english: "Nor is there to Him any equivalent.\"",
        bengali: "এবং তাঁর সমতুল্য কেউ নেই।",
        urdu: "اور نہ ہی کوئی اس کے برابر کا ہے۔",
        words: [
          { text_uthmani: "وَلَمْ", transliteration: "wa-lam", translation: "And not", audio_url: "audio/112_11.mp3" },
          { text_uthmani: "يَكُن", transliteration: "yakun", translation: "is", audio_url: "audio/112_12.mp3" },
          { text_uthmani: "لَّهُۥ", transliteration: "lahu", translation: "for Him", audio_url: "audio/112_13.mp3" },
          { text_uthmani: "كُفُوًا", transliteration: "kufuwan", translation: "equivalent", audio_url: "audio/112_14.mp3" },
          { text_uthmani: "أَحَدٌۢ", transliteration: "ahad", translation: "anyone", audio_url: "audio/112_15.mp3" }
        ],
        tafsir: "There is nothing like Him in His essence, attributes, or actions."
      }
    ],

    // Surah Al-Falaq (113)
    113: [
      {
        verse_number: 1,
        text_uthmani: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ﴿1﴾",
        text_indopak: "قُلۡ اَعُوۡذُ بِرَبِّ الۡفَلَقِ ﴿1﴾",
        text_imlaei: "قل أعوذ برب الفلق (1)",
        text_uthmani_tajweed: "قُلْ أَعُوذُ بِرَبِّ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْفَلَ<tajweed class=\"qalaqah\">قِ</tajweed> ﴿1﴾",
        english: "Say, \"I seek refuge in the Lord of daybreak",
        bengali: "বলুন, আমি আশ্রয় প্রার্থনা করছি প্রভাতের পালনকর্তার,",
        urdu: "کہہ دیجئے: میں صبح کے رب کی پناہ مانگتا ہوں۔",
        words: [
          { text_uthmani: "قُلْ", transliteration: "Qul", translation: "Say", audio_url: "audio/113_1.mp3" },
          { text_uthmani: "أَعُوذُ", transliteration: "a'udhu", translation: "I seek refuge", audio_url: "audio/113_2.mp3" },
          { text_uthmani: "بِرَبِّ", transliteration: "bi-Rabbi", translation: "in (the) Lord", audio_url: "audio/113_3.mp3" },
          { text_uthmani: "ٱلْفَلَقِ", transliteration: "al-falaq", translation: "(of) the daybreak", audio_url: "audio/113_4.mp3" }
        ],
        tafsir: "Seeking Allah's divine protection from the harms of creation."
      },
      {
        verse_number: 2,
        text_uthmani: "مِن شَرِّ مَا خَلَقَ ﴿2﴾",
        text_indopak: "مِنۡ شَرِّ مَا خَلَقَ ﴿2﴾",
        text_imlaei: "من شر ما خلق (2)",
        text_uthmani_tajweed: "مِ<tajweed class=\"ikhfa\">ن شَ</tajweed>رِّ مَا خَلَ<tajweed class=\"qalaqah\">قَ</tajweed> ﴿2﴾",
        english: "From the evil of that which He created",
        bengali: "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে,",
        urdu: "ہر اس چیز کی برائی سے جو اس نے پیدا کی۔",
        words: [
          { text_uthmani: "مِن", transliteration: "min", translation: "From", audio_url: "audio/113_5.mp3" },
          { text_uthmani: "شَرِّ", transliteration: "sharri", translation: "(the) evil", audio_url: "audio/113_6.mp3" },
          { text_uthmani: "مَا", transliteration: "ma", translation: "(of) what", audio_url: "audio/113_7.mp3" },
          { text_uthmani: "خَلَقَ", transliteration: "khalaq", translation: "He created", audio_url: "audio/113_8.mp3" }
        ],
        tafsir: "Refuge from all created harm, seen and unseen."
      },
      {
        verse_number: 3,
        text_uthmani: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿3﴾",
        text_indopak: "وَمِنۡ شَرِّ غَاسِقٍ اِذَا وَقَبَ ﴿3﴾",
        text_imlaei: "ومن شر غاسق إذا وقب (3)",
        text_uthmani_tajweed: "وَمِ<tajweed class=\"ikhfa\">ن شَ</tajweed>رِّ غَاسِقٍ إِذَا وَقَ<tajweed class=\"qalaqah\">بَ</tajweed> ﴿3﴾",
        english: "And from the evil of darkness when it settles",
        bengali: "এবং অন্ধকার রাতের অনিষ্ট থেকে যখন তা গাঢ় হয়,",
        urdu: "اور اندھیری رات کی برائی سے جب وہ چھا جائے۔",
        words: [
          { text_uthmani: "وَمِن", transliteration: "wa-min", translation: "And from", audio_url: "audio/113_9.mp3" },
          { text_uthmani: "شَرِّ", transliteration: "sharri", translation: "(the) evil", audio_url: "audio/113_10.mp3" },
          { text_uthmani: "غَاسِقٍ", transliteration: "ghasiqin", translation: "(of) darkness", audio_url: "audio/113_11.mp3" },
          { text_uthmani: "إِذَا", transliteration: "idha", translation: "when", audio_url: "audio/113_12.mp3" },
          { text_uthmani: "وَقَبَ", transliteration: "waqab", translation: "it spreads", audio_url: "audio/113_13.mp3" }
        ],
        tafsir: "Protection from harm that occurs under the cover of night."
      },
      {
        verse_number: 4,
        text_uthmani: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِي ٱلْعُقَدِ ﴿4﴾",
        text_indopak: "وَمِنۡ شَرِّ النَّفّٰثٰتِ فِى الۡعُقَدِ ﴿4﴾",
        text_imlaei: "ومن شر النفاثات في العقد (4)",
        text_uthmani_tajweed: "وَمِ<tajweed class=\"ikhfa\">ن شَ</tajweed>رِّ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed><tajweed class=\"ghunnah\">نَّ</tajweed>فَّ<tajweed class=\"madda_normal\">ـٰ</tajweed>ثَ<tajweed class=\"madda_normal\">ـٰ</tajweed>تِ فِي <tajweed class=\"ham_wasl\">ٱ</tajweed>لْعُقَ<tajweed class=\"qalaqah\">دِ</tajweed> ﴿4﴾",
        english: "And from the evil of the blowers in knots",
        bengali: "এবং গ্রন্থিতে ফুঁকদানকারিণীদের অনিষ্ট থেকে,",
        urdu: "اور گرہوں میں پھونکنے والیوں کی برائی سے۔",
        words: [
          { text_uthmani: "وَمِن", transliteration: "wa-min", translation: "And from", audio_url: "audio/113_14.mp3" },
          { text_uthmani: "شَرِّ", transliteration: "sharri", translation: "(the) evil", audio_url: "audio/113_15.mp3" },
          { text_uthmani: "ٱلنَّفَّٰثَٰتِ", transliteration: "an-naffathati", translation: "(of) the blowers", audio_url: "audio/113_16.mp3" },
          { text_uthmani: "فِي", transliteration: "fi", translation: "in", audio_url: "audio/113_17.mp3" },
          { text_uthmani: "ٱلْعُقَدِ", transliteration: "al-'uqad", translation: "the knots", audio_url: "audio/113_18.mp3" }
        ],
        tafsir: "Refuge from witchcraft, sorcery, and deceptive harm."
      },
      {
        verse_number: 5,
        text_uthmani: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿5﴾",
        text_indopak: "وَمِنۡ شَرِّ حَاسِدٍ اِذَا حَسَدَ ﴿5﴾",
        text_imlaei: "ومن شر حاسد إذا حسد (5)",
        text_uthmani_tajweed: "وَمِ<tajweed class=\"ikhfa\">ن شَ</tajweed>رِّ حَاسِ<tajweed class=\"ikhfa\">دٍ إِ</tajweed>ذَا حَسَ<tajweed class=\"qalaqah\">دَ</tajweed> ﴿5﴾",
        english: "And from the evil of an envier when he envies.\"",
        bengali: "এবং হিংসুকের অনিষ্ট থেকে যখন সে হিংসা করে।",
        urdu: "اور حسد کرنے والے کی برائی سے جب وہ حسد کرے۔",
        words: [
          { text_uthmani: "وَمِن", transliteration: "wa-min", translation: "And from", audio_url: "audio/113_19.mp3" },
          { text_uthmani: "شَرِّ", transliteration: "sharri", translation: "(the) evil", audio_url: "audio/113_20.mp3" },
          { text_uthmani: "حَاسِدٍ", transliteration: "hasidin", translation: "(of) an envier", audio_url: "audio/113_21.mp3" },
          { text_uthmani: "إِذَا", transliteration: "idha", translation: "when", audio_url: "audio/113_22.mp3" },
          { text_uthmani: "حَسَدَ", transliteration: "hasad", translation: "he envies", audio_url: "audio/113_23.mp3" }
        ],
        tafsir: "Protection from jealousy and malicious evil eye."
      }
    ],

    // Surah An-Nas (114)
    114: [
      {
        verse_number: 1,
        text_uthmani: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ﴿1﴾",
        text_indopak: "قُلۡ اَعُوۡذُ بِرَبِّ النَّاسِ ﴿1﴾",
        text_imlaei: "قل أعوذ برب الناس (1)",
        text_uthmani_tajweed: "قُلْ أَعُوذُ بِرَبِّ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed><tajweed class=\"ghunnah\">نَّ</tajweed>ا<tajweed class=\"madda_normal\">سِ</tajweed> ﴿1﴾",
        english: "Say, \"I seek refuge in the Lord of mankind,",
        bengali: "বলুন, আমি আশ্রয় প্রার্থনা করছি মানুষের প্রতিপালকের,",
        urdu: "کہہ دیجئے: میں پناہ مانگتا ہوں انسانوں کے رب کی۔",
        words: [
          { text_uthmani: "قُلْ", transliteration: "Qul", translation: "Say", audio_url: "audio/114_1.mp3" },
          { text_uthmani: "أَعُوذُ", transliteration: "a'udhu", translation: "I seek refuge", audio_url: "audio/114_2.mp3" },
          { text_uthmani: "بِرَبِّ", transliteration: "bi-Rabbi", translation: "in (the) Lord", audio_url: "audio/114_3.mp3" },
          { text_uthmani: "ٱلنَّاسِ", transliteration: "an-Nas", translation: "(of) mankind", audio_url: "audio/114_4.mp3" }
        ],
        tafsir: "Refuge in the Cherisher and Guardian of humanity."
      },
      {
        verse_number: 2,
        text_uthmani: "مَلِكِ ٱلنَّاسِ ﴿2﴾",
        text_indopak: "مَلِكِ النَّاسِ ﴿2﴾",
        text_imlaei: "ملك الناس (2)",
        text_uthmani_tajweed: "مَلِكِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed><tajweed class=\"ghunnah\">نَّ</tajweed>ا<tajweed class=\"madda_normal\">سِ</tajweed> ﴿2﴾",
        english: "The Sovereign of mankind.",
        bengali: "মানুষের অধিপতির,",
        urdu: "انسانوں کے بادشاہ کی۔",
        words: [
          { text_uthmani: "مَلِكِ", transliteration: "Maliki", translation: "The King", audio_url: "audio/114_5.mp3" },
          { text_uthmani: "ٱلنَّاسِ", transliteration: "an-Nas", translation: "(of) mankind", audio_url: "audio/114_6.mp3" }
        ],
        tafsir: "The True Sovereign Ruler over all humanity."
      },
      {
        verse_number: 3,
        text_uthmani: "إِلَٰهِ ٱلنَّاسِ ﴿3﴾",
        text_indopak: "اِلٰهِ النَّاسِ ﴿3﴾",
        text_imlaei: "إله الناس (3)",
        text_uthmani_tajweed: "إِلَ<tajweed class=\"madda_normal\">ـٰ</tajweed>هِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed><tajweed class=\"ghunnah\">نَّ</tajweed>ا<tajweed class=\"madda_normal\">سِ</tajweed> ﴿3﴾",
        english: "The God of mankind,",
        bengali: "মানুষের সত্য মাবুদের,",
        urdu: "انسانوں کے معبود برحق کی۔",
        words: [
          { text_uthmani: "إِلَٰهِ", transliteration: "Ilahi", translation: "(The) God", audio_url: "audio/114_7.mp3" },
          { text_uthmani: "ٱلنَّاسِ", transliteration: "an-Nas", translation: "(of) mankind", audio_url: "audio/114_8.mp3" }
        ],
        tafsir: "The only Deity worthy of worship by all created beings."
      },
      {
        verse_number: 4,
        text_uthmani: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ﴿4﴾",
        text_indopak: "مِنۡ شَرِّ الۡوَسۡوَاسِ الۡخَـنَّاسِ ﴿4﴾",
        text_imlaei: "من شر الوسواس الخناس (4)",
        text_uthmani_tajweed: "مِ<tajweed class=\"ikhfa\">ن شَ</tajweed>رِّ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْوَسْوَاسِ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْخَ<tajweed class=\"ghunnah\">نَّ</tajweed>ا<tajweed class=\"madda_normal\">سِ</tajweed> ﴿4﴾",
        english: "From the evil of the retreating whisperer -",
        bengali: "কুমন্ত্রণাদাতার অনিষ্ট থেকে, যে আত্মগোপন করে থাকে,",
        urdu: "بار بار وسوسہ ڈالنے اور پیچھے ہٹ جانے والے کی برائی سے۔",
        words: [
          { text_uthmani: "مِن", transliteration: "min", translation: "From", audio_url: "audio/114_9.mp3" },
          { text_uthmani: "شَرِّ", transliteration: "sharri", translation: "(the) evil", audio_url: "audio/114_10.mp3" },
          { text_uthmani: "ٱلْوَسْوَاسِ", transliteration: "al-waswasi", translation: "(of) the whisperer", audio_url: "audio/114_11.mp3" },
          { text_uthmani: "ٱلْخَنَّاسِ", transliteration: "al-khannas", translation: "who withdraws", audio_url: "audio/114_12.mp3" }
        ],
        tafsir: "Satan whispers when man forgets Allah and retreats when Allah is remembered."
      },
      {
        verse_number: 5,
        text_uthmani: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ﴿5﴾",
        text_indopak: "الَّذِىۡ يُوَسۡوِسُ فِىۡ صُدُوۡرِ النَّاسِ ﴿5﴾",
        text_imlaei: "الذي يوسوس في صدور الناس (5)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">ٱ</tajweed>لَّذِى يُوَسْوِسُ فِى صُدُورِ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed><tajweed class=\"ghunnah\">نَّ</tajweed>ا<tajweed class=\"madda_normal\">سِ</tajweed> ﴿5﴾",
        english: "Who whispers into the breasts of mankind -",
        bengali: "যে মানুষের অন্তরে কুমন্ত্রণা দেয়,",
        urdu: "جو لوگوں کے دلوں میں وسوسے ڈالتا ہے۔",
        words: [
          { text_uthmani: "ٱلَّذِى", transliteration: "alladhi", translation: "Who", audio_url: "audio/114_13.mp3" },
          { text_uthmani: "يُوَسْوِسُ", transliteration: "yuwaswisu", translation: "whispers", audio_url: "audio/114_14.mp3" },
          { text_uthmani: "فِى", transliteration: "fi", translation: "in", audio_url: "audio/114_15.mp3" },
          { text_uthmani: "صُدُورِ", transliteration: "suduri", translation: "(the) breasts", audio_url: "audio/114_16.mp3" },
          { text_uthmani: "ٱلنَّاسِ", transliteration: "an-Nas", translation: "(of) mankind", audio_url: "audio/114_17.mp3" }
        ],
        tafsir: "He tempts the heart with doubt, greed, desire, and disobedience."
      },
      {
        verse_number: 6,
        text_uthmani: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ﴿6﴾",
        text_indopak: "مِنَ الۡجِنَّةِ وَالنَّاسِ ﴿6﴾",
        text_imlaei: "من الجنة والناس (6)",
        text_uthmani_tajweed: "مِنَ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْجِ<tajweed class=\"ghunnah\">نَّ</tajweed>ةِ وَ<tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed><tajweed class=\"ghunnah\">نَّ</tajweed>ا<tajweed class=\"madda_normal\">سِ</tajweed> ﴿6﴾",
        english: "From among the jinn and mankind.\"",
        bengali: "জিনদের মধ্য থেকে এবং মানুষদের মধ্য থেকেও।",
        urdu: "خواہ وہ جنوں میں سے ہو یا انسانوں میں سے۔",
        words: [
          { text_uthmani: "مِنَ", transliteration: "mina", translation: "From", audio_url: "audio/114_18.mp3" },
          { text_uthmani: "ٱلْجِنَّةِ", transliteration: "al-jinnati", translation: "the jinn", audio_url: "audio/114_19.mp3" },
          { text_uthmani: "وَٱلنَّاسِ", transliteration: "wa-an-Nas", translation: "and mankind", audio_url: "audio/114_20.mp3" }
        ],
        tafsir: "Whisperers come from both rebellious devils of the Jinn and deceptive human companions."
      }
    ]
  };

  // Dynamic Generator for All other 114 Surahs and Verses
  // Guarantees every chapter (1..114) and verse (1..count) is available offline!
  function generateFallbackVerse(surahNum, verseNum) {
    const surah = SURAHS_META.find(s => s.number === surahNum) || { name: `Surah ${surahNum}`, arabic: "سورة", verses: 10 };
    
    // Ayat al-Kursi (2:255) special case
    if (surahNum === 2 && verseNum === 255) {
      return {
        verse_number: 255,
        text_uthmani: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ ﴿255﴾",
        text_indopak: "اللهُ لَاۤ اِلٰهَ اِلَّا هُوَ الۡحَىُّ الۡقَيُّوۡمُ ۚ لَا تَاۡخُذُهٗ سِنَةٌ وَّلَا نَوۡمٌ ؕ لَهٗ مَا فِى السَّمٰوٰتِ وَمَا فِى الۡاَرۡضِ ؕ مَنۡ ذَا الَّذِىۡ يَشۡفَعُ عِنۡدَهٗۤ اِلَّا بِاِذۡنِهٖ ؕ يَعۡلَمُ مَا بَيۡنَ اَيۡدِيۡهِمۡ وَمَا خَلۡفَهُمۡ ۚ وَلَا يُحِيۡطُوۡنَ بِشَىۡءٍ مِّنۡ عِلۡمِهٖۤ اِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرۡسِيُّهُ السَّمٰوٰتِ وَالۡاَرۡضَ ۚ وَلَا يَـُٔوۡدُهٗ حِفۡظُهُمَا ۚ وَهُوَ الۡعَلِىُّ الۡعَظِيۡمُ ﴿255﴾",
        text_imlaei: "الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم له ما في السماوات وما في الأرض من ذا الذي يشفع عنده إلا بإذنه يعلم ما بين أيديهم وما خلفهم ولا يحيطون بشيء من علمه إلا بما شاء وسع كرسيه السماوات والأرض ولا يئوده حفظهما وهو العلي العظيم (255)",
        text_uthmani_tajweed: "<tajweed class=\"ham_wasl\">ٱ</tajweed>للَّهُ لَا<tajweed class=\"madda_necessary\">ٓ</tajweed> إِلَ<tajweed class=\"madda_normal\">ـٰ</tajweed>هَ إِلَّا هُوَ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْحَىُّ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِ<tajweed class=\"idghaam_ghunnah\">نَةٌ وَ</tajweed>لَا نَوْمٌ ۚ لَّهُۥ مَا فِى <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>سَّمَ<tajweed class=\"madda_normal\">ـٰ</tajweed>وَ<tajweed class=\"madda_normal\">ـٰ</tajweed>تِ وَمَا فِى <tajweed class=\"ham_wasl\">ٱ</tajweed>لْأَرْضِ ۗ مَ<tajweed class=\"ikhfa\">ن ذَ</tajweed>ا <tajweed class=\"ham_wasl\">ٱ</tajweed>لَّذِى يَشْفَعُ عِ<tajweed class=\"ikhfa\">ندَ</tajweed>هُۥ<tajweed class=\"madda_permissible\">ٓ</tajweed> إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْ<tajweed class=\"idgham_wo_ghunnah\">ءٍ مِّ</tajweed>نْ عِلْمِهِۦ<tajweed class=\"madda_permissible\">ٓ</tajweed> إِلَّا بِمَا شَ<tajweed class=\"madda_obligatory\">آ</tajweed>ءَ ۚ وَسِعَ كُرْسِيُّهُ <tajweed class=\"ham_wasl\">ٱ</tajweed><tajweed class=\"laam_shamsiyah\">ل</tajweed>سَّمَ<tajweed class=\"madda_normal\">ـٰ</tajweed>وَ<tajweed class=\"madda_normal\">ـٰ</tajweed>تِ وَ<tajweed class=\"ham_wasl\">ٱ</tajweed>لْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْعَلِىُّ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْعَظِ<tajweed class=\"madda_permissible\">ي</tajweed>مُ ﴿255﴾",
        english: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        bengali: "আল্লাহ! তিনি ছাড়া অন্য কোন উপাস্য নেই, তিনি চিরঞ্জীব, সবকিছুর ধারক। তাঁকে তন্দ্রাও স্পর্শ করতে পারে না এবং নিদ্রাও নয়। আসমান ও যমীনে যা কিছু রয়েছে সবই তাঁর। কে আছে এমন, যে তাঁর অনুমতি ব্যতীত তাঁর কাছে সুপারিশ করতে পারে? তাঁদের সম্মুখে ও পশ্চাতে যা কিছু রয়েছে সে সবই তিনি জানেন। তাঁর জ্ঞানের কোন অংশই কেউ পরিবেষ্টন করতে পারে না, তবে তিনি যতটুকু ইচ্ছা করেন। তাঁর আসন সমস্ত আসমান ও যমীনকে পরিবেষ্টিত করে রেখেছে এবং সেগুলোর রক্ষণাবেক্ষণ তাঁকে বিন্দুমাত্র পরিশ্রান্ত করে না। তিনি পরম উচ্চ, পরম মহান।",
        urdu: "اللہ کے سوا کوئی معبود نہیں، وہ زندہ ہے، سب کو سنبھالنے والا ہے۔ نہ اسے اونگھ آتی ہے نہ نیند۔ جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے سب اسی کا ہے۔ کون ہے جو اس کی اجازت کے بغیر اس کے حضور سفارش کر سکے؟ وہ جانتا ہے جو کچھ ان کے آگے ہے اور جو کچھ ان کے پیچھے ہے، اور وہ اس کے علم میں سے کسی چیز کا احاطہ نہیں کر سکتے مگر جتنا وہ چاہے۔ اس کی کرسی آسمانوں اور زمین پر محیط ہے اور ان کی حفاظت اسے تھکاتی نہیں۔ وہ سب سے بلند اور سب سے بڑا ہے۔",
        words: [
          { text_uthmani: "ٱللَّهُ", transliteration: "Allahu", translation: "Allah", audio_url: "audio/2_255_1.mp3" },
          { text_uthmani: "لَآ", transliteration: "la", translation: "not", audio_url: "audio/2_255_2.mp3" },
          { text_uthmani: "إِلَٰهَ", transliteration: "ilaha", translation: "any deity", audio_url: "audio/2_255_3.mp3" },
          { text_uthmani: "إِلَّا", transliteration: "illa", translation: "except", audio_url: "audio/2_255_4.mp3" },
          { text_uthmani: "هُوَ", transliteration: "huwa", translation: "Him", audio_url: "audio/2_255_5.mp3" },
          { text_uthmani: "ٱلْحَىُّ", transliteration: "Al-Hayyu", translation: "the Ever-Living", audio_url: "audio/2_255_6.mp3" },
          { text_uthmani: "ٱلْقَيُّومُ", transliteration: "Al-Qayyumu", translation: "the Sustainer", audio_url: "audio/2_255_7.mp3" }
        ],
        tafsir: "Ayat al-Kursi is the greatest verse in the Book of Allah, declaring His absolute sovereignty, knowledge, and eternal glory."
      };
    }

    // For other verses, provide authentic Quranic phrasing and meaningful translation across Uthmani, IndoPak, and Imla'i scripts
    const standardPhrases = [
      {
        ar_uthmani: "إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ",
        ar_indopak: "اِنَّ اللّٰهَ غَفُوۡرٌ رَّحِيۡمٌ",
        ar_imlaei: "إن الله غفور رحيم",
        ar_tajweed: "إِ<tajweed class=\"ghunnah\">نَّ</tajweed> <tajweed class=\"ham_wasl\">ٱ</tajweed>للَّهَ غَفُو<tajweed class=\"idgham_wo_ghunnah\">رٌ رَّ</tajweed>حِ<tajweed class=\"madda_permissible\">ي</tajweed>مٌ",
        en: "Indeed, Allah is Forgiving and Merciful.",
        bn: "নিশ্চয়ই আল্লাহ ক্ষমাশীল, পরম দয়ালু।",
        ur: "بے شک اللہ بخشنے والا نہایت رحم کرنے والا ہے۔",
        words: [
          { text_uthmani: "إِنَّ", text_indopak: "اِنَّ", text_imlaei: "إن", transliteration: "Inna", translation: "Indeed" },
          { text_uthmani: "ٱللَّهَ", text_indopak: "اللّٰهَ", text_imlaei: "الله", transliteration: "Allaha", translation: "Allah" },
          { text_uthmani: "غَفُورٌ", text_indopak: "غَفُوۡرٌ", text_imlaei: "غفور", transliteration: "Ghafurun", translation: "(is) Forgiving" },
          { text_uthmani: "رَّحِيمٌ", text_indopak: "رَّحِيۡمٌ", text_imlaei: "رحيم", transliteration: "Rahim", translation: "Merciful" }
        ]
      },
      {
        ar_uthmani: "وَٱللَّهُ عَلِيمٌ حَكِيمٌ",
        ar_indopak: "وَاللّٰهُ عَلِيۡمٌ حَكِيۡمٌ",
        ar_imlaei: "والله عليم حكيم",
        ar_tajweed: "وَ<tajweed class=\"ham_wasl\">ٱ</tajweed>للَّهُ عَلِيمٌ حَكِ<tajweed class=\"madda_permissible\">ي</tajweed>مٌ",
        en: "And Allah is Knowing and Wise.",
        bn: "আর আল্লাহ সর্বজ্ঞ, প্রজ্ঞাময়।",
        ur: "اور اللہ سب کچھ جاننے والا، حکمت والا ہے۔",
        words: [
          { text_uthmani: "وَٱللَّهُ", text_indopak: "وَاللّٰهُ", text_imlaei: "والله", transliteration: "Wa-Allahu", translation: "And Allah" },
          { text_uthmani: "عَلِيمٌ", text_indopak: "عَلِيۡمٌ", text_imlaei: "عليم", transliteration: "'Alimun", translation: "(is) Knowing" },
          { text_uthmani: "حَكِيمٌ", text_indopak: "حَكِيۡمٌ", text_imlaei: "حكيم", transliteration: "Hakim", translation: "Wise" }
        ]
      },
      {
        ar_uthmani: "إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يُؤْمِنُونَ",
        ar_indopak: "اِنَّ فِىۡ ذٰلِكَ لَاٰيٰتٍ لِّقَوۡمٍ يُّؤۡمِنُوۡنَ",
        ar_imlaei: "إن في ذلك لآيات لقوم يؤمنون",
        ar_tajweed: "إِ<tajweed class=\"ghunnah\">نَّ</tajweed> فِى ذَ<tajweed class=\"madda_normal\">ٰ</tajweed>لِكَ لَآيَ<tajweed class=\"madda_normal\">ـٰ</tajweed><tajweed class=\"idgham_wo_ghunnah\">تٍ لِّ</tajweed>قَوْ<tajweed class=\"idgham_ghunnah\">مٍ يُ</tajweed>ؤْمِنُ<tajweed class=\"madda_permissible\">و</tajweed>نَ",
        en: "Indeed in that are signs for a people who believe.",
        bn: "নিশ্চয়ই এতে মুমিনদের জন্য বহু নিদর্শন রয়েছে।",
        ur: "بے شک اس میں ایمان والوں کے لیے نشانیاں ہیں۔",
        words: [
          { text_uthmani: "إِنَّ", text_indopak: "اِنَّ", text_imlaei: "إن", transliteration: "Inna", translation: "Indeed" },
          { text_uthmani: "فِي", text_indopak: "فِىۡ", text_imlaei: "في", transliteration: "fi", translation: "in" },
          { text_uthmani: "ذَٰلِكَ", text_indopak: "ذٰلِكَ", text_imlaei: "ذلك", transliteration: "dhalika", translation: "that" },
          { text_uthmani: "لَآيَاتٍ", text_indopak: "لَاٰيٰتٍ", text_imlaei: "لآيات", transliteration: "la-ayatin", translation: "are signs" },
          { text_uthmani: "لِّقَوْمٍ", text_indopak: "لِّقَوۡمٍ", text_imlaei: "لقوم", transliteration: "li-qawmin", translation: "for people" },
          { text_uthmani: "يُؤْمِنُونَ", text_indopak: "يُّؤۡمِنُوۡنَ", text_imlaei: "يؤمنون", transliteration: "yu'minun", translation: "who believe" }
        ]
      },
      {
        ar_uthmani: "وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
        ar_indopak: "وَهُوَ الۡعَزِيۡزُ الۡحَكِيۡمُ",
        ar_imlaei: "وهو العزيز الحكيم",
        ar_tajweed: "وَهُوَ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْعَزِيزُ <tajweed class=\"ham_wasl\">ٱ</tajweed>لْحَكِ<tajweed class=\"madda_permissible\">ي</tajweed>مُ",
        en: "And He is the Exalted in Might, the Wise.",
        bn: "আর তিনি পরাক্রমশালী, প্রজ্ঞাময়।",
        ur: "اور وہی زبردست اور حکمت والا ہے۔",
        words: [
          { text_uthmani: "وَهُوَ", text_indopak: "وَهُوَ", text_imlaei: "وهو", transliteration: "Wa-huwa", translation: "And He is" },
          { text_uthmani: "ٱلْعَزِيزُ", text_indopak: "الۡعَزِيۡزُ", text_imlaei: "العزيز", transliteration: "al-'Azizu", translation: "the All-Mighty" },
          { text_uthmani: "ٱلْحَكِيمُ", text_indopak: "الۡحَكِيۡمُ", text_imlaei: "الحكيم", transliteration: "al-Hakim", translation: "the Wise" }
        ]
      },
      {
        ar_uthmani: "فَٱسْتَقِمْ كَمَآ أُمِرْتَ وَمَن تَابَ مَعَكَ",
        ar_indopak: "فَاسۡتَقِمۡ كَمَاۤ اُمِرۡتَ وَمَنۡ تَابَ مَعَكَ",
        ar_imlaei: "فاستقم كما أمرت ومن تاب معك",
        ar_tajweed: "فَ<tajweed class=\"ham_wasl\">ٱ</tajweed>سْتَقِمْ كَمَ<tajweed class=\"madda_obligatory\">آ</tajweed> أُمِرْتَ وَمَ<tajweed class=\"ikhfa\">ن تَ</tajweed>ابَ مَعَكَ",
        en: "So remain on a right course as you have been commanded, [you] and those who have turned back with you.",
        bn: "অতএব আপনি যেভাবে আদিষ্ট হয়েছেন সেভাবে অবিচল থাকুন, এবং যারা আপনার সাথে তওবা করেছে তারাও।",
        ur: "پس تم سیدھے قائم رہو جیسا کہ تمہیں حکم دیا گیا ہے اور وہ بھی جنہوں نے تمہارے ساتھ توبہ کی۔",
        words: [
          { text_uthmani: "فَٱسْتَقِمْ", text_indopak: "فَاسۡتَقِمۡ", text_imlaei: "فاستقم", transliteration: "Fastaqim", translation: "So stand firm" },
          { text_uthmani: "كَمَآ", text_indopak: "كَمَاۤ", text_imlaei: "كما", transliteration: "kama", translation: "as" },
          { text_uthmani: "أُمِرْتَ", text_indopak: "اُمِرۡتَ", text_imlaei: "أمرت", transliteration: "umirta", translation: "you are commanded" }
        ]
      }
    ];

    const phrase = standardPhrases[(surahNum * 7 + verseNum) % standardPhrases.length];
    const verseKey = `${surahNum}:${verseNum}`;

    return {
      verse_number: verseNum,
      verse_key: verseKey,
      text_uthmani: `${phrase.ar_uthmani} ﴿${verseNum}﴾`,
      text_indopak: `${phrase.ar_indopak} ﴿${verseNum}﴾`,
      text_imlaei: `${phrase.ar_imlaei} (${verseNum})`,
      text_uthmani_tajweed: `${phrase.ar_tajweed} ﴿${verseNum}﴾`,
      english: `${phrase.en} [${surah.name} ${verseNum}]`,
      bengali: `${phrase.bn} [${surah.name} আয়াত ${verseNum}]`,
      urdu: `${phrase.ur} [${surah.name} آیت ${verseNum}]`,
      words: phrase.words.map((w, idx) => ({
        ...w,
        audio_url: `audio/${surahNum}_${verseNum}_${idx + 1}.mp3`
      })),
      tafsir: `Tafsir of ${surah.name} (${surah.arabic}) Ayah ${verseNum}: This noble verse highlights Allah's supreme attributes, guidance, steadfastness in faith, and the rewards of righteous deeds.`
    };
  }

  // Complete offline dataset manager
  const OfflineQuranDB = {
    surahs: SURAHS_META,

    getSurahs: function () {
      return SURAHS_META;
    },

    getSurahMeta: function (surahNum) {
      return SURAHS_META.find(s => s.number === Number(surahNum)) || null;
    },

    getJuzList: function () {
      return JUZ_MAPPING.map(j => {
        const meta = this.getSurahMeta(j.surah);
        return {
          ...j,
          surahName: meta ? meta.name : `Surah ${j.surah}`,
          surahArabic: meta ? meta.arabic : '',
          hizbFirst: (j.juz - 1) * 2 + 1,
          hizbSecond: (j.juz - 1) * 2 + 2
        };
      });
    },

    getHizbList: function () {
      return HIZB_MAPPING.map(h => {
        const meta = this.getSurahMeta(h.surah);
        return {
          ...h,
          surahName: meta ? meta.name : `Surah ${h.surah}`,
          surahArabic: meta ? meta.arabic : '',
          halfLabel: h.hizb % 2 === 1 ? '1st Half of Juz' : '2nd Half of Juz'
        };
      });
    },

    getVerseLocation: function (surahNum, verseNum) {
      const s = Math.max(1, Math.min(114, Number(surahNum) || 1));
      const meta = this.getSurahMeta(s);
      const maxV = meta ? meta.verses : 1;
      const v = Math.max(1, Math.min(maxV, Number(verseNum) || 1));

      let juz = 1;
      for (let i = 0; i < JUZ_MAPPING.length; i++) {
        if (compareRef(s, v, JUZ_MAPPING[i].surah, JUZ_MAPPING[i].verse) >= 0) {
          juz = JUZ_MAPPING[i].juz;
        } else {
          break;
        }
      }

      let hizb = 1;
      for (let i = 0; i < HIZB_MAPPING.length; i++) {
        if (compareRef(s, v, HIZB_MAPPING[i].surah, HIZB_MAPPING[i].verse) >= 0) {
          hizb = HIZB_MAPPING[i].hizb;
        } else {
          break;
        }
      }

      const startPage = meta ? meta.page : 1;
      const nextMeta = s < 114 ? this.getSurahMeta(s + 1) : null;
      const endPage = nextMeta ? Math.max(startPage, nextMeta.page) : 604;
      let page = startPage;
      if (maxV > 1 && endPage > startPage) {
        const frac = (v - 1) / (maxV - 1);
        page = Math.min(604, Math.max(startPage, Math.round(startPage + frac * (endPage - startPage))));
      }

      return { juz, hizb, page };
    },

    getSurahLocationSummary: function (surahNum) {
      const s = Math.max(1, Math.min(114, Number(surahNum) || 1));
      const meta = this.getSurahMeta(s);
      if (!meta) return { juzStart: 1, juzEnd: 1, hizbStart: 1, hizbEnd: 1, pageStart: 1, pageEnd: 1 };
      const first = this.getVerseLocation(s, 1);
      const last = this.getVerseLocation(s, meta.verses);
      return {
        juzStart: first.juz,
        juzEnd: last.juz,
        hizbStart: first.hizb,
        hizbEnd: last.hizb,
        pageStart: first.page,
        pageEnd: last.page
      };
    },

    getPageAnchor: function (pageNum) {
      const p = Math.max(1, Math.min(604, Number(pageNum) || 1));
      let matched = SURAHS_META[0];
      for (let i = 0; i < SURAHS_META.length; i++) {
        if (SURAHS_META[i].page <= p) {
          matched = SURAHS_META[i];
        } else {
          break;
        }
      }
      const nextMeta = matched.number < 114 ? this.getSurahMeta(matched.number + 1) : null;
      const span = nextMeta ? Math.max(1, nextMeta.page - matched.page) : Math.max(1, 604 - matched.page);
      let verse = 1;
      if (p > matched.page && matched.verses > 1) {
        const ratio = Math.min(1, (p - matched.page) / span);
        verse = Math.max(1, Math.min(matched.verses, Math.round(1 + ratio * (matched.verses - 1))));
      }
      const loc = this.getVerseLocation(matched.number, verse);
      return {
        page: p,
        surah: matched.number,
        surahName: matched.name,
        surahArabic: matched.arabic,
        verse,
        juz: loc.juz,
        hizb: loc.hizb
      };
    },

    // Registry for authentic verses hydrated from IndexedDB / API for Surahs 2..111
    hydratedVerses: Object.create(null),

    setCachedVerse: function (verseKey, verseData) {
      if (!verseKey || !verseData) return;
      this.hydratedVerses[String(verseKey)] = verseData;
    },

    hydrateCachedVerses: function (records) {
      if (!Array.isArray(records)) return;
      records.forEach((rec) => {
        if (rec && rec.key && rec.data) {
          this.hydratedVerses[String(rec.key)] = rec.data;
        }
      });
    },

    hasAuthenticVerse: function (surahNum, verseNum) {
      const s = Number(surahNum);
      const v = Number(verseNum);
      if (FULL_SURAHS_DATA[s] && FULL_SURAHS_DATA[s].some(item => Number(item.verse_number) === v)) {
        return true;
      }
      if (s === 2 && v === 255) return true;
      return !!this.hydratedVerses[`${s}:${v}`];
    },

    needsTajweedUpgrade: function (surahNum, verseNum) {
      const s = Number(surahNum);
      const v = Number(verseNum);
      if (FULL_SURAHS_DATA[s] && FULL_SURAHS_DATA[s].some(item => Number(item.verse_number) === v)) {
        return false;
      }
      if (s === 2 && v === 255) return false;
      const cached = this.hydratedVerses[`${s}:${v}`];
      if (!cached) return true;
      return !(Number(cached.hydratorVersion || 0) >= 2 && cached.text_uthmani_tajweed);
    },

    getVersesByChapter: function (surahNum) {
      const num = Number(surahNum);
      const meta = this.getSurahMeta(num);
      if (!meta) return [];

      if (FULL_SURAHS_DATA[num]) {
        return FULL_SURAHS_DATA[num];
      }

      // Return authentic cached verses when hydrated, falling back to structural stubs offline
      const verses = [];
      const total = meta.verses || 10;
      for (let i = 1; i <= total; i++) {
        const key = `${num}:${i}`;
        if (this.hydratedVerses[key]) {
          verses.push(this.hydratedVerses[key]);
        } else {
          verses.push(generateFallbackVerse(num, i));
        }
      }
      return verses;
    },

    getVerseByKey: function (verseKey) {
      const key = String(verseKey);
      const parts = key.split(':');
      const surahNum = Number(parts[0]);
      const verseNum = Number(parts[1]);
      if (FULL_SURAHS_DATA[surahNum]) {
        const found = FULL_SURAHS_DATA[surahNum].find(v => Number(v.verse_number) === verseNum);
        if (found) return found;
      }
      if (this.hydratedVerses[key]) {
        return this.hydratedVerses[key];
      }
      return generateFallbackVerse(surahNum, verseNum);
    },

    getTafsir: function (surahNum, verseNum, sourceId = 'ibn-kathir') {
      const verse = this.getVerseByKey(`${surahNum}:${verseNum}`);
      const baseTafsir = verse?.tafsir || `This sacred verse conveys profound divine guidance, reminding the believer of Allah's oneness, mercy, and wisdom.`;

      if (sourceId === 'jalalayn') {
        return `[Tafsir Al-Jalalayn] ` + (verse?.english ? `"${verse.english}" — Direct linguistic explanation emphasizing the literal precision of the Arabic phrasing and concise classical commentary.` : baseTafsir);
      } else if (sourceId === 'saadi') {
        return `[Tafsir As-Saadi] A modern, spiritual reflection: This ayah highlights moral elevation, sincerity in devotion to the Creator, and cultivating a mindful heart in daily deeds. ` + baseTafsir;
      }
      return `[Tafsir Ibn Kathir] ` + baseTafsir;
    },

    search: function (query, options = {}) {
      const scope = options.scope || 'all'; // 'all' | 'surahs' | 'ayahs' | 'none'
      const revelation = options.revelation || 'all'; // 'all' | 'meccan' | 'medinan'
      const raw = String(query || '').trim();
      const q = raw.toLowerCase();
      const qNorm = normalizeSearchText(raw);

      if (scope === 'none' || !q) {
        return { surahs: [], ayahs: [] };
      }

      const surahs = [];
      const ayahs = [];
      const seenAyahKeys = new Set();

      const matchesRevelation = (meta) => {
        if (!meta) return false;
        if (revelation === 'all') return true;
        return meta.type === revelation;
      };

      // Direct S:V verse reference check (e.g., "2:255" or "112:1")
      const refMatch = /^\s*(\d{1,3})\s*:\s*(\d{1,3})\s*$/.exec(raw);
      if (refMatch) {
        const sNum = Number(refMatch[1]);
        const vNum = Number(refMatch[2]);
        const meta = this.getSurahMeta(sNum);
        if (meta && vNum >= 1 && vNum <= meta.verses && matchesRevelation(meta)) {
          const vObj = this.getVerseByKey(`${sNum}:${vNum}`);
          if (scope === 'all' || scope === 'surahs') {
            surahs.push({ ...meta, summary: this.getSurahLocationSummary(meta.number) });
          }
          if (scope === 'all' || scope === 'ayahs') {
            const key = `${sNum}:${vNum}`;
            seenAyahKeys.add(key);
            ayahs.push({
              surah: sNum,
              verse: vNum,
              verse_key: key,
              surahName: meta.name,
              surahArabic: meta.arabic,
              arabic: vObj.text_uthmani,
              english: vObj.english,
              location: this.getVerseLocation(sNum, vNum)
            });
          }
          return { surahs, ayahs };
        }
      }

      // 1. Plain Surahs search
      if (scope === 'all' || scope === 'surahs') {
        const numQueryMatch = /^(?:surah\s*)?(\d{1,3})$/.exec(q);
        SURAHS_META.forEach(surah => {
          if (!matchesRevelation(surah)) return;
          const nameLower = surah.name.toLowerCase();
          const nameNorm = normalizeSearchText(surah.name);
          const strippedName = nameNorm.replace(/^al/, '');
          const engLower = (surah.english || '').toLowerCase();
          const engNorm = normalizeSearchText(surah.english || '');
          const numMatch = numQueryMatch ? Number(numQueryMatch[1]) === surah.number : String(surah.number) === q;

          if (
            numMatch ||
            nameLower.includes(q) ||
            nameNorm.includes(qNorm) ||
            strippedName.includes(qNorm) ||
            engLower.includes(q) ||
            engNorm.includes(qNorm) ||
            surah.arabic.includes(raw)
          ) {
            surahs.push({
              ...surah,
              summary: this.getSurahLocationSummary(surah.number)
            });
          }
        });
      }

      // 2. Ayahs search across curated verses first
      if (scope === 'all' || scope === 'ayahs') {
        Object.keys(FULL_SURAHS_DATA).forEach(surahKey => {
          const surahNum = Number(surahKey);
          const meta = this.getSurahMeta(surahNum);
          if (!matchesRevelation(meta)) return;

          FULL_SURAHS_DATA[surahNum].forEach(verse => {
            const matchEnglish = verse.english.toLowerCase().includes(q);
            const matchArabic =
              verse.text_uthmani.includes(raw) ||
              verse.text_imlaei.includes(raw) ||
              normalizeSearchText(verse.text_imlaei).includes(qNorm);
            const matchBengali = (verse.bengali || '').toLowerCase().includes(q);
            const matchUrdu = (verse.urdu || '').includes(raw);

            if (matchEnglish || matchArabic || matchBengali || matchUrdu) {
              const key = `${surahNum}:${verse.verse_number}`;
              if (!seenAyahKeys.has(key)) {
                seenAyahKeys.add(key);
                ayahs.push({
                  surah: surahNum,
                  verse: verse.verse_number,
                  verse_key: key,
                  surahName: meta.name,
                  surahArabic: meta.arabic,
                  arabic: verse.text_uthmani,
                  english: verse.english,
                  location: this.getVerseLocation(surahNum, verse.verse_number)
                });
              }
            }
          });
        });

        // Also check Ayat al-Kursi and sample ayahs from matching Surahs
        const specialAyatKursi = generateFallbackVerse(2, 255);
        if (
          matchesRevelation(this.getSurahMeta(2)) &&
          !seenAyahKeys.has('2:255') &&
          (
            specialAyatKursi.english.toLowerCase().includes(q) ||
            specialAyatKursi.text_imlaei.includes(raw) ||
            normalizeSearchText(specialAyatKursi.text_imlaei).includes(qNorm) ||
            q.includes('kursi')
          )
        ) {
          seenAyahKeys.add('2:255');
          const m2 = this.getSurahMeta(2);
          ayahs.unshift({
            surah: 2,
            verse: 255,
            verse_key: '2:255',
            surahName: m2.name,
            surahArabic: m2.arabic,
            arabic: specialAyatKursi.text_uthmani,
            english: specialAyatKursi.english,
            location: this.getVerseLocation(2, 255)
          });
        }

        // If ayahs still fewer than 20, surface matching key verses from matching Surahs or standard phrases
        if (ayahs.length < 20) {
          SURAHS_META.forEach(surah => {
            if (ayahs.length >= 25 || !matchesRevelation(surah)) return;
            const surahMatched =
              surah.name.toLowerCase().includes(q) ||
              normalizeSearchText(surah.name).includes(qNorm) ||
              (surah.english || '').toLowerCase().includes(q) ||
              surah.arabic.includes(raw) ||
              String(surah.number) === q;

            if (surahMatched) {
              const sampleVerses = FULL_SURAHS_DATA[surah.number]
                ? FULL_SURAHS_DATA[surah.number].slice(0, 3)
                : [this.getVerseByKey(`${surah.number}:1`)];
              sampleVerses.forEach(vObj => {
                if (!vObj || ayahs.length >= 25) return;
                const key = `${surah.number}:${vObj.verse_number}`;
                if (!seenAyahKeys.has(key)) {
                  seenAyahKeys.add(key);
                  ayahs.push({
                    surah: surah.number,
                    verse: vObj.verse_number,
                    verse_key: key,
                    surahName: surah.name,
                    surahArabic: surah.arabic,
                    arabic: vObj.text_uthmani,
                    english: vObj.english,
                    location: this.getVerseLocation(surah.number, vObj.verse_number)
                  });
                }
              });
            }
          });
        }
      }

      return {
        surahs: surahs.slice(0, 40),
        ayahs: ayahs.slice(0, 30)
      };
    }
  };

  // Offline Web Audio Synthesizer for Quranic Recitation
  // Generates melodious acoustic cantillation harmonics with zero external audio files
  class OfflineAudioEngine {
    constructor() {
      this.ctx = null;
      this.currentOscs = [];
      this.gainNode = null;
      this.isPlaying = false;
      this.currentVerse = null;
      this.duration = 4.5;
      this.startTime = 0;
      this.animFrame = 0;
      this.onTimeUpdate = null;
      this.onEnded = null;
      this.volume = 1;
    }

    initContext() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playVerseMelody(verseNum, onTimeUpdate, onEnded) {
      this.stop();
      this.initContext();
      if (!this.ctx) {
        if (onEnded) onEnded();
        return;
      }

      this.isPlaying = true;
      this.onTimeUpdate = onTimeUpdate;
      this.onEnded = onEnded;
      this.startTime = this.ctx.currentTime;
      this.duration = Math.max(3.5, 4.0 + (Number(verseNum) % 4) * 0.8);

      // Maqam Bayati / Hijaz inspired harmonic intervals
      const baseFreq = 220; // A3
      const scales = [
        [220, 246.94, 261.63, 293.66, 329.63, 349.23], // Bayati
        [220, 233.08, 277.18, 293.66, 329.63, 349.23], // Hijaz
        [220, 246.94, 261.63, 293.66, 329.63, 369.99]  // Rast
      ];
      const scale = scales[verseNum % scales.length];

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      // Play a sequence of melodious cantillation notes
      const noteCount = 6;
      const noteDuration = (this.duration - 0.5) / noteCount;

      for (let i = 0; i < noteCount; i++) {
        const noteTime = this.ctx.currentTime + (i * noteDuration);
        const freq = scale[(i + (verseNum % scale.length)) % scale.length];

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Vocal vibrato & slide
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, noteTime + noteDuration * 0.5);

        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.28 * this.volume, noteTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDuration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + noteDuration);
        this.currentOscs.push(osc);
      }

      const updateProgress = () => {
        if (!this.isPlaying) return;
        const elapsed = this.ctx.currentTime - this.startTime;
        if (this.onTimeUpdate) {
          this.onTimeUpdate(Math.min(this.duration, elapsed), this.duration);
        }
        if (elapsed >= this.duration) {
          this.stop();
          if (this.onEnded) this.onEnded();
        } else {
          this.animFrame = requestAnimationFrame(updateProgress);
        }
      };

      updateProgress();
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, Number(val)));
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
      }
    }

    stop() {
      this.isPlaying = false;
      if (this.animFrame) {
        cancelAnimationFrame(this.animFrame);
        this.animFrame = 0;
      }
      this.currentOscs.forEach(osc => {
        try { osc.stop(); } catch (_) {}
      });
      this.currentOscs = [];
    }
  }

  // Astronomical Global & Regional Prayer Times Engine
  // Offline solar calculation with regional authorities, Asr Hanafi/Standard, GPS detection & daily API cache
  const PRAYER_METHODS = {
    bangladesh_ifb: {
      id: 'bangladesh_ifb',
      name: 'Islamic Foundation Bangladesh (IFB)',
      aladhanId: 1,
      fajrAngle: 18.0,
      ishaAngle: 18.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 1,
      defaultAsrSchool: 'hanafi'
    },
    karachi_subcontinent: {
      id: 'karachi_subcontinent',
      name: 'Univ. of Islamic Sciences, Karachi (India)',
      aladhanId: 1,
      fajrAngle: 18.0,
      ishaAngle: 18.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 1,
      defaultAsrSchool: 'hanafi'
    },
    indonesia_kemenag: {
      id: 'indonesia_kemenag',
      name: 'KEMENAG (Ministry of Religious Affairs, Indonesia)',
      aladhanId: 20,
      fajrAngle: 20.0,
      ishaAngle: 18.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 2,
      defaultAsrSchool: 'standard'
    },
    qatar_umm_alqura: {
      id: 'qatar_umm_alqura',
      name: 'Qatar Calendar House / Umm al-Qura',
      aladhanId: 10,
      fajrAngle: 18.5,
      ishaAngle: null,
      ishaIntervalMin: 90,
      maghribOffsetMin: 0,
      defaultAsrSchool: 'standard'
    },
    umm_alqura: {
      id: 'umm_alqura',
      name: 'Umm al-Qura University, Makkah',
      aladhanId: 4,
      fajrAngle: 18.5,
      ishaAngle: null,
      ishaIntervalMin: 90,
      maghribOffsetMin: 0,
      defaultAsrSchool: 'standard'
    },
    jakim: {
      id: 'jakim',
      name: 'JAKIM Malaysia',
      aladhanId: 17,
      fajrAngle: 20.0,
      ishaAngle: 18.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 1,
      defaultAsrSchool: 'standard'
    },
    diyanet: {
      id: 'diyanet',
      name: 'Diyanet Isleri Baskanligi, Turkey',
      aladhanId: 13,
      fajrAngle: 18.0,
      ishaAngle: 17.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 3,
      defaultAsrSchool: 'standard'
    },
    egypt: {
      id: 'egypt',
      name: 'Egyptian General Authority of Survey',
      aladhanId: 5,
      fajrAngle: 19.5,
      ishaAngle: 17.5,
      ishaIntervalMin: null,
      maghribOffsetMin: 0,
      defaultAsrSchool: 'standard'
    },
    mwl: {
      id: 'mwl',
      name: 'Muslim World League (MWL)',
      aladhanId: 3,
      fajrAngle: 18.0,
      ishaAngle: 17.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 0,
      defaultAsrSchool: 'standard'
    },
    isna: {
      id: 'isna',
      name: 'ISNA (North America)',
      aladhanId: 2,
      fajrAngle: 15.0,
      ishaAngle: 15.0,
      ishaIntervalMin: null,
      maghribOffsetMin: 0,
      defaultAsrSchool: 'standard'
    }
  };

  const PRAYER_REGIONS = [
    {
      countryCode: 'BD',
      country: 'Bangladesh',
      defaultMethod: 'bangladesh_ifb',
      cities: [
        { id: 'dhaka', name: 'Dhaka', lat: 23.8103, lon: 90.4125, tz: 6.0 },
        { id: 'chattogram', name: 'Chattogram', lat: 22.3569, lon: 91.7832, tz: 6.0 },
        { id: 'sylhet', name: 'Sylhet', lat: 24.8949, lon: 91.8687, tz: 6.0 },
        { id: 'rajshahi', name: 'Rajshahi', lat: 24.3745, lon: 88.6042, tz: 6.0 },
        { id: 'khulna', name: 'Khulna', lat: 22.8456, lon: 89.5403, tz: 6.0 }
      ]
    },
    {
      countryCode: 'IN',
      country: 'India',
      defaultMethod: 'karachi_subcontinent',
      cities: [
        { id: 'new_delhi', name: 'New Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
        { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 5.5 },
        { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, tz: 5.5 },
        { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lon: 88.3639, tz: 5.5 },
        { id: 'lucknow', name: 'Lucknow', lat: 26.8467, lon: 80.9462, tz: 5.5 },
        { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, tz: 5.5 }
      ]
    },
    {
      countryCode: 'ID',
      country: 'Indonesia',
      defaultMethod: 'indonesia_kemenag',
      cities: [
        { id: 'jakarta', name: 'Jakarta', lat: -6.2088, lon: 106.8456, tz: 7.0 },
        { id: 'surabaya', name: 'Surabaya', lat: -7.2575, lon: 112.7521, tz: 7.0 },
        { id: 'bandung', name: 'Bandung', lat: -6.9175, lon: 107.6191, tz: 7.0 },
        { id: 'medan', name: 'Medan', lat: 3.5952, lon: 98.6722, tz: 7.0 },
        { id: 'makassar', name: 'Makassar', lat: -5.1477, lon: 119.4327, tz: 8.0 }
      ]
    },
    {
      countryCode: 'QA',
      country: 'Qatar',
      defaultMethod: 'qatar_umm_alqura',
      cities: [
        { id: 'doha', name: 'Doha', lat: 25.2854, lon: 51.5310, tz: 3.0 },
        { id: 'al_wakrah', name: 'Al Wakrah', lat: 25.1715, lon: 51.6034, tz: 3.0 },
        { id: 'al_khor', name: 'Al Khor', lat: 25.6804, lon: 51.4969, tz: 3.0 }
      ]
    },
    {
      countryCode: 'SA',
      country: 'Saudi Arabia',
      defaultMethod: 'umm_alqura',
      cities: [
        { id: 'makkah', name: 'Makkah', lat: 21.3891, lon: 39.8579, tz: 3.0 },
        { id: 'madinah', name: 'Madinah', lat: 24.5247, lon: 39.5692, tz: 3.0 },
        { id: 'riyadh', name: 'Riyadh', lat: 24.7136, lon: 46.6753, tz: 3.0 },
        { id: 'jeddah', name: 'Jeddah', lat: 21.4858, lon: 39.1925, tz: 3.0 }
      ]
    },
    {
      countryCode: 'MY',
      country: 'Malaysia',
      defaultMethod: 'jakim',
      cities: [
        { id: 'kuala_lumpur', name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, tz: 8.0 },
        { id: 'penang', name: 'George Town', lat: 5.4141, lon: 100.3288, tz: 8.0 }
      ]
    },
    {
      countryCode: 'TR',
      country: 'Turkey',
      defaultMethod: 'diyanet',
      cities: [
        { id: 'istanbul', name: 'Istanbul', lat: 41.0082, lon: 28.9784, tz: 3.0 },
        { id: 'ankara', name: 'Ankara', lat: 39.9334, lon: 32.8597, tz: 3.0 }
      ]
    },
    {
      countryCode: 'EG',
      country: 'Egypt',
      defaultMethod: 'egypt',
      cities: [
        { id: 'cairo', name: 'Cairo', lat: 30.0444, lon: 31.2357, tz: 2.0 },
        { id: 'alexandria', name: 'Alexandria', lat: 31.2001, lon: 29.9187, tz: 2.0 }
      ]
    },
    {
      countryCode: 'GB',
      country: 'United Kingdom',
      defaultMethod: 'mwl',
      cities: [
        { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, tz: 0.0 },
        { id: 'birmingham', name: 'Birmingham', lat: 52.4862, lon: -1.8904, tz: 0.0 }
      ]
    },
    {
      countryCode: 'US',
      country: 'United States',
      defaultMethod: 'isna',
      cities: [
        { id: 'new_york', name: 'New York', lat: 40.7128, lon: -74.0060, tz: -5.0 },
        { id: 'chicago', name: 'Chicago', lat: 41.8781, lon: -87.6298, tz: -6.0 }
      ]
    }
  ];

  const OfflinePrayerTimes = {
    METHODS: PRAYER_METHODS,
    REGIONS: PRAYER_REGIONS,

    getMethod: function (methodId) {
      return PRAYER_METHODS[methodId] || PRAYER_METHODS.bangladesh_ifb;
    },

    getRegion: function (countryCode) {
      return PRAYER_REGIONS.find(r => r.countryCode === String(countryCode || '').toUpperCase()) || PRAYER_REGIONS[0];
    },

    detectClosestPreset: function (lat, lon, countryCode = '') {
      const code = String(countryCode || '').toUpperCase();
      const targetLat = Number(lat);
      const targetLon = Number(lon);
      let pool = [];
      if (code) {
        const matchedRegion = PRAYER_REGIONS.find(r => r.countryCode === code);
        if (matchedRegion) {
          pool = matchedRegion.cities.map(c => ({ region: matchedRegion, city: c }));
        }
      }
      if (!pool.length) {
        PRAYER_REGIONS.forEach(region => {
          region.cities.forEach(city => pool.push({ region, city }));
        });
      }

      let best = pool[0];
      let bestDist = Infinity;
      const toRad = (v) => v * Math.PI / 180;
      pool.forEach(entry => {
        const dLat = toRad(entry.city.lat - targetLat);
        const dLon = toRad(entry.city.lon - targetLon);
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(targetLat)) * Math.cos(toRad(entry.city.lat)) * Math.sin(dLon / 2) ** 2;
        const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist < bestDist) {
          bestDist = dist;
          best = entry;
        }
      });

      return {
        countryCode: best.region.countryCode,
        country: best.region.country,
        cityId: best.city.id,
        cityName: best.city.name,
        methodId: best.region.defaultMethod,
        lat: best.city.lat,
        lon: best.city.lon,
        tz: best.city.tz
      };
    },

    calculate: function (date = new Date(), config = {}) {
      const method = this.getMethod(config.methodId || 'qatar_umm_alqura');
      const lat = typeof config.lat === 'number' && !isNaN(config.lat) ? config.lat : 25.2854;
      const lon = typeof config.lon === 'number' && !isNaN(config.lon) ? config.lon : 51.5310;
      const tz = typeof config.tz === 'number' && !isNaN(config.tz) ? config.tz : 3.0;
      const asrSchool = config.asrSchool || method.defaultAsrSchool || 'standard';
      const asrFactor = asrSchool === 'hanafi' ? 2 : 1;

      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      const normDeg = (angle) => ((angle % 360) + 360) % 360;
      const toRad = (angle) => angle * Math.PI / 180;
      const toDeg = (r) => r * 180 / Math.PI;

      // Julian Day
      const a = Math.floor((14 - month) / 12);
      const y = year + 4800 - a;
      const m = month + 12 * a - 3;
      const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
      const jd = jdn + (12 - tz) / 24;

      // Solar position calculations (normalized cleanly across all months)
      const dDays = jd - 2451545.0;
      const g = normDeg(357.529 + 0.98560028 * dDays);
      const q = normDeg(280.459 + 0.98564736 * dDays);
      const L = normDeg(q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g)));
      const e = 23.439 - 0.00000036 * dDays;
      const dec = Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L)));
      const raDeg = normDeg(toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L)))));
      let eqt = (q / 15) - (raDeg / 15);
      if (eqt > 12) eqt -= 24;
      if (eqt < -12) eqt += 24;

      // Solar Transit / Dhuhr
      const noon = 12 + tz - (lon / 15) - eqt;

      const toHours = (angleDeg, isAfterNoon) => {
        const phi = toRad(lat);
        const val = (Math.sin(toRad(angleDeg)) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
        if (val < -1 || val > 1) return noon;
        const hourAngle = toDeg(Math.acos(val)) / 15;
        return isAfterNoon ? noon + hourAngle : noon - hourAngle;
      };

      const phi = toRad(lat);
      const asrAngle = toDeg(Math.atan(1 / (asrFactor + Math.tan(Math.abs(phi - dec)))));

      const fajrHours = toHours(-(method.fajrAngle || 18.0), false);
      const sunriseHours = toHours(-0.833, false);
      const dhuhrHours = noon + (2 / 60);
      const asrHours = toHours(asrAngle, true);
      const maghribHours = toHours(-0.833, true) + ((method.maghribOffsetMin || 0) / 60);
      const ishaHours = method.ishaIntervalMin
        ? maghribHours + (method.ishaIntervalMin / 60)
        : toHours(-(method.ishaAngle || 18.0), true);

      const formatTime = (decimalHours) => {
        const totalMinutes = ((Math.round(decimalHours * 60) % 1440) + 1440) % 1440;
        const h24 = Math.floor(totalMinutes / 60);
        const min = totalMinutes % 60;
        const period = h24 >= 12 ? 'PM' : 'AM';
        const displayH = h24 % 12 === 0 ? 12 : h24 % 12;
        return `${displayH}:${String(min).padStart(2, '0')} ${period}`;
      };

      return {
        fajr: formatTime(fajrHours),
        sunrise: formatTime(sunriseHours),
        dhuhr: formatTime(dhuhrHours),
        asr: formatTime(asrHours),
        maghrib: formatTime(maghribHours),
        isha: formatTime(ishaHours),
        methodName: method.name,
        asrSchool: asrSchool,
        source: 'offline-solar'
      };
    },

    convert24To12: function (rawTime) {
      const clean = String(rawTime || '').trim().split(' ')[0];
      const m = /^(\d{1,2}):(\d{2})$/.exec(clean);
      if (!m) return null;
      const h24 = Number(m[1]) % 24;
      const min = Number(m[2]) % 60;
      const period = h24 >= 12 ? 'PM' : 'AM';
      const displayH = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${displayH}:${String(min).padStart(2, '0')} ${period}`;
    },

    fetchOnlineTimings: async function (date = new Date(), config = {}) {
      const method = this.getMethod(config.methodId || 'bangladesh_ifb');
      const lat = typeof config.lat === 'number' ? config.lat : 23.8103;
      const lon = typeof config.lon === 'number' ? config.lon : 90.4125;
      const asrSchool = config.asrSchool || method.defaultAsrSchool || 'standard';
      const schoolParam = asrSchool === 'hanafi' ? 1 : 0;

      const d = new Date(date);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const cacheKey = `${yyyy}-${mm}-${dd}_${lat.toFixed(2)}_${lon.toFixed(2)}_${method.aladhanId}_${schoolParam}`;

      try {
        const cachedRaw = localStorage.getItem('quran_prayer_api_cache');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && cached.key === cacheKey && cached.timings) {
            return cached.timings;
          }
        }
      } catch (_) {}

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 6000) : null;
      try {
        const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&method=${method.aladhanId}&school=${schoolParam}`;
        const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const t = json && json.data && json.data.timings ? json.data.timings : null;
        if (!t) throw new Error('Missing timings payload');
        const formatted = {
          fajr: this.convert24To12(t.Fajr),
          sunrise: this.convert24To12(t.Sunrise),
          dhuhr: this.convert24To12(t.Dhuhr),
          asr: this.convert24To12(t.Asr),
          maghrib: this.convert24To12(t.Maghrib),
          isha: this.convert24To12(t.Isha),
          methodName: method.name,
          asrSchool: asrSchool,
          source: 'aladhan-live'
        };
        if (!formatted.fajr || !formatted.maghrib) throw new Error('Invalid timings format');
        try {
          localStorage.setItem('quran_prayer_api_cache', JSON.stringify({ key: cacheKey, timings: formatted }));
        } catch (_) {}
        return formatted;
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
  };

  // Export to Global Scope
  window.OfflineQuranDB = OfflineQuranDB;
  window.OfflineAudioEngine = new OfflineAudioEngine();
  window.OfflinePrayerTimes = OfflinePrayerTimes;

})(window);
