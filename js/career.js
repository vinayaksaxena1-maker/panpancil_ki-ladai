// Local Career & Trophy Progression System for Pen Fight: Desk Wars
// 100% Offline, Persistent via localStorage

const STORAGE_KEY = 'penfight_career_v1';

export const TROPHIES = {
  FIRST_WIN: { id: 'FIRST_WIN', title: 'Pehli Jeet', desc: 'Pehli baar bot ko match me haraya!' },
  CLEAN_SWEEP: { id: 'CLEAN_SWEEP', title: 'Clean Sweep (3-0)', desc: 'Bina ek bhi round haare 3-0 se match jeeta!' },
  HARD_CHAMPION: { id: 'HARD_CHAMPION', title: 'Class Topper', desc: 'Hard mode me bot ko dho daala!' },
  COMEBACK_KING: { id: 'COMEBACK_KING', title: 'Comeback King', desc: '0-2 se pichhad kar 3-2 se match jeeta!' }
};

export const TITLES = [
  { xp: 0, title: 'Naya Khiladi' },
  { xp: 200, title: 'Front Bencher' },
  { xp: 500, title: 'Middle Row Fighter' },
  { xp: 1000, title: 'Last Bench Legend' },
  { xp: 2000, title: 'School Principal' }
];

export class CareerManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      xp: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      unlockedTrophies: []
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  }

  getTitle() {
    let current = TITLES[0].title;
    for (const t of TITLES) {
      if (this.data.xp >= t.xp) current = t.title;
    }
    return current;
  }

  recordMatch(p1Score, botScore, difficulty, roundHistory = []) {
    this.data.matchesPlayed++;
    const isWin = p1Score >= 3;
    const newTrophies = [];

    if (isWin) {
      this.data.matchesWon++;
      let earnedXp = difficulty === 'hard' ? 200 : (difficulty === 'normal' ? 100 : 60);

      // 1. Clean Sweep Bonus (3-0)
      if (botScore === 0) {
        earnedXp += 75;
        if (!this.data.unlockedTrophies.includes('CLEAN_SWEEP')) {
          this.data.unlockedTrophies.push('CLEAN_SWEEP');
          newTrophies.push(TROPHIES.CLEAN_SWEEP);
        }
      }

      // 2. First Win
      if (!this.data.unlockedTrophies.includes('FIRST_WIN')) {
        this.data.unlockedTrophies.push('FIRST_WIN');
        newTrophies.push(TROPHIES.FIRST_WIN);
      }

      // 3. Hard Champion
      if (difficulty === 'hard' && !this.data.unlockedTrophies.includes('HARD_CHAMPION')) {
        this.data.unlockedTrophies.push('HARD_CHAMPION');
        newTrophies.push(TROPHIES.HARD_CHAMPION);
      }

      // 4. Comeback King (Lost first 2 rounds then won next 3)
      if (roundHistory && roundHistory.length === 5 && roundHistory[0] === 'bot' && roundHistory[1] === 'bot') {
        earnedXp += 100;
        if (!this.data.unlockedTrophies.includes('COMEBACK_KING')) {
          this.data.unlockedTrophies.push('COMEBACK_KING');
          newTrophies.push(TROPHIES.COMEBACK_KING);
        }
      }

      this.data.xp += earnedXp;
      this.save();
      return { isWin: true, earnedXp, newTrophies, currentXp: this.data.xp, title: this.getTitle() };
    } else {
      // Small consolation XP for playing match
      const earnedXp = 25;
      this.data.xp += earnedXp;
      this.save();
      return { isWin: false, earnedXp, newTrophies: [], currentXp: this.data.xp, title: this.getTitle() };
    }
  }
}

export const career = new CareerManager();
