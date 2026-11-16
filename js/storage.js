/**
 * js/storage.js - Offline LocalStorage Persistence & State Hydration
 * Phase 2, Step 2.5
 * 
 * Invariants:
 * - 100% Offline, zero external network or telemetry calls (Google Play Families Data Safety compliant)
 * - Versioned schema (`penfight_save_v2`) with automatic migration/corrupt fallback
 * - Two-way state hydration: Loads on boot into memory, auto-saves on match end & config changes
 * - Dev reset utility (`clearSaveData()`) for clean testing
 */

const STORAGE_KEY = 'penfight_save_v2';
const CURRENT_SCHEMA_VERSION = 2;

export const DEFAULT_SAVE_STATE = {
  version: CURRENT_SCHEMA_VERSION,
  profile: {
    name: "Student Fighter",
    selectedPlayerPen: "reynolds045",
    selectedOpponentPen: "trimax"
  },
  progression: {
    xp: 0,
    currentStageId: 1,
    highestStageUnlocked: 1,
    matchesPlayed: 0,
    matchesWon: 0,
    winStreak: 0,
    highestWinStreak: 0,
    edgeSaves: 0,
    passAndPlayCount: 0,
    pensUsed: ['reynolds045'],
    unlockedBadges: []
  },
  unlockedPens: ['reynolds045', 'nataraj621'], // Default starting pens
  settings: {
    mode: 'bot',
    difficulty: 'normal',
    soundEnabled: true
  },
  lastSavedAt: null
};

export class StorageManager {
  constructor(storageKey = STORAGE_KEY) {
    this.storageKey = storageKey;
    this.cachedState = null;
  }

  /**
   * Check if localStorage is available in current environment
   */
  isAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__pf_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load and hydrate saved state from localStorage
   * @returns {object} validated and hydrated state
   */
  load() {
    if (!this.isAvailable()) {
      this.cachedState = JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
      return this.cachedState;
    }

    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        // Check for legacy v1 migration if present
        const legacyRaw = window.localStorage.getItem('penfight_career_v1');
        if (legacyRaw) {
          const legacy = JSON.parse(legacyRaw);
          const migrated = JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
          migrated.progression.xp = legacy.xp || 0;
          migrated.progression.matchesPlayed = legacy.matchesPlayed || 0;
          migrated.progression.matchesWon = legacy.matchesWon || 0;
          migrated.progression.unlockedBadges = legacy.unlockedTrophies || [];
          this.cachedState = migrated;
          this.save(this.cachedState);
          return this.cachedState;
        }

        this.cachedState = JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
        return this.cachedState;
      }

      const parsed = JSON.parse(raw);
      this.cachedState = this._sanitizeAndMigrate(parsed);
      return this.cachedState;
    } catch (err) {
      console.warn("StorageManager: Failed to parse save data, falling back to default.", err);
      this.cachedState = JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
      return this.cachedState;
    }
  }

  /**
   * Save state to localStorage
   * @param {object} partialState - Full or partial state to merge and persist
   * @returns {boolean} true if save succeeded
   */
  save(partialState = {}) {
    if (!this.isAvailable()) return false;

    try {
      const current = this.cachedState || this.load();
      const updated = {
        ...current,
        ...partialState,
        profile: { ...current.profile, ...(partialState.profile || {}) },
        progression: { ...current.progression, ...(partialState.progression || {}) },
        settings: { ...current.settings, ...(partialState.settings || {}) },
        unlockedPens: partialState.unlockedPens || current.unlockedPens || DEFAULT_SAVE_STATE.unlockedPens,
        lastSavedAt: Date.now(),
        version: CURRENT_SCHEMA_VERSION
      };

      window.localStorage.setItem(this.storageKey, JSON.stringify(updated));
      this.cachedState = updated;
      return true;
    } catch (err) {
      console.error("StorageManager: Failed to save game state.", err);
      return false;
    }
  }

  /**
   * Sanitize parsed JSON against default schema
   */
  _sanitizeAndMigrate(parsed) {
    if (!parsed || typeof parsed !== 'object') {
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
    }

    const state = JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));

    // Profile
    if (parsed.profile) {
      state.profile.name = String(parsed.profile.name || state.profile.name);
      state.profile.selectedPlayerPen = String(parsed.profile.selectedPlayerPen || state.profile.selectedPlayerPen);
      state.profile.selectedOpponentPen = String(parsed.profile.selectedOpponentPen || state.profile.selectedOpponentPen);
    }

    // Progression
    if (parsed.progression) {
      state.progression.xp = Math.max(0, Number(parsed.progression.xp) || 0);
      state.progression.currentStageId = Math.max(1, Math.min(11, Number(parsed.progression.currentStageId) || 1));
      state.progression.highestStageUnlocked = Math.max(1, Math.min(11, Number(parsed.progression.highestStageUnlocked) || 1));
      state.progression.matchesPlayed = Math.max(0, Number(parsed.progression.matchesPlayed) || 0);
      state.progression.matchesWon = Math.max(0, Number(parsed.progression.matchesWon) || 0);
      state.progression.winStreak = Math.max(0, Number(parsed.progression.winStreak) || 0);
      state.progression.highestWinStreak = Math.max(0, Number(parsed.progression.highestWinStreak) || 0);
      state.progression.edgeSaves = Math.max(0, Number(parsed.progression.edgeSaves) || 0);
      state.progression.passAndPlayCount = Math.max(0, Number(parsed.progression.passAndPlayCount) || 0);
      state.progression.pensUsed = Array.isArray(parsed.progression.pensUsed) ? parsed.progression.pensUsed : ['reynolds045'];
      state.progression.unlockedBadges = Array.isArray(parsed.progression.unlockedBadges) ? parsed.progression.unlockedBadges : [];
    }

    // Unlocked Pens
    if (Array.isArray(parsed.unlockedPens)) {
      state.unlockedPens = Array.from(new Set([...state.unlockedPens, ...parsed.unlockedPens]));
    }

    // Settings
    if (parsed.settings) {
      state.settings.mode = ['bot', 'pass_and_play'].includes(parsed.settings.mode) ? parsed.settings.mode : 'bot';
      state.settings.difficulty = ['easy', 'normal', 'hard'].includes(parsed.settings.difficulty) ? parsed.settings.difficulty : 'normal';
      state.settings.soundEnabled = parsed.settings.soundEnabled !== false;
    }

    return state;
  }

  /**
   * Reset save data to pristine defaults
   */
  clear() {
    if (this.isAvailable()) {
      try {
        window.localStorage.removeItem(this.storageKey);
      } catch (e) {}
    }
    this.cachedState = JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
    return this.cachedState;
  }
}

export const storage = new StorageManager();
