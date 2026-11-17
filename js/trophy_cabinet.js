/**
 * D:\FInal\js\trophy_cabinet.js
 * Step 3.9: Trophy Cabinet & Offline Settings Controller
 * 
 * Manages:
 * 1. 16-Badge Classroom Enamel Pin Grid (Unlocked shiny pins vs Locked pencil sketches)
 * 2. Enamel Pin Inspect Modal Sheet (Metallic badge, lore feat, teacher red ink sign, pin to profile)
 * 3. Audio & Rules Settings Drawer (SFX Volume, Ambiance, Whistle, Official Code of Conduct, Clear Career Data)
 * 
 * Invariant: 100% Decoupled, reads/writes persistent storage cleanly.
 */

(function initTrophyCabinetController() {
  const BADGES_METADATA = [
    {
      id: "FIRST_BLOOD",
      no: "#01",
      title: "Pehli Jeet",
      sub: "First Match Victory",
      tier: "gold",
      icon: "🩸",
      feat: "Pehli baar kisi match me jeet darj ki!",
      bonus: "+50 Khiladi XP • Pehla Kadam",
      note: '"Monitor ki shikayat bekar gayi. Fair game! - Signed Sharma Sir"',
      defaultUnlocked: false
    },
    {
      id: "CLEAN_SWEEP",
      no: "#02",
      title: "3-0 White Wash",
      sub: "Undefeated Clean Sweep",
      tier: "blue",
      icon: "🧹",
      feat: "Bina ek bhi round haare 3-0 se match jeeta!",
      bonus: "+75 Khiladi XP • Clean Sweep",
      note: '"Opponent ko ek mauka tak nahi diya! - Bench Mates"',
      defaultUnlocked: false
    },
    {
      id: "COMEBACK_HERO",
      no: "#03",
      title: "0-2 se Palatwar",
      sub: "Clutch 3-2 Win",
      tier: "rose",
      icon: "🔄",
      feat: "Pehle 2 round haar kar agle 3 jeet kar match palat diya!",
      bonus: "+250 Khiladi XP • Clutch God",
      note: '"Himmat nahi haari is ladke ne, kya comeback tha! - Sports Teacher"',
      defaultUnlocked: false
    },
    {
      id: "EDGE_SURVIVOR",
      no: "#04",
      title: "Desk Edge Clutch",
      sub: "Saved Pen on Table Cliff",
      tier: "cyan",
      icon: "🧗",
      feat: "Desk ke bilkul kinar par girne se bachkar round jeeta!",
      bonus: "+180 Khiladi XP • Edge Balance +15%",
      note: '"Gravitation ka niyam tod diya is ladke ne! - Physics Sir"',
      defaultUnlocked: false
    },
    {
      id: "HARD_CHAMPION",
      no: "#05",
      title: "Class Topper",
      sub: "Defeated Hard AI Bot",
      tier: "purple",
      icon: "🥇",
      feat: "Hard difficulty bot ko duel me dho daala!",
      bonus: "+300 Khiladi XP • Genius Aura",
      note: '"Iska calculation computer se bhi tez hai! - Maths Sir"',
      defaultUnlocked: false
    },
    {
      id: "HEAVY_KNOCKOUT",
      no: "#06",
      title: "Trimax Blast",
      sub: "Heavy Pen Knockout Hit",
      tier: "amber",
      icon: "💥",
      feat: "Bhari Trimax ya Nataraj pen se opponent ko uda diya!",
      bonus: "+200 Khiladi XP • Snap Force +8%",
      note: '"Bench par aawaz kam karo, agle room me test chal raha hai! - PT Sir"',
      defaultUnlocked: false
    },
    {
      id: "IRON_DEFENSE",
      no: "#07",
      title: "Loha Shield",
      sub: "Zero Pen Falls in Match",
      tier: "indigo",
      icon: "🛡️",
      feat: "Poore match me ek baar bhi pen desk se neeche nahi giri!",
      bonus: "+220 Khiladi XP • Solid Defense",
      note: '"M-seal ya rubber band ke bina jeetna kamaal hai. - Senior Bhaiya"',
      defaultUnlocked: false
    },
    {
      id: "MONITOR_DETHRONED",
      no: "#08",
      title: "Class Monitor Down",
      sub: "Defeat Stage 3 Monitor",
      tier: "purple",
      icon: "📉",
      feat: "Stage 3 me Class 7-A ke Monitor Aditya ko haraya!",
      bonus: "+250 Khiladi XP • Classroom Respect +50%",
      note: '"Blackboard par se mera naam mita diya gaya! - Monitor Nitin"',
      defaultUnlocked: false
    },
    {
      id: "INTERSECTION_HERO",
      no: "#09",
      title: "Inter-Section Hero",
      sub: "Cleared Class 7 Section C",
      tier: "gold",
      icon: "⚔️",
      feat: "Stage 6 me Class 7 Overall Champion ko hara kar Section 7 jeeti!",
      bonus: "+400 Khiladi XP • Row Sovereign Title",
      note: '"Section B ka naam roshan kiya annual tournament me. - Class Teacher"',
      defaultUnlocked: false
    },
    {
      id: "SENIOR_SLAYER",
      no: "#10",
      title: "Seniors Slayer",
      sub: "Defeat Stage 9 Senior",
      tier: "silver",
      icon: "⚡",
      feat: "Stage 9 me 8th class ke Heavy Trimax King Kabir ko dho daala!",
      bonus: "+350 Khiladi XP • Corridor Legend",
      note: '"8th class wale junior se haar gaye, ab canteen me muh chupayenge! - Corridor Gossip"',
      defaultUnlocked: false
    },
    {
      id: "SCHOOL_LEGEND",
      no: "#11",
      title: "School Legend",
      sub: "Cleared Stage 11 Grand Finale",
      tier: "gold",
      icon: "👑",
      feat: "Stage 11 School Grand Finale jeet kar Champion bane!",
      bonus: "+1000 Khiladi XP • Saraswati Gold Trophy",
      note: '"Annual Day par trophy di jayegi assembly me! - Principal Sir"',
      defaultUnlocked: false
    },
    {
      id: "SPIN_MASTER",
      no: "#12",
      title: "Cut-Shot Master",
      sub: "Curved Spin Trajectory",
      tier: "teal",
      icon: "🌪️",
      feat: "Dhakkan ya Nib ke tip par marke spin se opponent giraya!",
      bonus: "+190 Khiladi XP • Spin Mastery +15%",
      note: '"Curve trajectory dekhkar poori class ne table thoki! - Bench Mates"',
      defaultUnlocked: false
    },
    {
      id: "SWIFT_FINISH",
      no: "#13",
      title: "Rapid Duel",
      sub: "Win Match in <= 6 Flicks",
      tier: "slate",
      icon: "⏱️",
      feat: "Kul 6 ya usse kam total flicks me poora match jeeta!",
      bonus: "+220 Khiladi XP • Speed Demon",
      note: '"Pata hi nahi chala match kab shuru hua kab khatam! - Spectator"',
      defaultUnlocked: false
    },
    {
      id: "PERFECT_STREAK",
      no: "#14",
      title: "5 Win Streak",
      sub: "Won 5 Consecutive Matches",
      tier: "rose",
      icon: "🔥",
      feat: "Lagaatar 5 match bina haare jeete!",
      bonus: "+300 Khiladi XP • Hot Hands",
      note: '"Isko koi nahi rok sakta, unbeaten run chal rahi hai! - Classmate"',
      defaultUnlocked: false
    },
    {
      id: "DUAL_WARRIOR",
      no: "#15",
      title: "2-Player Dost",
      sub: "Play 3 Pass & Play Matches",
      tier: "blue",
      icon: "👥",
      feat: "Ek hi phone par 3 Pass & Play matches khele!",
      bonus: "+150 Khiladi XP • Best Friend",
      note: '"Dosti aur Pen Fight, dono saath-saath! - Tiwari Sir"',
      defaultUnlocked: false
    },
    {
      id: "COLLECTOR",
      no: "#16",
      title: "Compass Box Master",
      sub: "Used All 6 Battle Pens",
      tier: "amber",
      icon: "🧰",
      feat: "Sabhi 6 authorized school pens se kam se kam 1 match khela!",
      bonus: "+350 Khiladi XP • Master Collector",
      note: '"Camlin box me har brand ka hathiyar hai iske paas! - Monitor"',
      defaultUnlocked: false
    }
  ];

  const state = {
    visible: false,
    currentTab: 'trophies', // 'trophies' | 'settings'
    activeInspectId: null
  };

  const DOM = {};

  function cacheDOM() {
    DOM.overlay = document.getElementById('trophy-cabinet-overlay');
    if (!DOM.overlay) return false;

    DOM.tabTrophiesBtn = document.getElementById('cabinet-tab-trophies-btn');
    DOM.tabSettingsBtn = document.getElementById('cabinet-tab-settings-btn');
    DOM.viewTrophies = document.getElementById('cabinet-view-trophies');
    DOM.viewSettings = document.getElementById('cabinet-view-settings');

    DOM.pinGrid = document.getElementById('cabinet-pin-grid');
    DOM.pinsCountHeader = document.getElementById('cabinet-pins-count-header');
    DOM.pinsCountTab = document.getElementById('cabinet-pins-count-tab');
    DOM.studentName = document.getElementById('cabinet-student-name');
    DOM.studentRoll = document.getElementById('cabinet-student-roll');
    DOM.currentRank = document.getElementById('cabinet-current-rank');

    // Inspect Modal
    DOM.inspectModal = document.getElementById('pin-inspect-modal');
    DOM.inspectBadgeNo = document.getElementById('pin-inspect-badge-no');
    DOM.inspectIcon = document.getElementById('pin-inspect-icon');
    DOM.inspectTitle = document.getElementById('pin-inspect-title');
    DOM.inspectSub = document.getElementById('pin-inspect-sub');
    DOM.inspectStatusPill = document.getElementById('pin-inspect-status-pill');
    DOM.inspectFeat = document.getElementById('pin-inspect-feat');
    DOM.inspectBonus = document.getElementById('pin-inspect-bonus');
    DOM.inspectNote = document.getElementById('pin-inspect-note');
    DOM.inspectPinBtn = document.getElementById('pin-inspect-pin-btn');

    // Audio & Settings Elements
    DOM.sfxSlider = document.getElementById('setting-sfx-slider');
    DOM.sfxVal = document.getElementById('setting-sfx-val');
    DOM.ambianceSlider = document.getElementById('setting-ambiance-slider');
    DOM.ambianceVal = document.getElementById('setting-ambiance-val');
    DOM.whistleToggle = document.getElementById('setting-whistle-toggle');

    return true;
  }

  function getUnlockedBadgeIds() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('penfight_save_v2') || '{}'); } catch(e) {}
    const unlocked = new Set();

    // Default unlocks
    BADGES_METADATA.forEach(b => {
      if (b.defaultUnlocked) unlocked.add(b.id);
    });

    const savedBadges = (saved.progression && (saved.progression.unlockedBadges || saved.progression.badges)) || [];
    if (Array.isArray(savedBadges)) {
      savedBadges.forEach(id => unlocked.add(id));
    }
    return unlocked;
  }

  const trophyCabinetController = {
    show: function(initialTab = 'trophies') {
      if (!cacheDOM()) return;
      state.visible = true;

      // Close other conflicting overlays
      if (window.hudController) window.hudController.hide();
      if (window.matchResultController) window.matchResultController.hide();

      this.hydrateProfile();
      this.renderPinGrid();
      this.switchTab(initialTab);

      DOM.overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        DOM.overlay.classList.remove('cabinet-dismissed');
      });
    },

    hide: function() {
      if (!cacheDOM()) return;
      if (typeof window.showMainMenu === 'function') {
        window.showMainMenu();
      }
      DOM.overlay.classList.add('cabinet-dismissed');
      setTimeout(() => {
        DOM.overlay.style.display = 'none';
        state.visible = false;
      }, 300);
    },

    switchTab: function(tab) {
      if (!cacheDOM()) return;
      state.currentTab = tab;

      if (tab === 'trophies') {
        if (DOM.tabTrophiesBtn) {
          DOM.tabTrophiesBtn.className = "flex-1 py-2 px-3 rounded-xl bg-amber-200 border-2 border-slate-900 font-black text-[12px] text-slate-900 shadow-[0_2.5px_0_0_#0f172a] flex items-center justify-center gap-1.5 cursor-pointer";
        }
        if (DOM.tabSettingsBtn) {
          DOM.tabSettingsBtn.className = "flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 font-bold text-[12px] text-slate-700 shadow-[0_2px_0_0_#0f172a] flex items-center justify-center gap-1.5 cursor-pointer";
        }
        if (DOM.viewTrophies) DOM.viewTrophies.style.display = 'block';
        if (DOM.viewSettings) DOM.viewSettings.style.display = 'none';
      } else {
        if (DOM.tabTrophiesBtn) {
          DOM.tabTrophiesBtn.className = "flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 font-bold text-[12px] text-slate-700 shadow-[0_2px_0_0_#0f172a] flex items-center justify-center gap-1.5 cursor-pointer";
        }
        if (DOM.tabSettingsBtn) {
          DOM.tabSettingsBtn.className = "flex-1 py-2 px-3 rounded-xl bg-amber-200 border-2 border-slate-900 font-black text-[12px] text-slate-900 shadow-[0_2.5px_0_0_#0f172a] flex items-center justify-center gap-1.5 cursor-pointer";
        }
        if (DOM.viewTrophies) DOM.viewTrophies.style.display = 'none';
        if (DOM.viewSettings) DOM.viewSettings.style.display = 'block';
      }
    },

    hydrateProfile: function() {
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem('penfight_save_v2') || '{}'); } catch(e) {}
      const profile = saved.profile || {};
      const progression = saved.progression || {};

      if (DOM.studentName) DOM.studentName.textContent = (profile.name || 'Arjun "Thunder"').toUpperCase();
      if (DOM.studentRoll) DOM.studentRoll.textContent = `ROLL NO: #${profile.rollNo || '14'} | CLASS: 7TH - B`;

      const unlockedSet = getUnlockedBadgeIds();
      const countText = `${unlockedSet.size} of 16 Pins Pinned`;
      if (DOM.pinsCountHeader) DOM.pinsCountHeader.textContent = countText;
      if (DOM.pinsCountTab) DOM.pinsCountTab.textContent = `Trophies (${unlockedSet.size}/16)`;

      const rankTitle = (progression && progression.levelInfo && progression.levelInfo.title) || "BENCH KING";
      if (DOM.currentRank) DOM.currentRank.textContent = rankTitle.toUpperCase();
    },

    renderPinGrid: function() {
      if (!DOM.pinGrid) return;
      const unlockedSet = getUnlockedBadgeIds();

      DOM.pinGrid.innerHTML = BADGES_METADATA.map(b => {
        const isUnlocked = unlockedSet.has(b.id);
        const cardClass = isUnlocked ? "enamel-pin-unlocked" : "enamel-pin-locked";
        const pinCircleClass = isUnlocked ? `pin-${b.tier}` : "pin-locked";
        const statusBadge = isUnlocked
          ? `<span class="text-[8.5px] font-bold text-emerald-700 flex items-center gap-0.5"><span class="material-symbols-outlined text-[11px]">check_circle</span> Unlocked</span>`
          : `<span class="text-[8.5px] font-bold text-slate-500 flex items-center gap-0.5"><span class="material-symbols-outlined text-[11px]">lock</span> Locked</span>`;

        return `
          <div class="enamel-pin-card ${cardClass} p-2.5 rounded-xl flex flex-col justify-between gap-1 select-none" onclick="window.trophyCabinetController.openPinInspect('${b.id}')">
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 metallic-pin-circle ${pinCircleClass} text-lg shadow-sm">
                ${b.icon}
              </div>
              <span class="text-[8.5px] font-black text-slate-500" style="font-family: 'Patrick Hand', cursive;">${b.no}</span>
            </div>
            <div class="flex flex-col mt-1">
              <h4 class="font-black text-[11px] text-slate-900 leading-tight truncate" style="font-family: 'Permanent Marker', cursive;">
                ${b.title}
              </h4>
              <p class="text-[8.5px] font-bold text-slate-600 leading-tight mt-0.5 line-clamp-2" style="font-family: 'Patrick Hand', cursive;">
                ${b.sub}
              </p>
            </div>
            <div class="mt-1 pt-1 border-t border-slate-200 flex items-center justify-between">
              ${statusBadge}
            </div>
          </div>
        `;
      }).join('');
    },

    openPinInspect: function(badgeId) {
      if (!cacheDOM()) return;
      const badge = BADGES_METADATA.find(b => b.id === badgeId) || BADGES_METADATA[0];
      state.activeInspectId = badge.id;

      const unlockedSet = getUnlockedBadgeIds();
      const isUnlocked = unlockedSet.has(badge.id);

      if (DOM.inspectBadgeNo) DOM.inspectBadgeNo.textContent = `PIN ${badge.no}`;
      if (DOM.inspectIcon) {
        DOM.inspectIcon.className = `w-14 h-14 metallic-pin-circle ${isUnlocked ? `pin-${badge.tier}` : 'pin-locked'} text-3xl mx-auto shadow-md`;
        DOM.inspectIcon.textContent = badge.icon;
      }
      if (DOM.inspectTitle) DOM.inspectTitle.textContent = badge.title;
      if (DOM.inspectSub) DOM.inspectSub.textContent = badge.sub;
      if (DOM.inspectFeat) DOM.inspectFeat.textContent = `"${badge.feat}"`;
      if (DOM.inspectBonus) DOM.inspectBonus.textContent = badge.bonus;
      if (DOM.inspectNote) DOM.inspectNote.textContent = badge.note;

      if (DOM.inspectStatusPill) {
        DOM.inspectStatusPill.className = isUnlocked 
          ? "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-[10px] font-black uppercase"
          : "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-400 text-slate-700 text-[10px] font-black uppercase";
        DOM.inspectStatusPill.innerHTML = isUnlocked
          ? `<span class="material-symbols-outlined text-[13px]">military_tech</span> UNLOCKED & PINNED TO SHIRT`
          : `<span class="material-symbols-outlined text-[13px]">lock</span> LOCKED BY CLASSROOM REPUTATION`;
      }

      if (DOM.inspectModal) {
        DOM.inspectModal.style.display = 'flex';
        requestAnimationFrame(() => DOM.inspectModal.classList.remove('inspect-dismissed'));
      }
    },

    closePinInspect: function() {
      if (!cacheDOM() || !DOM.inspectModal) return;
      DOM.inspectModal.classList.add('inspect-dismissed');
      setTimeout(() => {
        DOM.inspectModal.style.display = 'none';
        state.activeInspectId = null;
      }, 200);
    },

    pinToBadge: function() {
      if (!state.activeInspectId) return;
      alert(`📌 Badge "${state.activeInspectId}" pinned to your student profile!`);
      this.closePinInspect();
    },

    testSound: function() {
      if (window.gameEngine && window.gameEngine.synth) {
        window.gameEngine.synth.playClack();
      } else {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        } catch(e) {}
      }
    },

    updateAudioSetting: function(type, val) {
      if (type === 'sfx' && DOM.sfxVal) DOM.sfxVal.textContent = `${val}%`;
      if (type === 'ambiance' && DOM.ambianceVal) DOM.ambianceVal.textContent = `${val}%`;
    },

    resetCareerData: function() {
      const confirmed = confirm("⚠️ RED INK DANGER ZONE!\n\nKya aap sach me poora record, unlocked pins aur points delete karna chahte hain?");
      if (!confirmed) return;

      try {
        localStorage.removeItem('penfight_save_v2');
      } catch(e) {}

      if (window.gameEngine && typeof window.gameEngine.clearAllData === 'function') {
        window.gameEngine.clearAllData();
      }

      alert("✅ Student record erased. Refreshing classroom register!");
      window.location.reload();
    },

    onLanguageChange: function(lang) {
      if (!DOM.root) cacheDOMElements();
      if (DOM.root && DOM.root.style.display !== 'none') {
        this.renderPinGrid();
        this.renderMilestones();
        this.renderRules();
      }
    }
  };

  window.trophyCabinetController = trophyCabinetController;

  // Global helper aliases for HTML inline onclick/oninput
  window.showTrophyCabinet = function(tab) {
    trophyCabinetController.show(tab);
  };
  window.hideTrophyCabinet = function() {
    trophyCabinetController.hide();
  };
  window.switchDeskTab = function(tab) {
    trophyCabinetController.switchTab(tab);
  };
  window.closePinModal = function() {
    trophyCabinetController.closePinInspect();
  };
  window.openPinInspect = function(id) {
    trophyCabinetController.openPinInspect(id);
  };
  window.pinBadgeAction = function() {
    trophyCabinetController.pinToBadge();
  };
  window.playClashSample = function() {
    trophyCabinetController.testSound();
  };
  window.updateSFX = function(v) {
    trophyCabinetController.updateAudioSetting('sfx', v);
  };
  window.updateAmbiance = function(v) {
    trophyCabinetController.updateAudioSetting('ambiance', v);
  };
  window.confirmResetProgress = function() {
    trophyCabinetController.resetCareerData();
  };
  window.toggleSwitch = function(btn) {
    if (!btn) return;
    const dot = btn.querySelector('span');
    const isOff = btn.classList.contains('bg-slate-300') || btn.classList.contains('bg-surface-container-highest');
    if (isOff) {
      btn.className = "w-12 h-6 px-0.5 rounded-full bg-amber-300 flex items-center justify-end transition-colors flex-shrink-0 shadow-inner border border-amber-600";
      if (dot) dot.className = "w-5 h-5 rounded-full bg-amber-800 shadow-md transform transition-transform";
    } else {
      btn.className = "w-12 h-6 px-0.5 rounded-full bg-slate-300 flex items-center justify-start transition-colors flex-shrink-0 shadow-inner border border-slate-500";
      if (dot) dot.className = "w-5 h-5 rounded-full bg-slate-600 shadow-md transform transition-transform";
    }
  };
})();
