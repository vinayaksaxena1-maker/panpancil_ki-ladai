/**
 * Pen Fight: Desk Wars — 100% Offline 2-Medium Language Engine
 * Supports: 'english' (English Medium - 100% original UI untouched)
 *           'hindi'   (Hindi Medium - Simple casual UI for everyday users)
 * 
 * Invariant: Zero external dependencies. Complete client-side offline persistence.
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
        medium_english: "📖 English Medium",
        medium_hindi: "🇮🇳 हिंदी मीडियम",
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
        avatar_attested: "● ATTESTED",
        choose_avatar: "CHOOSE AVATAR"
      },
      menu: {
        period_badge: "RECESS BREAK • BENCH #4",
        medium_toggle: "📖 ENG MED.",
        index_header: "★ CLASSMATE NOTEBOOK INDEX ★",
        page_label: "PAGE NO:",
        date_label: "DATE:",
        title: "STUDENT BATTLE PASS",
        roll_label: "ROLL NO:",
        class_label: "CLASS:",
        avatar_khiladi: "KHILADI",
        level_label: "LEVEL 02 • FRONT BENCHER",
        toss_play_title: "TOSS & PLAY",
        toss_play_sub: "VS BOT",
        story_title: "Story Mode / Levels",
        story_sub: "Class 7th to 10th",
        story_btn: "OPEN CAMPAIGN ➔",
        pass_play_title: "Pass & Play / 2 Players",
        pass_play_sub: "1 Device • Two Friends",
        pass_play_btn: "START 2P DUEL ⇄",
        compass_title: "Compass Box / My Pens",
        compass_sub: "6 Classic Ballpens",
        compass_btn: "OPEN PENCIL BOX 🖊️",
        trophy_title: "Trophy Rack / Records",
        trophy_sub: "Career Dossier & Stats",
        trophy_btn: "INSPECT CABINET 🏆",
        footer_warning: "WARNING: Class monitor keeps looking. Strike fast & silent!"
      },
      setup: {
        hub_btn: "HUB",
        title: "MATCH SETUP",
        tab_single: "Single Player (VS CPU)",
        tab_pass: "Pass & Play (2-Player)",
        opponent_title: "RIVAL SCOUT REPORT",
        diff_title: "SELECT DIFFICULTY",
        diff_easy: "1st Bencher (Easy)",
        diff_normal: "Desk Regular (Normal)",
        diff_hard: "Monitor (Hard 🔥)",
        bench_rule: "Desk Rule: Out upon table boundary breach!",
        start_duel_1p: "START DESK DUEL ▶",
        start_duel_2p: "START 2-PLAYER DUEL ▶",
        blue_corner: "Blue Corner",
        red_corner: "Red Corner",
        tap_change_pen: "Tap to change pen",
        toss_strip: "COIN TOSS: Winner strikes first!"
      },
      hud: {
        recess_pill: "RECESS PERIOD 4 • BENCH #1",
        stake_1p: "1P DESK DUEL",
        stake_2p: "2P DESK DUEL",
        bounty_chip: "★ 3 ROUNDS",
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
        medium_label: "MEDIUM / माध्यम:",
        sfx_label: "Desk Sound Effects (SFX)",
        whistle_label: "Teacher Whistle Alert",
        diff_label: "BOT AI DIFFICULTY:",
        resume_btn: "RESUME DUEL ⏱️",
        restart_btn: "RESTART ROUND 🔄",
        quit_btn: "QUIT TO CLASSROOM HUB 🚪",
        conduct_note: "\"Code of Conduct: Flick velocity release ke dauran pause dabaya toh Table Foul maana jayega!\""
      },
      result: {
        victory_title: "PASSED WITH DISTINCTION!",
        defeat_title: "FAILED! PEN FELL OFF DESK!",
        promotion_title: "PROMOTION CHIT GRANTED!",
        score_tag_win: "VICTORY!",
        score_tag_loss: "DEFEAT!",
        next_classmate: "NEXT CLASSMATE",
        rematch_1p: "REMATCH (RETRY DUEL) 🔄",
        rematch_2p: "REMATCH (P1 vs P2) ⚔️",
        rematch_defeat: "REMATCH! RECLAIM BENCH ⚔️",
        return_hub: "RETURN TO CLASSROOM HUB 🚪"
      },
      settings: {
        medium_title: "Medium / भाषा माध्यम",
        audio_title: "Audio & Recess SFX",
        audio_badge: "1998 SOUND",
        flick_sfx: "Pen Flick & Knock SFX",
        flick_desc: "Ballpoint tip friction, table knock & plastic snap",
        ambiance_title: "Classroom Murmur Chatter",
        ambiance_desc: "Recess murmur of students, distant brass school bell",
        whistle_title: "PT Sir Whistle & Alert Alarm",
        whistle_desc: "Emergency whistle trigger when pen flies off-desk",
        conduct_title: "Recess Code of Conduct",
        conduct_badge: "Official Rules"
      },
      compass: {
        title: "CAMLIN COMPASS BOX",
        subtitle: "Desk Weapon Locker • Standard Issue 1998",
        equipped: "EQUIPPED",
        equip_btn: "EQUIP PEN",
        locked: "LOCKED"
      },
      campaign: {
        title: "CLASSROOM CONQUEST",
        subtitle: "Front Bench to Back Bench (Stages 1 - 11)",
        start_stage: "CHALLENGE BENCH",
        locked_stage: "LOCKED"
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
        medium_label: "🏫 माध्यम:",
        medium_english: "📖 English Medium",
        medium_hindi: "🇮🇳 हिंदी मीडियम",
        name_label: "✎ अपना नाम लिखें:",
        name_placeholder: "अपना नाम दर्ज करें",
        name_tap_hint: "अपना नाम बदलने के लिए टैप करें",
        school_label: "🏫 स्कूल का नाम (वैकल्पिक):",
        school_placeholder: "सरस्वती विद्यालय (डिफ़ॉल्ट)",
        house_label: "सदन (हाउस):",
        rank_label: "रैंक:",
        weapon_label: "मुख्य पेन (हथियार):",
        speed_label: "रफ़्तार / गति",
        grip_label: "टेबल पर पकड़",
        locked_label: "बंद पेन:",
        school_footer_suffix: "बेंच #4 आधिकारिक",
        teacher_sign_label: "टीचर के हस्ताक्षर:",
        enter_classroom: "खेल शुरू करें ▶",
        rule_footer: "नियम #1: डेस्क से नीचे गिरा पेन आउट माना जाएगा!",
        avatar_khiladi: "खिलाड़ी",
        avatar_attested: "● प्रमाणित",
        choose_avatar: "अवतार चुनें"
      },
      menu: {
        period_badge: "लंच ब्रेक • बेंच #4",
        medium_toggle: "🇮🇳 हिंदी मीडियम",
        index_header: "★ क्लासमेट नोटबुक इंडेक्स ★",
        page_label: "पेज नं:",
        date_label: "तारीख:",
        title: "खिलाड़ी प्रोफ़ाइल",
        roll_label: "रोल नं:",
        class_label: "कक्षा:",
        avatar_khiladi: "खिलाड़ी",
        level_label: "लेवल 02 • आगे बैठने वाले",
        toss_play_title: "⚡ तुरंत खेलें",
        toss_play_sub: "(VS CPU)",
        story_title: "लेवल मैच (1 - 11)",
        story_sub: "कक्षा 7वीं से 10वीं तक",
        story_btn: "खेलें ➔",
        pass_play_title: "2 खिलाड़ी (1 फोन)",
        pass_play_sub: "1 फोन • दो दोस्त",
        pass_play_btn: "खेलें ⇄",
        compass_title: "मेरे पेन",
        compass_sub: "6 क्लासिक पेन",
        compass_btn: "खोलें 🖊️",
        trophy_title: "ट्रॉफी व इनाम",
        trophy_sub: "रिकॉर्ड व उपलब्धियां",
        trophy_btn: "देखें 🏆",
        footer_warning: "सावधान: क्लास मॉनिटर देख रहा है। फुर्ती और शांति से खेलें!"
      },
      setup: {
        hub_btn: "होम",
        title: "मैच सेटअप",
        tab_single: "कंप्यूटर से खेलें",
        tab_pass: "2 खिलाड़ी (दोस्त)",
        opponent_title: "विरोधी की जानकारी",
        diff_title: "कठिनाई चुनें",
        diff_easy: "आसान (Easy)",
        diff_normal: "सामान्य (Medium)",
        diff_hard: "कठिन (Hard 🔥)",
        bench_rule: "डेस्क नियम: टेबल से नीचे गिरते ही खिलाड़ी आउट!",
        start_duel_1p: "मैच शुरू करें ▶",
        start_duel_2p: "2-खिलाड़ी मैच शुरू करें ▶",
        blue_corner: "नीला कोना",
        red_corner: "लाल कोना",
        tap_change_pen: "पेन बदलने के लिए टैप करें",
        toss_strip: "सिक्का उछाल: टॉस जीतने वाला पहला शॉट मारेगा!"
      },
      hud: {
        recess_pill: "लंच पीरियड 4 • बेंच #1",
        stake_1p: "1 खिलाड़ी मैच",
        stake_2p: "2 खिलाड़ी मैच",
        bounty_chip: "★ 3 राउंड",
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
        promotion_title: "अगली कक्षा में प्रमोशन!",
        score_tag_win: "जीत!",
        score_tag_loss: "हार!",
        next_classmate: "अगला सहपाठी ➔",
        rematch_1p: "दोबारा खेलें 🔄",
        rematch_2p: "दोबारा मुकाबला (P1 vs P2) ⚔️",
        rematch_defeat: "दोबारा खेलें! बेंच वापस पाएं ⚔️",
        return_hub: "होम पर जाएं 🚪"
      },
      settings: {
        medium_title: "भाषा माध्यम (Medium)",
        audio_title: "साउंड व आवाज (SFX)",
        audio_badge: "1998 साउंड",
        flick_sfx: "पेन शॉट व टक्कर की आवाज",
        flick_desc: "पेन की नोक, टेबल पर खटखट और प्लास्टिक की आवाज",
        ambiance_title: "क्लासरूम की आवाज",
        ambiance_desc: "बच्चों की बातें और दूर बजती स्कूल की घंटी",
        whistle_title: "पीटी सर की सीटी",
        whistle_desc: "पेन टेबल से बाहर गिरने पर बजने वाली सीटी",
        conduct_title: "खेल के नियम",
        conduct_badge: "आधिकारिक नियम"
      },
      compass: {
        title: "पेन बॉक्स (कैमलिन)",
        subtitle: "हथियार लॉकर • 1998 संस्करण",
        equipped: "चुना हुआ पेन",
        equip_btn: "यह पेन चुनें",
        locked: "बंद पेन"
      },
      campaign: {
        title: "क्लासरूम अभियान",
        subtitle: "आगे की बेंच से आखिरी बेंच तक (1 - 11)",
        start_stage: "चुनौती दें",
        locked_stage: "बंद"
      }
    }
  };

  /**
   * Helper: Read saved language
   */
  function getSavedLanguage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.settings && (parsed.settings.language === 'hindi' || parsed.settings.language === 'english')) {
          return parsed.settings.language;
        }
      }
    } catch (e) {
      console.warn('[i18n] Failed to read saved language:', e);
    }
    return 'english';
  }

  let currentLanguage = getSavedLanguage();

  /**
   * Translate key with optional variable replacements
   * Example: window.t('hud.round_label', { cur: '01', max: '03' })
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

    // Fallback to English if not found in current language
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

    // Replace variables e.g. {cur}, {max}
    let res = val;
    Object.keys(vars).forEach(k => {
      res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
    });
    return res;
  }

  /**
   * Apply language to all DOM elements tagged with data-i18n & data-i18n-placeholder
   */
  function translateDOM() {
    // 1. Text elements
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

    // 2. Input placeholders
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

    // 3. Update Medium Selector Buttons UI state
    updateMediumSelectorsUI();

    // 4. Preserve School Name
    if (typeof window.applySchoolName === 'function') {
      window.applySchoolName();
    }
  }

  /**
   * Update visual highlight on medium buttons
   */
  function updateMediumSelectorsUI() {
    const isHindi = (currentLanguage === 'hindi');

    // Splash Admission Medium Buttons
    const splashEn = document.getElementById('splash-med-english-btn');
    const splashHi = document.getElementById('splash-med-hindi-btn');
    if (splashEn && splashHi) {
      if (isHindi) {
        splashEn.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[10px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-white text-slate-700 opacity-70";
        splashHi.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[10px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-[#00288e] text-white shadow-xs font-black";
      } else {
        splashEn.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[10px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-[#00288e] text-white shadow-xs font-black";
        splashHi.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[10px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer bg-white text-slate-700 opacity-70";
      }
    }

    // Main Menu Medium Toggle Badge
    const menuBadgeText = document.getElementById('menu-medium-toggle-text');
    if (menuBadgeText) {
      menuBadgeText.textContent = isHindi ? "🇮🇳 हिंदी मीडियम" : "📖 ENG MED.";
    }

    // Pause Menu Medium Buttons
    const pauseEn = document.getElementById('pause-med-english-btn');
    const pauseHi = document.getElementById('pause-med-hindi-btn');
    if (pauseEn && pauseHi) {
      if (isHindi) {
        pauseEn.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-white text-slate-700 opacity-70";
        pauseHi.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-[#00288e] text-white font-black shadow-xs";
      } else {
        pauseEn.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-[#00288e] text-white font-black shadow-xs";
        pauseHi.className = "pencil-btn-tactile px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer bg-white text-slate-700 opacity-70";
      }
    }

    // Settings Modal Medium Buttons
    const settEn = document.getElementById('settings-med-english-btn');
    const settHi = document.getElementById('settings-med-hindi-btn');
    if (settEn && settHi) {
      if (isHindi) {
        settEn.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[12px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
        settHi.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[12px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
      } else {
        settEn.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[12px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#00288e] text-white border-slate-900 shadow-xs font-black";
        settHi.className = "pencil-btn-tactile py-2 px-2 rounded-lg border-2 text-[12px] font-bold text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-300 opacity-70";
      }
    }
  }

  /**
   * Set active language ('english' | 'hindi')
   */
  function setGameLanguage(lang) {
    if (lang !== 'english' && lang !== 'hindi') {
      console.warn(`[i18n] Invalid language "${lang}", defaulting to english`);
      lang = 'english';
    }

    currentLanguage = lang;

    // Persist to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let save = raw ? JSON.parse(raw) : {};
      if (!save.settings) save.settings = {};
      save.settings.language = lang;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (e) {
      console.warn('[i18n] Failed to persist language to localStorage:', e);
    }

    // Update DOM
    translateDOM();

    // Notify other controllers if active
    if (window.hudController && typeof window.hudController.onLanguageChange === 'function') {
      window.hudController.onLanguageChange(lang);
    }
    if (window.matchResultController && typeof window.matchResultController.onLanguageChange === 'function') {
      window.matchResultController.onLanguageChange(lang);
    }
    if (window.trophyCabinetController && typeof window.trophyCabinetController.onLanguageChange === 'function') {
      window.trophyCabinetController.onLanguageChange(lang);
    }

    console.log(`[i18n] Medium switched to: ${lang}`);
  }

  /**
   * Toggle between English and Hindi Medium
   */
  function toggleMedium() {
    const next = (currentLanguage === 'english') ? 'hindi' : 'english';
    setGameLanguage(next);
  }

  function getGameLanguage() {
    return currentLanguage;
  }

  // Auto-initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      translateDOM();
    });
  } else {
    translateDOM();
  }

  // Export to window
  window.I18N_PACK = I18N_PACK;
  window.t = t;
  window.setGameLanguage = setGameLanguage;
  window.getGameLanguage = getGameLanguage;
  window.toggleMedium = toggleMedium;
  window.translateDOM = translateDOM;

})(window);
