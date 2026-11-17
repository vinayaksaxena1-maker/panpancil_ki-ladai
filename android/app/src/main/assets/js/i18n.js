/**
 * Pen Fight: Desk Wars — 100% Offline 2-School-Medium + Sub-Language System
 * 
 * School Mediums:
 *   1. 'english_school' (English Medium School):
 *      - Default language: 'english' (100% original nostalgic school UI untouched)
 *      - Sub-language toggle: 'english' (📖 ENG) ⇄ 'hinglish' (💬 HINGLISH)
 *   2. 'hindi_school' (Hindi Medium School — for everyday casual players):
 *      - Default language: 'hinglish' (super easy everyday Hinglish labels)
 *      - Sub-language toggle: 'hinglish' (💬 HINGLISH) ⇄ 'hindi' (🇮🇳 हिंदी)
 * 
 * Invariants: Zero external dependencies. Complete client-side offline persistence.
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'penfight_save_v2';

  const I18N_PACK = {
    english: {
      admission: {
        period_pill: "PERIOD: RECESS • BENCH #4",
        subheading_championship: "Classroom Championship",
        subheading_edition: "1998 Edition",
        index_header: "★ CLASSMATE NOTEBOOK INDEX ★",
        page_label: "PAGE:",
        date_label: "DATE:",
        title: "STUDENT BATTLE PASS",
        roll_label: "ROLL:",
        class_label: "CLASS:",
        medium_label: "🏫 MEDIUM / माध्यम:",
        medium_english: "🏫 English Medium School",
        medium_hindi: "🏫 Hindi Medium School",
        name_label: "✎ KHILADI KA NAAM (ENTER NAME):",
        name_placeholder: "Enter Name",
        name_tap_hint: "Tap to enter your name",
        school_label: "🏫 SCHOOL KA NAAM (OPTIONAL):",
        school_placeholder: "SARASWATI VIDYALAYA (Default)",
        house_label: "HOUSE:",
        rank_label: "RANK:",
        weapon_label: "PRIMARY WEAPON:",
        speed_label: "Speed / Velocity",
        grip_label: "Table Grip",
        locked_label: "LOCKED:",
        school_footer_suffix: "BENCH #4 OFFICIAL",
        teacher_sign_label: "Teacher's Sign:",
        enter_classroom: "ENTER CLASSROOM",
        rule_footer: "Rule #1: Desk se neeche gira pen out maana jayega!",
        avatar_khiladi: "KHILADI",
        avatar_attested: "● ATTESTED"
      },
      menu: {
        period_badge: "RECESS BREAK • BENCH #4",
        medium_toggle: "📖 ENG",
        index_header: "★ CLASSMATE NOTEBOOK INDEX ★",
        page_label: "PAGE NO:",
        date_label: "DATE:",
        title: "STUDENT BATTLE PASS",
        roll_label: "ROLL NO:",
        class_label: "CLASS:",
        avatar_khiladi: "KHILADI",
        toss_play_title: "TOSS & PLAY",
        toss_play_sub: "1-Finger Flick • Recess Desk Duel",
        story_title: "Story Mode / Levels",
        story_sub: "Class 7th to 10th",
        story_btn: "FIGHT ➔",
        pass_play_title: "Pass & Play / 2 Players",
        pass_play_sub: "1 Device • Two Friends",
        pass_play_btn: "TOSS ⇄",
        compass_title: "Compass Box / My Pens",
        compass_sub: "6 Classic Ballpens",
        compass_btn: "OPEN 🧰",
        trophy_title: "Trophy Rack / Records",
        trophy_sub: "Career Dossier & Stats",
        trophy_btn: "VIEW 🎖️"
      },
      setup: {
        hub_btn: "HUB",
        tab_single: "Single Player (VS CPU)",
        tab_pass: "Pass & Play (2-Player)",
        diff_title: "SELECT DIFFICULTY",
        diff_easy: "1st Bencher (Easy)",
        diff_normal: "Desk Regular (Normal)",
        diff_hard: "Monitor (Hard 🔥)",
        bench_rule: "Bench Rule: White chalk boundary • Drop from teak bench = instant defeat!",
        start_duel_1p: "START DUEL",
        start_duel_2p: "START 2-PLAYER DUEL ▶"
      },
      hud: {
        you_tag: "YOU",
        bot_tag: "BOT",
        p2_tag: "P2",
        your_turn: "YOUR TURN 🎯",
        rival_turn: "RIVAL TURN ⏳",
        p2_turn: "PLAYER 2 TURN 🎯",
        round_label: "ROUND {cur} / {max}",
        first_shot_hint: "👆 Pull your pen back & release to shoot!",
        knockout_title: "KNOCKOUT! 💥",
        knockout_sub: "Player scored a point!",
        table_fall_title: "TABLE FALL! 💨",
        table_fall_sub: "Pen fell off the desk boundary!",
        double_fall_title: "DOUBLE TABLE FALL! 💥",
        double_fall_sub: "Both pens flew off! Round tied!",
        timeout_title: "RECESS TIMEOUT! ⏸️",
        timeout_sub: "Time ran out!",
        pause_round_summary: "ROUND {cur}/{max}"
      },
      pause: {
        whistle_frozen: "WHISTLE BLOWN • MATCH FROZEN",
        title: "RECESS TIMEOUT! ⏸️",
        period_badge: "PERIOD 4",
        teacher_title: "PT TIWARI SIR ON ROUND!",
        teacher_desc: "Staff room se nikal chuke hain! Board duster in hand. Arena is safe & frozen under desk bench.",
        medium_label: "LANGUAGE / BHAASHA:",
        sfx_label: "Desk Sound Effects (SFX)",
        whistle_label: "Teacher Whistle Alert",
        diff_label: "BOT AI DIFFICULTY:",
        resume_btn: "RESUME DUEL ⏱️",
        restart_btn: "RESTART ROUND 🔄",
        quit_btn: "QUIT TO CLASSROOM HUB 🚪",
        conduct_note: "\"Code of Conduct: Flick velocity release ke dauran pause dabaya toh Table Foul maana jayega!\""
      },
      result: {
        victory_title: "★ PASSED WITH DISTINCTION (A+) ★",
        defeat_title: "DEFEAT! OUT OF BOUNDS!",
        next_classmate: "NEXT CLASSMATE",
        rematch_1p: "REMATCH (RETRY DUEL) 🔄",
        rematch_2p: "REMATCH (P1 vs P2) ⚔️",
        rematch_defeat: "REMATCH! RECLAIM BENCH ⚔️",
        return_hub: "RETURN TO CLASSROOM HUB 🚪"
      },
      settings: {
        medium_title: "School Medium & Language",
        audio_title: "Audio & Recess SFX",
        audio_badge: "1998 SOUND"
      }
    },

    hinglish: {
      admission: {
        period_pill: "PERIOD: RECESS • BENCH #4",
        subheading_championship: "Classroom Championship",
        subheading_edition: "1998 Edition",
        index_header: "★ CLASSMATE NOTEBOOK INDEX ★",
        page_label: "PAGE:",
        date_label: "DATE:",
        title: "KHILADI ID CARD",
        roll_label: "ROLL:",
        class_label: "CLASS:",
        medium_label: "🏫 SCHOOL MEDIUM / स्कूल माध्यम:",
        medium_english: "🏫 English Medium School",
        medium_hindi: "🏫 Hindi Medium School",
        name_label: "✎ APNA NAAM LIKHEIN:",
        name_placeholder: "Apna Naam Likhein",
        name_tap_hint: "Naam badalne ke liye tap karein",
        school_label: "🏫 SCHOOL KA NAAM (OPTIONAL):",
        school_placeholder: "SARASWATI VIDYALAYA (Default)",
        house_label: "HOUSE / SADAN:",
        rank_label: "RANK:",
        weapon_label: "KHAS WEAPON (MAIN PEN):",
        speed_label: "Speed / Raftaar",
        grip_label: "Table Grip",
        locked_label: "LOCKED / BAND:",
        school_footer_suffix: "BENCH #4 OFFICIAL",
        teacher_sign_label: "Teacher's Sign:",
        enter_classroom: "GAME SHURU KAREIN ▶",
        rule_footer: "Rule #1: Desk se neeche gira pen out maana jayega!",
        avatar_khiladi: "KHILADI",
        avatar_attested: "● ATTESTED"
      },
      menu: {
        period_badge: "RECESS BREAK • BENCH #4",
        medium_toggle: "💬 HINGLISH",
        index_header: "★ CLASSMATE NOTEBOOK INDEX ★",
        page_label: "PAGE NO:",
        date_label: "DATE:",
        title: "KHILADI PROFILE",
        roll_label: "ROLL NO:",
        class_label: "CLASS:",
        avatar_khiladi: "KHILADI",
        toss_play_title: "TURANT KHELEIN (VS CPU)",
        toss_play_sub: "1-Finger Flick • Recess Desk Duel",
        story_title: "Levels (1 - 11)",
        story_sub: "11 Khiladiyon ko Harayein!",
        story_btn: "KHELEIN ➔",
        pass_play_title: "2 Khiladi (1 Phone)",
        pass_play_sub: "1 Phone • Do Dost",
        pass_play_btn: "KHELEIN ⇄",
        compass_title: "Mere Pens",
        compass_sub: "6 Classic Ballpens",
        compass_btn: "KHOLEN 🧰",
        trophy_title: "Trophies & Inaam",
        trophy_sub: "Career Record & Stats",
        trophy_btn: "DEKHEIN 🎖️"
      },
      setup: {
        hub_btn: "HUB",
        tab_single: "CPU se Khelein",
        tab_pass: "2 Khiladi (Dost)",
        diff_title: "SELECT DIFFICULTY",
        diff_easy: "Easy (Aasan)",
        diff_normal: "Medium (Samanya)",
        diff_hard: "Hard (Kathin 🔥)",
        bench_rule: "Bench Rule: White chalk boundary • Teak bench se gira pen instant out!",
        start_duel_1p: "MATCH SHURU KAREIN ▶",
        start_duel_2p: "2-PLAYER MATCH SHURU KAREIN ▶"
      },
      hud: {
        you_tag: "YOU",
        bot_tag: "BOT",
        p2_tag: "P2",
        your_turn: "AAPKI BAARI 🎯",
        rival_turn: "OPPONENT KI BAARI ⏳",
        p2_turn: "PLAYER 2 KI BAARI 🎯",
        round_label: "ROUND {cur} / {max}",
        first_shot_hint: "👆 Apne pen ko peeche kheencho aur nishana laga kar chhod do!",
        knockout_title: "KNOCKOUT! 💥",
        knockout_sub: "Khiladi ko point mila!",
        table_fall_title: "TABLE SE NEECHE! 💨",
        table_fall_sub: "Pen desk boundary se neeche gir gaya!",
        double_fall_title: "DONO PEN GIRE! TIE! 💥",
        double_fall_sub: "Dono pen gir gaye! Round tie!",
        timeout_title: "RECESS OVER! ⏸️",
        timeout_sub: "Time khatam ho gaya!",
        pause_round_summary: "ROUND {cur}/{max}"
      },
      pause: {
        whistle_frozen: "WHISTLE BLOWN • MATCH RUKA HUA HAI",
        title: "GAME RUKA HUA HAI ⏸️",
        period_badge: "PERIOD 4",
        teacher_title: "PT TIWARI SIR ROUND PAR HAIN!",
        teacher_desc: "Staff room se nikal chuke hain! Haath mein duster hai. Arena bench ke neeche safe hai.",
        medium_label: "LANGUAGE / BHAASHA:",
        sfx_label: "Desk Sound Effects (SFX)",
        whistle_label: "Teacher Whistle Alert",
        diff_label: "BOT AI DIFFICULTY:",
        resume_btn: "KHEL JAARI RAKHEIN ▶",
        restart_btn: "ROUND DOHRAYEIN 🔄",
        quit_btn: "HUB PAR WAPAS JAYEIN 🏠",
        conduct_note: "\"Code of Conduct: Flick release ke dauran pause dabaya toh Table Foul maana jayega!\""
      },
      result: {
        victory_title: "★ SHAANDAR JEET (A+) ★",
        defeat_title: "HAAR GAYE! PEN TABLE SE GIRA! 💔",
        next_classmate: "AGLA KHILADI ➔",
        rematch_1p: "DOBARA KHELEIN 🔄",
        rematch_2p: "DOBARA DUEL (P1 vs P2) ⚔️",
        rematch_defeat: "DOBARA KHELEIN! BENCH WAPAS PAAYEIN ⚔️",
        return_hub: "HUB PAR WAPAS JAYEIN 🚪"
      },
      settings: {
        medium_title: "School Medium & Language",
        audio_title: "Audio & Recess SFX",
        audio_badge: "1998 SOUND"
      }
    },

    hindi: {
      admission: {
        period_pill: "पीरियड: लंच ब्रेक • बेंच #4",
        subheading_championship: "क्लासरूम प्रतियोगिता",
        subheading_edition: "1998 संस्करण",
        index_header: "★ क्लासमेट नोटबुक इंडेक्स ★",
        page_label: "पेज:",
        date_label: "तारीख:",
        title: "खिलाड़ी पहचान पत्र",
        roll_label: "रोल:",
        class_label: "कक्षा:",
        medium_label: "🏫 स्कूल माध्यम:",
        medium_english: "🏫 English Medium School",
        medium_hindi: "🏫 Hindi Medium School",
        name_label: "✎ अपना नाम लिखें:",
        name_placeholder: "अपना नाम दर्ज करें",
        name_tap_hint: "अपना नाम बदलने के लिए टैप करें",
        school_label: "🏫 स्कूल का नाम (वैकल्पिक):",
        school_placeholder: "सरस्वती विद्यालय (डिफ़ॉल्ट)",
        house_label: "सदन (हाउस):",
        rank_label: "रैंक:",
        weapon_label: "मुख्य पेन:",
        speed_label: "रफ़्तार / गति",
        grip_label: "टेबल पर पकड़",
        locked_label: "बंद पेन:",
        school_footer_suffix: "बेंच #4 आधिकारिक",
        teacher_sign_label: "टीचर के हस्ताक्षर:",
        enter_classroom: "खेल शुरू करें ▶",
        rule_footer: "नियम #1: डेस्क से नीचे गिरा पेन आउट माना जाएगा!",
        avatar_khiladi: "खिलाड़ी",
        avatar_attested: "● प्रमाणित"
      },
      menu: {
        period_badge: "लंच ब्रेक • बेंच #4",
        medium_toggle: "🇮🇳 हिंदी",
        index_header: "★ क्लासमेट नोटबुक इंडेक्स ★",
        page_label: "पेज नं:",
        date_label: "तारीख:",
        title: "खिलाड़ी प्रोफ़ाइल",
        roll_label: "रोल नं:",
        class_label: "कक्षा:",
        avatar_khiladi: "खिलाड़ी",
        toss_play_title: "⚡ तुरंत खेलें (VS CPU)",
        toss_play_sub: "1-उंगली से फ्लिक करें • डेस्क मुकाबला",
        story_title: "लेवल मैच (1 - 11)",
        story_sub: "11 विरोधियों को हराएं!",
        story_btn: "खेलें ➔",
        pass_play_title: "2 खिलाड़ी (1 फ़ोन)",
        pass_play_sub: "1 फ़ोन • दो दोस्त",
        pass_play_btn: "खेलें ⇄",
        compass_title: "मेरे पेन",
        compass_sub: "पेन बॉक्स व हथियार",
        compass_btn: "खोलें 🖊️",
        trophy_title: "ट्रॉफी व इनाम",
        trophy_sub: "उपलब्धियां व रिकॉर्ड",
        trophy_btn: "देखें 🏆"
      },
      setup: {
        hub_btn: "होम",
        tab_single: "कंप्यूटर से खेलें",
        tab_pass: "2 खिलाड़ी (दोस्त)",
        diff_title: "कठिनाई चुनें",
        diff_easy: "आसान (Easy)",
        diff_normal: "सामान्य (Medium)",
        diff_hard: "कठिन (Hard 🔥)",
        bench_rule: "डेस्क नियम: टेबल से नीचे गिरते ही खिलाड़ी आउट!",
        start_duel_1p: "मैच शुरू करें ▶",
        start_duel_2p: "2-खिलाड़ी मैच शुरू करें ▶"
      },
      hud: {
        you_tag: "आप",
        bot_tag: "कंप्यूटर",
        p2_tag: "खिलाड़ी 2",
        your_turn: "आपकी बारी 🎯",
        rival_turn: "विरोधी की बारी ⏳",
        p2_turn: "खिलाड़ी 2 की बारी 🎯",
        round_label: "राउंड {cur} / {max}",
        first_shot_hint: "👆 अपने पेन को पीछे खींचें और निशाना लगाकर छोड़ दें!",
        knockout_title: "नॉकआउट! 💥",
        knockout_sub: "खिलाड़ी को एक पॉइंट मिला!",
        table_fall_title: "टेबल से बाहर गिरे! 💨",
        table_fall_sub: "पेन डेस्क की सीमा से नीचे गिरा!",
        double_fall_title: "दोनों पेन गिरे! टाई! 💥",
        double_fall_sub: "दोनों पेन बाहर गिरे! राउंड टाई!",
        timeout_title: "समय समाप्त! ⏸️",
        timeout_sub: "समय पूरा हो गया!",
        pause_round_summary: "राउंड {cur}/{max}"
      },
      pause: {
        whistle_frozen: "सीटी बजी • मैच रुका",
        title: "गेम रुका हुआ है ⏸️",
        period_badge: "पीरियड 4",
        teacher_title: "पीटी तिवारी सर राउंड पर हैं!",
        teacher_desc: "स्टाफ रूम से निकल चुके हैं! हाथ में डस्टर है। मैच बेंच के नीचे सुरक्षित रुका हुआ है।",
        medium_label: "भाषा माध्यम:",
        sfx_label: "साउंड व आवाज (SFX)",
        whistle_label: "टीचर सीटी की चेतावनी",
        diff_label: "कंप्यूटर कठिनाई स्तर:",
        resume_btn: "खेल जारी रखें ▶",
        restart_btn: "राउंड फिर से शुरू करें 🔄",
        quit_btn: "होम स्क्रीन पर जाएं 🏠",
        conduct_note: "\"नियम: शॉट मारते समय पॉज दबाया तो टेबल फाउल माना जाएगा!\""
      },
      result: {
        victory_title: "शानदार जीत! ✪",
        defeat_title: "हार! टेबल से बाहर गिरे! 💔",
        next_classmate: "अगला सहपाठी ➔",
        rematch_1p: "दोबारा खेलें 🔄",
        rematch_2p: "दोबारा मुकाबला (P1 vs P2) ⚔️",
        rematch_defeat: "दोबारा खेलें! बेंच वापस पाएं ⚔️",
        return_hub: "होम पर जाएं 🚪"
      },
      settings: {
        medium_title: "भाषा माध्यम (Medium)",
        audio_title: "साउंड व आवाज (SFX)",
        audio_badge: "1998 साउंड"
      }
    }
  };

  /**
   * Helper: Read saved schoolMedium
   */
  function getSavedSchoolMedium() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (parsed.settings && (parsed.settings.schoolMedium === 'english_school' || parsed.settings.schoolMedium === 'hindi_school')) {
            return parsed.settings.schoolMedium;
          }
          if (parsed.profile && (parsed.profile.schoolMedium === 'english_school' || parsed.profile.schoolMedium === 'hindi_school')) {
            return parsed.profile.schoolMedium;
          }
        }
      }
    } catch (e) {}
    return 'english_school';
  }

  /**
   * Helper: Read saved language validated against schoolMedium
   */
  function getSavedLanguage(medium) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.settings && ['english', 'hinglish', 'hindi'].includes(parsed.settings.language)) {
          const l = parsed.settings.language;
          if (medium === 'english_school' && (l === 'english' || l === 'hinglish')) return l;
          if (medium === 'hindi_school' && (l === 'hinglish' || l === 'hindi')) return l;
        }
      }
    } catch (e) {}
    return (medium === 'english_school') ? 'english' : 'hinglish';
  }

  let currentSchoolMedium = getSavedSchoolMedium();
  let currentLanguage = getSavedLanguage(currentSchoolMedium);

  /**
   * Translate key with optional variable replacements
   */
  function t(key, vars = {}) {
    if (!key) return '';
    const langPack = I18N_PACK[currentLanguage] || I18N_PACK.english;
    const fallbackPack = I18N_PACK.english;

    const parts = key.split('.');
    let val = langPack;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        val = null;
        break;
      }
    }

    if (val === null || val === undefined) {
      val = fallbackPack;
      for (const p of parts) {
        if (val && typeof val === 'object' && p in val) {
          val = val[p];
        } else {
          val = null;
          break;
        }
      }
    }

    if (typeof val !== 'string') return key;

    let res = val;
    Object.keys(vars).forEach(k => {
      res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
    });
    return res;
  }

  /**
   * Apply language to DOM elements
   */
  function translateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const translated = t(key);
        if (translated && translated !== key) {
          el.textContent = translated;
        }
      }
    });

    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
      const key = input.getAttribute('data-i18n-placeholder');
      if (key) {
        const translated = t(key);
        if (translated && translated !== key) {
          input.placeholder = translated;
        }
      }
    });

    updateMediumSelectorsUI();

    if (typeof window.applySchoolName === 'function') {
      window.applySchoolName();
    }
  }

  /**
   * Update visual states of all School Medium and Language selectors
   */
  function updateMediumSelectorsUI() {
    const isEngSchool = (currentSchoolMedium === 'english_school');

    // 1. Splash Admission School Medium Buttons & Badge
    const splashEn = document.getElementById('splash-med-english-btn');
    const splashHi = document.getElementById('splash-med-hindi-btn');
    const splashBadge = document.getElementById('splash-medium-badge');
    if (splashBadge) {
      splashBadge.textContent = isEngSchool ? "📖 ENGLISH MEDIUM" : "🇮🇳 HINDI MEDIUM";
    }
    if (splashEn && splashHi) {
      if (isEngSchool) {
        splashEn.className = "pencil-btn-tactile w-full py-1.5 px-2 rounded-md text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-[#00288e] text-white shadow-xs font-black text-center flex items-center justify-center gap-1";
        splashHi.className = "pencil-btn-tactile w-full py-1.5 px-2 rounded-md text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-white text-slate-700 opacity-70 border border-slate-300 text-center flex items-center justify-center gap-1";
      } else {
        splashEn.className = "pencil-btn-tactile w-full py-1.5 px-2 rounded-md text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-white text-slate-700 opacity-70 border border-slate-300 text-center flex items-center justify-center gap-1";
        splashHi.className = "pencil-btn-tactile w-full py-1.5 px-2 rounded-md text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-[#00288e] text-white shadow-xs font-black text-center flex items-center justify-center gap-1";
      }
    }

    // 2. Main Menu School Medium Badge on Profile Card
    const menuMedBadge = document.getElementById('menu-medium-badge');
    if (menuMedBadge) {
      menuMedBadge.textContent = isEngSchool ? "📖 ENG MED." : "🇮🇳 HINDI MED.";
    }

    // 3. Career Dossier School Medium Tag
    const dossierMedTag = document.getElementById('dossier-medium-tag');
    if (dossierMedTag) {
      dossierMedTag.textContent = isEngSchool ? "📖 ENG MED." : "🇮🇳 HINDI MED.";
    }

    // 4. Main Menu Sub-Language Toggle Badge
    const menuBadgeText = document.getElementById('menu-medium-toggle-text');
    if (menuBadgeText) {
      if (isEngSchool) {
        menuBadgeText.textContent = (currentLanguage === 'english') ? "📖 ENG" : "💬 HINGLISH";
      } else {
        menuBadgeText.textContent = (currentLanguage === 'hinglish') ? "💬 HINGLISH" : "🇮🇳 हिंदी";
      }
    }

    // 3. Pause Menu Sub-Language Buttons
    const pauseBtn1 = document.getElementById('pause-med-english-btn');
    const pauseBtn2 = document.getElementById('pause-med-hindi-btn');
    if (pauseBtn1 && pauseBtn2) {
      if (isEngSchool) {
        pauseBtn1.textContent = "📖 English";
        pauseBtn1.onclick = () => setGameLanguage('english');
        pauseBtn2.textContent = "💬 Hinglish";
        pauseBtn2.onclick = () => setGameLanguage('hinglish');

        if (currentLanguage === 'english') {
          pauseBtn1.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-[#00288e] text-white font-black shadow-xs";
          pauseBtn2.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-white text-slate-700 opacity-70";
        } else {
          pauseBtn1.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-white text-slate-700 opacity-70";
          pauseBtn2.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-[#00288e] text-white font-black shadow-xs";
        }
      } else {
        pauseBtn1.textContent = "💬 Hinglish";
        pauseBtn1.onclick = () => setGameLanguage('hinglish');
        pauseBtn2.textContent = "🇮🇳 हिंदी";
        pauseBtn2.onclick = () => setGameLanguage('hindi');

        if (currentLanguage === 'hinglish') {
          pauseBtn1.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-[#00288e] text-white font-black shadow-xs";
          pauseBtn2.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-white text-slate-700 opacity-70";
        } else {
          pauseBtn1.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-white text-slate-700 opacity-70";
          pauseBtn2.className = "pencil-btn-tactile px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-[#00288e] text-white font-black shadow-xs";
        }
      }
    }

    // 4. Settings View: School Medium Toggle Buttons
    const settSchoolEn = document.getElementById('settings-school-english-btn');
    const settSchoolHi = document.getElementById('settings-school-hindi-btn');
    if (settSchoolEn && settSchoolHi) {
      if (isEngSchool) {
        settSchoolEn.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
        settSchoolHi.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
      } else {
        settSchoolEn.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
        settSchoolHi.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
      }
    }

    // 5. Settings View: Sub-Language Toggle Buttons
    const settSub1 = document.getElementById('settings-med-english-btn');
    const settSub2 = document.getElementById('settings-med-hindi-btn');
    if (settSub1 && settSub2) {
      if (isEngSchool) {
        settSub1.innerHTML = `<span>📖 English</span>`;
        settSub1.onclick = () => setGameLanguage('english');
        settSub2.innerHTML = `<span>💬 Hinglish</span>`;
        settSub2.onclick = () => setGameLanguage('hinglish');

        if (currentLanguage === 'english') {
          settSub1.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
          settSub2.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
        } else {
          settSub1.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
          settSub2.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
        }
      } else {
        settSub1.innerHTML = `<span>💬 Hinglish</span>`;
        settSub1.onclick = () => setGameLanguage('hinglish');
        settSub2.innerHTML = `<span>🇮🇳 हिंदी</span>`;
        settSub2.onclick = () => setGameLanguage('hindi');

        if (currentLanguage === 'hinglish') {
          settSub1.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
          settSub2.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
        } else {
          settSub1.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
          settSub2.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[11.5px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
        }
      }
    }
  }

  /**
   * Set School Medium ('english_school' | 'hindi_school')
   * Automatically sets default language:
   *   english_school -> 'english'
   *   hindi_school   -> 'hinglish'
   */
  function setSchoolMedium(medium) {
    if (medium !== 'english_school' && medium !== 'hindi_school') {
      medium = 'english_school';
    }

    currentSchoolMedium = medium;
    const targetLang = (medium === 'english_school') ? 'english' : 'hinglish';
    currentLanguage = targetLang;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let save = raw ? JSON.parse(raw) : {};
      if (!save.settings) save.settings = {};
      save.settings.schoolMedium = medium;
      save.settings.language = targetLang;
      if (!save.profile) save.profile = {};
      save.profile.schoolMedium = medium;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (e) {}

    translateDOM();

    if (window.hudController && typeof window.hudController.onLanguageChange === 'function') {
      window.hudController.onLanguageChange(targetLang);
    }
    if (window.matchResultController && typeof window.matchResultController.onLanguageChange === 'function') {
      window.matchResultController.onLanguageChange(targetLang);
    }
    if (window.trophyCabinetController && typeof window.trophyCabinetController.onLanguageChange === 'function') {
      window.trophyCabinetController.onLanguageChange(targetLang);
    }
  }

  /**
   * Set sub-language ('english' | 'hinglish' | 'hindi')
   */
  function setGameLanguage(lang) {
    if (currentSchoolMedium === 'english_school') {
      if (lang !== 'english' && lang !== 'hinglish') lang = 'english';
    } else {
      if (lang !== 'hinglish' && lang !== 'hindi') lang = 'hinglish';
    }

    currentLanguage = lang;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let save = raw ? JSON.parse(raw) : {};
      if (!save.settings) save.settings = {};
      save.settings.language = lang;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (e) {}

    translateDOM();

    if (window.hudController && typeof window.hudController.onLanguageChange === 'function') {
      window.hudController.onLanguageChange(lang);
    }
    if (window.matchResultController && typeof window.matchResultController.onLanguageChange === 'function') {
      window.matchResultController.onLanguageChange(lang);
    }
    if (window.trophyCabinetController && typeof window.trophyCabinetController.onLanguageChange === 'function') {
      window.trophyCabinetController.onLanguageChange(lang);
    }
  }

  /**
   * Main Menu Top Pill Toggle:
   *   english_school: toggles between 'english' and 'hinglish'
   *   hindi_school:   toggles between 'hinglish' and 'hindi'
   */
  function toggleMedium() {
    if (currentSchoolMedium === 'english_school') {
      const next = (currentLanguage === 'english') ? 'hinglish' : 'english';
      setGameLanguage(next);
    } else {
      const next = (currentLanguage === 'hinglish') ? 'hindi' : 'hinglish';
      setGameLanguage(next);
    }
  }

  function getGameLanguage() {
    return currentLanguage;
  }

  function getSchoolMedium() {
    return currentSchoolMedium;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translateDOM);
  } else {
    translateDOM();
  }

  window.I18N_PACK = I18N_PACK;
  window.t = t;
  window.setSchoolMedium = setSchoolMedium;
  window.getSchoolMedium = getSchoolMedium;
  window.setGameLanguage = setGameLanguage;
  window.getGameLanguage = getGameLanguage;
  window.toggleMedium = toggleMedium;
  window.translateDOM = translateDOM;

})(window);
