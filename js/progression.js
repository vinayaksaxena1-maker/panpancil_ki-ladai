/**
 * js/progression.js - 11-Level Progression & 16 Badges Ledger
 * Phase 2, Step 2.4
 * 
 * Invariants:
 * - 11 Campaign Stages grouped into 4 Tiers (Class 7-A -> Inter-Section -> Seniors -> School Final)
 * - 16 Authentic Indian School Badges
 * - Deterministic XP kinematics: Win (+50), Sweep (+75 bonus), Loss (+15)
 * - 11 Progression Levels from 'New Admission' to 'School Pen Fight Legend'
 * - Pure modular logic decoupled from rendering (suitable for unit testing & persistence)
 */

export const CAMPAIGN_STAGES = [
  // Tier 1: Class 7-A (Home Ground)
  {
    id: 1,
    tier: 1,
    tierName: "Class 7-A (Home Turf)",
    name: "Last Bench Duel",
    opponentName: "Bunty (Backbencher)",
    opponentPen: "nataraj621",
    difficulty: "easy",
    unlockXp: 0,
    desc: "First period free hai. Bunty ne lunch se pehle challenge de diya!"
  },
  {
    id: 2,
    tier: 1,
    tierName: "Class 7-A (Home Turf)",
    name: "Middle Row Rival",
    opponentName: "Rohan (Geometry Box King)",
    opponentPen: "reynolds045",
    difficulty: "normal",
    unlockXp: 80,
    desc: "Rohan ke paas classic 045 white pen hai, nishana kaafi seedha hai."
  },
  {
    id: 3,
    tier: 1,
    tierName: "Class 7-A (Home Turf)",
    name: "Section 7-A Monitor (Boss)",
    opponentName: "Aditya (Class Monitor)",
    opponentPen: "butterflow",
    difficulty: "hard",
    unlockXp: 200,
    desc: "Monitor ki Butterflow slip hoti hai table pe. Isko harakar class ka hero bano!"
  },

  // Tier 2: Inter-Section Knockouts (Class 7-B & 7-C)
  {
    id: 4,
    tier: 2,
    tierName: "Inter-Section Knockouts",
    name: "7-B Lunch Break Challenger",
    opponentName: "Sameer (7-B Power Hitter)",
    opponentPen: "reynolds045",
    difficulty: "normal",
    unlockXp: 350,
    desc: "Recess bell baji hai. 7-B wale humari class me aakar duel maang rahe hain."
  },
  {
    id: 5,
    tier: 2,
    tierName: "Inter-Section Knockouts",
    name: "7-C Specialist",
    opponentName: "Farhan (7-C Spin Master)",
    opponentPen: "pilotV5",
    difficulty: "normal",
    unlockXp: 550,
    desc: "Farhan Pilot V5 ki point-spin se edge shots maarta hai."
  },
  {
    id: 6,
    tier: 2,
    tierName: "Inter-Section Knockouts",
    name: "Class 7 Overall Champion (Boss)",
    opponentName: "Vikram (7th Grade Topper)",
    opponentPen: "pilotV5",
    difficulty: "hard",
    unlockXp: 800,
    desc: "Poori 7th class ka sabse khatarnak khiladi. Jeetne par Seniors ko challenge milega."
  },

  // Tier 3: The Seniors Duel (Class 8-A, 8-B, 8-C)
  {
    id: 7,
    tier: 3,
    tierName: "The Seniors Duel (8th Grade)",
    name: "8-A Frontbencher",
    opponentName: "Nikhil (8-A Senior)",
    opponentPen: "butterflow",
    difficulty: "normal",
    unlockXp: 1100,
    desc: "Senior keh rahe hain 7th wale bachhe hain. Dikha do unhe!"
  },
  {
    id: 8,
    tier: 3,
    tierName: "The Seniors Duel (8th Grade)",
    name: "8-B Backbencher Gang",
    opponentName: "Rocky (8-B Heavyweight)",
    opponentPen: "trimax",
    difficulty: "hard",
    unlockXp: 1500,
    desc: "Rocky bhari Trimax chalata hai, table par zor ka thud padta hai."
  },
  {
    id: 9,
    tier: 3,
    tierName: "The Seniors Duel (8th Grade)",
    name: "8-C Heavy Trimax King (Boss)",
    opponentName: "Kabir (Seniors Captain)",
    opponentPen: "trimax",
    difficulty: "hard",
    unlockXp: 2000,
    desc: "Kabir ki Trimax ko rokna namumkin lagta hai. Tactical spin shots use karo!"
  },

  // Tier 4: School Grand Finale
  {
    id: 10,
    tier: 4,
    tierName: "School Grand Finale",
    name: "Staff Room Corridor Cup",
    opponentName: "Arjun (Last Year Runner-Up)",
    opponentPen: "apsaraPlatinum",
    difficulty: "hard",
    unlockXp: 2600,
    desc: "Staff room ke bahar ki bench par duel. Teachers round laga rahe hain, chupke khelo!"
  },
  {
    id: 11,
    tier: 4,
    tierName: "School Grand Finale",
    name: "School Championship Final (Grand Boss)",
    opponentName: "Dev (The School Legend)",
    opponentPen: "trimax",
    difficulty: "hard",
    unlockXp: 3300,
    desc: "Poore school ka Grand Finale! Desk Wars ki Ultimate Trophy ka faisla yahin hoga."
  }
];

export const LEVELS = [
  { level: 1, minXp: 0, title: "Naya Admission", badgeIcon: "🎒" },
  { level: 2, minXp: 100, title: "Front Bencher", badgeIcon: "✏️" },
  { level: 3, minXp: 250, title: "Notebook Scribbler", badgeIcon: "📒" },
  { level: 4, minXp: 450, title: "Middle Row Rival", badgeIcon: "📏" },
  { level: 5, minXp: 700, title: "Lunch Break Champ", badgeIcon: "🥪" },
  { level: 6, minXp: 1050, title: "Section 7-A Topper", badgeIcon: "🎖️" },
  { level: 7, minXp: 1500, title: "Last Bench Specialist", badgeIcon: "🕶️" },
  { level: 8, minXp: 2050, title: "Senior Challenger", badgeIcon: "⚡" },
  { level: 9, minXp: 2700, title: "Trimax Veteran", badgeIcon: "🖊️" },
  { level: 10, minXp: 3450, title: "Corridor Cup Master", badgeIcon: "🏆" },
  { level: 11, minXp: 4300, title: "School Pen Fight Legend", badgeIcon: "👑" }
];

export const BADGES = {
  FIRST_BLOOD: {
    id: "FIRST_BLOOD",
    title: "Pehli Jeet",
    icon: "🩸",
    desc: "Pehli baar kisi match me jeet darj ki!"
  },
  CLEAN_SWEEP: {
    id: "CLEAN_SWEEP",
    title: "3-0 White Wash",
    icon: "🧹",
    desc: "Bina ek bhi round haare 3-0 se match jeeta!"
  },
  COMEBACK_HERO: {
    id: "COMEBACK_HERO",
    title: "0-2 se Palatwar",
    icon: "🔄",
    desc: "Pehle 2 round haar kar agle 3 jeet kar match palat diya!"
  },
  EDGE_SURVIVOR: {
    id: "EDGE_SURVIVOR",
    title: "Desk Edge Clutch",
    icon: "🧗",
    desc: "Desk ke bilkul kinar par bachkar round jeeta!"
  },
  HARD_CHAMPION: {
    id: "HARD_CHAMPION",
    title: "Class Topper",
    icon: "🥇",
    desc: "Hard difficulty bot ko duel me dho daala!"
  },
  HEAVY_KNOCKOUT: {
    id: "HEAVY_KNOCKOUT",
    title: "Trimax Blast",
    icon: "💥",
    desc: "Bhari Trimax ya Nataraj pen se opponent ko uda diya!"
  },
  IRON_DEFENSE: {
    id: "IRON_DEFENSE",
    title: "Loha Shield",
    icon: "🛡️",
    desc: "Poore match me ek baar bhi pen desk se neeche nahi giri!"
  },
  MONITOR_DETHRONED: {
    id: "MONITOR_DETHRONED",
    title: "Class Monitor Down",
    icon: "📉",
    desc: "Stage 3 me Class 7-A ke Monitor ko haraya!"
  },
  INTERSECTION_HERO: {
    id: "INTERSECTION_HERO",
    title: "Inter-Section Hero",
    icon: "⚔️",
    desc: "Stage 6 me Class 7 Overall Champion ko hara kar 7th jeeti!"
  },
  SENIOR_SLAYER: {
    id: "SENIOR_SLAYER",
    title: "Seniors Slayer",
    icon: "⚡",
    desc: "Stage 9 me 8th class ke Heavy Trimax King ko dho daala!"
  },
  SCHOOL_LEGEND: {
    id: "SCHOOL_LEGEND",
    title: "School Legend",
    icon: "👑",
    desc: "Stage 11 School Grand Finale jeet kar Champion bane!"
  },
  SPIN_MASTER: {
    id: "SPIN_MASTER",
    title: "Cut-Shot Master",
    icon: "🌪️",
    desc: "Dhakkan ya Nib ke tip par marke spin se opponent giraya!"
  },
  SWIFT_FINISH: {
    id: "SWIFT_FINISH",
    title: "Rapid Duel",
    icon: "⏱️",
    desc: "Kul 6 ya usse kam total flicks me poora match jeeta!"
  },
  PERFECT_STREAK: {
    id: "PERFECT_STREAK",
    title: "5 Win Streak",
    icon: "🔥",
    desc: "Lagaatar 5 match bina haare jeete!"
  },
  DUAL_WARRIOR: {
    id: "DUAL_WARRIOR",
    title: "2-Player Dost",
    icon: "👥",
    desc: "Ek hi phone par 3 Pass & Play matches khele!"
  },
  COLLECTOR: {
    id: "COLLECTOR",
    title: "Compass Box Master",
    icon: "🧰",
    desc: "Sabhi 6 authorized school pens se kam se kam 1 match khela!"
  }
};

export class ProgressionEngine {
  constructor(initialState = {}) {
    this.xp = initialState.xp || 0;
    this.currentStageId = initialState.currentStageId || 1;
    this.highestStageUnlocked = initialState.highestStageUnlocked || 1;
    this.matchesPlayed = initialState.matchesPlayed || 0;
    this.matchesWon = initialState.matchesWon || 0;
    this.winStreak = initialState.winStreak || 0;
    this.highestWinStreak = initialState.highestWinStreak || 0;
    this.passAndPlayCount = initialState.passAndPlayCount || 0;
    this.pensUsed = new Set(initialState.pensUsed || ['reynolds045']);
    this.unlockedBadges = new Set(initialState.unlockedBadges || []);
  }

  getCurrentLevel() {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
      if (this.xp >= lvl.minXp) {
        current = lvl;
      } else {
        break;
      }
    }
    const nextLevel = LEVELS.find(l => l.level === current.level + 1) || null;
    const progressToNext = nextLevel
      ? Math.min(Math.max((this.xp - current.minXp) / (nextLevel.minXp - current.minXp), 0), 1)
      : 1.0;

    return {
      level: current.level,
      title: current.title,
      icon: current.badgeIcon,
      currentXp: this.xp,
      levelMinXp: current.minXp,
      nextLevelMinXp: nextLevel ? nextLevel.minXp : current.minXp,
      progress: progressToNext
    };
  }

  getStage(stageId = this.currentStageId) {
    return CAMPAIGN_STAGES.find(s => s.id === stageId) || CAMPAIGN_STAGES[0];
  }

  isStageUnlocked(stageId) {
    const stage = this.getStage(stageId);
    if (!stage) return false;
    return stageId <= this.highestStageUnlocked || this.xp >= stage.unlockXp;
  }

  /**
   * Process match completion and calculate rewards
   * @param {object} context - Match parameters and stats
   * @returns {object} progression update payload
   */
  processMatchEnd(context) {
    const {
      isWin,
      score = { player: 3, opponent: 0 },
      difficulty = 'normal',
      mode = 'bot',
      stageId = this.currentStageId,
      playerPen = 'reynolds045',
      totalFlicks = 8,
      roundHistory = [], // array of winners per round: ['player', 'opponent', ...]
      clutchEdgeSurvived = false,
      playerFellAnyRound = false,
      hasSpinFlick = false
    } = context;

    this.matchesPlayed++;
    this.pensUsed.add(playerPen);

    if (mode === 'pass_and_play') {
      this.passAndPlayCount++;
    }

    let earnedXp = 0;
    const newBadges = [];

    if (isWin) {
      this.matchesWon++;
      this.winStreak++;
      if (this.winStreak > this.highestWinStreak) {
        this.highestWinStreak = this.winStreak;
      }

      // Base XP
      earnedXp += 50;

      // Clean Sweep Bonus (3-0)
      const isCleanSweep = score.opponent === 0;
      if (isCleanSweep) {
        earnedXp += 75;
      }

      // Difficulty bonus
      if (difficulty === 'hard') earnedXp += 30;
      else if (difficulty === 'normal') earnedXp += 15;

      // Stage completion bonus
      earnedXp += Math.min(stageId * 15, 150);

      // Advance campaign if playing current highest unlocked stage
      if (stageId === this.highestStageUnlocked && stageId < CAMPAIGN_STAGES.length) {
        this.highestStageUnlocked = stageId + 1;
        this.currentStageId = stageId + 1;
      } else if (isWin && stageId < CAMPAIGN_STAGES.length) {
        this.currentStageId = stageId + 1;
      }

      // Evaluate Badges
      this._checkBadge('FIRST_BLOOD', newBadges);

      if (isCleanSweep) {
        this._checkBadge('CLEAN_SWEEP', newBadges);
      }

      // Comeback: Lost first 2 rounds then won next 3 (0-2 -> 3-2)
      if (roundHistory.length === 5 && roundHistory[0] === 'opponent' && roundHistory[1] === 'opponent') {
        this._checkBadge('COMEBACK_HERO', newBadges);
      }

      if (clutchEdgeSurvived) {
        this._checkBadge('EDGE_SURVIVOR', newBadges);
      }

      if (difficulty === 'hard') {
        this._checkBadge('HARD_CHAMPION', newBadges);
      }

      if (['trimax', 'nataraj621'].includes(playerPen)) {
        this._checkBadge('HEAVY_KNOCKOUT', newBadges);
      }

      if (!playerFellAnyRound) {
        this._checkBadge('IRON_DEFENSE', newBadges);
      }

      if (stageId === 3) {
        this._checkBadge('MONITOR_DETHRONED', newBadges);
      }

      if (stageId === 6) {
        this._checkBadge('INTERSECTION_HERO', newBadges);
      }

      if (stageId === 9) {
        this._checkBadge('SENIOR_SLAYER', newBadges);
      }

      if (stageId === 11) {
        this._checkBadge('SCHOOL_LEGEND', newBadges);
      }

      if (hasSpinFlick) {
        this._checkBadge('SPIN_MASTER', newBadges);
      }

      if (totalFlicks <= 6) {
        this._checkBadge('SWIFT_FINISH', newBadges);
      }

      if (this.winStreak >= 5) {
        this._checkBadge('PERFECT_STREAK', newBadges);
      }
    } else {
      // Consolation XP on loss
      this.winStreak = 0;
      earnedXp += 15;
    }

    if (this.passAndPlayCount >= 3) {
      this._checkBadge('DUAL_WARRIOR', newBadges);
    }

    if (this.pensUsed.size >= 6) {
      this._checkBadge('COLLECTOR', newBadges);
    }

    this.xp += earnedXp;

    return {
      isWin,
      earnedXp,
      totalXp: this.xp,
      levelInfo: this.getCurrentLevel(),
      newBadges,
      highestStageUnlocked: this.highestStageUnlocked,
      winStreak: this.winStreak,
      matchesWon: this.matchesWon,
      matchesPlayed: this.matchesPlayed
    };
  }

  _checkBadge(badgeId, collectedArray) {
    if (!this.unlockedBadges.has(badgeId) && BADGES[badgeId]) {
      this.unlockedBadges.add(badgeId);
      collectedArray.push(BADGES[badgeId]);
    }
  }

  getState() {
    return {
      xp: this.xp,
      currentStageId: this.currentStageId,
      highestStageUnlocked: this.highestStageUnlocked,
      matchesPlayed: this.matchesPlayed,
      matchesWon: this.matchesWon,
      winStreak: this.winStreak,
      highestWinStreak: this.highestWinStreak,
      passAndPlayCount: this.passAndPlayCount,
      pensUsed: Array.from(this.pensUsed),
      unlockedBadges: Array.from(this.unlockedBadges)
    };
  }

  reset() {
    this.xp = 0;
    this.currentStageId = 1;
    this.highestStageUnlocked = 1;
    this.matchesPlayed = 0;
    this.matchesWon = 0;
    this.winStreak = 0;
    this.highestWinStreak = 0;
    this.passAndPlayCount = 0;
    this.pensUsed = new Set(['reynolds045']);
    this.unlockedBadges = new Set();
  }
}
