// js/audio_manager.js - Central Sound & Ambience Manager for Pen Fight: Desk Wars
// Manages 100% offline audio pooling, dynamic velocity scaling, classroom ambience, and synth fallbacks

import { audioSynth } from './audio_synth.js';

class AudioManager {
  constructor() {
    this.soundEnabled = true;
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.ambianceVolume = 0.45;

    this.unlocked = false;
    this.channelPools = {};
    this.arenaAmbienceAudio = null;
    this.isDucked = false;
    this.isAmbienceActive = false;
    this._duckTimeout = null;
    this._lastClickTime = 0;

    // Standardized 11-Event Sound Mapping
    this.soundRegistry = {
      flick: { src: 'assets/audio/sfx_flick.mp3', poolSize: 2, fallback: (opts) => audioSynth.playFlick(opts?.power) },
      impact: { src: 'assets/audio/sfx_impact.mp3', poolSize: 4, fallback: (opts) => audioSynth.playImpact(opts?.impulse) },
      slide: { src: 'assets/audio/sfx_wood_slide.mp3', poolSize: 2, fallback: (opts) => audioSynth.playThud(opts?.velocity || 0.5) },
      fall: { src: 'assets/audio/sfx_desk_fall.mp3', poolSize: 2, fallback: (opts) => audioSynth.playThud(opts?.velocity || 1.8) },
      ui_click: { fallback: () => audioSynth.playClick() },
      round_win: { src: 'assets/audio/cheer.mp3', poolSize: 1, fallback: () => audioSynth.playBell() },
      round_loss: { src: 'assets/audio/boo.mp3', poolSize: 1, fallback: () => audioSynth.playThud(2.0) },
      match_bell: { src: 'assets/audio/school-bell.mp3', poolSize: 1, fallback: () => audioSynth.playBell() },
      level_up: { src: 'assets/audio/sfx_level_up.mp3', poolSize: 1, fallback: () => audioSynth.playBell() },
      badge_unlock: { src: 'assets/audio/sfx_badge_unlock.mp3', poolSize: 1, fallback: () => audioSynth.playClick() },
      arena_ambience: { src: 'assets/audio/school-hubbub.mp3', loop: true }
    };

    this.initMobileUnlock();
    this.initLifecycleListeners();
    this.syncFromStorage();
  }

  // 1. Mobile First-Touch Gesture Unlock Gate
  initMobileUnlock() {
    const unlockHandler = () => {
      this.unlockAudio();
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('touchend', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
  }

  unlockAudio() {
    audioSynth.init();
    if (audioSynth.ctx && audioSynth.ctx.state === 'running') {
      this.unlocked = true;
    }
  }

  // App Lifecycle / Background Tab Audio Management
  initLifecycleListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // App minimized or screen locked: pause background audio
          if (this.arenaAmbienceAudio) {
            this.arenaAmbienceAudio.pause();
          }
          if (audioSynth.ctx && audioSynth.ctx.state === 'running') {
            audioSynth.ctx.suspend().catch(() => {});
          }
        } else {
          // App resumed: restore ambience if active
          if (this.soundEnabled && this.isAmbienceActive && this.arenaAmbienceAudio) {
            this.arenaAmbienceAudio.play().catch(() => {});
          }
          if (audioSynth.ctx && audioSynth.ctx.state === 'suspended') {
            audioSynth.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  // 2. Sync with existing game storage settings
  syncFromStorage() {
    try {
      const saved = localStorage.getItem('penfight_save_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.settings) {
          if (typeof parsed.settings.soundEnabled === 'boolean') {
            this.setSoundEnabled(parsed.settings.soundEnabled);
          }
          if (typeof parsed.settings.sfxVolume === 'number') {
            this.setSFXVolume(parsed.settings.sfxVolume);
          }
          if (typeof parsed.settings.ambianceVolume === 'number') {
            this.setAmbianceVolume(parsed.settings.ambianceVolume);
          }
        }
      }
    } catch (e) {}
  }

  // Volume & Settings Setters
  setSoundEnabled(enabled) {
    this.soundEnabled = !!enabled;
    audioSynth.setMuted(!this.soundEnabled);

    if (!this.soundEnabled) {
      if (this.arenaAmbienceAudio) {
        this.arenaAmbienceAudio.pause();
      }
      clearTimeout(this._duckTimeout);
      this.isDucked = false;
    } else if (this.arenaAmbienceAudio && this.isAmbienceActive) {
      this.arenaAmbienceAudio.play().catch(() => {});
    }
  }

  setSFXVolume(percent) {
    this.sfxVolume = Math.min(Math.max(percent / 100, 0), 1.0);
    // Propagate volume to WebAudio synth so procedural clicks & fallbacks scale accurately
    audioSynth.setVolume(this.masterVolume * this.sfxVolume);
  }

  setAmbianceVolume(percent) {
    this.ambianceVolume = Math.min(Math.max(percent / 100, 0), 1.0);
    if (this.arenaAmbienceAudio) {
      const targetVol = this.effectiveAmbianceVolume() * (this.isDucked ? 0.3 : 1.0);
      this.arenaAmbienceAudio.volume = targetVol;
    }
  }

  effectiveAmbianceVolume() {
    return Math.min(Math.max(this.masterVolume * this.ambianceVolume * 0.4, 0), 1.0);
  }

  // 3. Audio Channel Pool Factory
  getChannel(key) {
    const reg = this.soundRegistry[key];
    if (!reg || !reg.src) return null;

    if (!this.channelPools[key]) {
      this.channelPools[key] = {
        index: 0,
        channels: []
      };
      const size = reg.poolSize || 1;
      for (let i = 0; i < size; i++) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = reg.src;
        this.channelPools[key].channels.push(audio);
      }
    }

    const pool = this.channelPools[key];
    // Find an idle channel first, or steal the oldest
    let channel = pool.channels.find(ch => ch.paused || ch.ended);
    if (!channel) {
      channel = pool.channels[pool.index];
      pool.index = (pool.index + 1) % pool.channels.length;
    }
    return channel;
  }

  // 4. Main Play Method (With Automatic Fallback to Web Audio Synth)
  play(key, options = {}) {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.unlockAudio();

    if (key === 'ui_click') {
      this.playClick();
      return;
    }

    const reg = this.soundRegistry[key];
    if (!reg) return;

    const channel = this.getChannel(key);
    if (!channel) {
      if (reg.fallback) reg.fallback(options);
      return;
    }

    // Dynamic volume calculation
    let vol = this.masterVolume * this.sfxVolume;
    if (key === 'impact' && typeof options.impulse === 'number') {
      const scale = Math.min(Math.max(options.impulse / 1.5, 0.25), 1.0);
      vol *= scale;
    } else if (key === 'flick' && typeof options.power === 'number') {
      const scale = Math.min(Math.max(options.power, 0.4), 1.0);
      vol *= scale;
    } else if ((key === 'fall' || key === 'slide') && typeof options.velocity === 'number') {
      const scale = Math.min(Math.max(options.velocity / 1.5, 0.3), 1.0);
      vol *= scale;
    }
    vol = Math.min(Math.max(vol, 0), 1.0);

    if (channel.src !== reg.src && !channel.src.endsWith(reg.src)) {
      channel.src = reg.src;
    }

    channel.volume = vol;
    try {
      channel.currentTime = 0;
    } catch (e) {}

    const playPromise = channel.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err && err.name === 'AbortError') return;
        if (reg.fallback) {
          reg.fallback(options);
        }
      });
    }
  }

  // 5. Convenience Event Methods
  playFlick(power = 1.0) {
    this.play('flick', { power });
  }

  playImpact(impulse = 1.0) {
    this.play('impact', { impulse });
  }

  playClack(impulse = 1.0) {
    this.playImpact(impulse);
  }

  playThud(velocity = 1.0) {
    this.play('fall', { velocity });
  }

  playClick() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    const now = performance.now();
    // Strict 110ms debounce: eliminates duplicate pointerdown/touchstart/click echoes on same tap
    if (this._lastClickTime && (now - this._lastClickTime) < 110) {
      return;
    }
    this._lastClickTime = now;
    this.unlockAudio();
    // Directly use procedural audioSynth: instant 0ms response, zero channel conflict
    audioSynth.playClick();
  }

  playRoundWin() {
    this.duckAmbience(1800);
    this.play('round_win');
  }

  playRoundLoss() {
    this.duckAmbience(1500);
    this.play('round_loss');
  }

  playBell() {
    this.duckAmbience(2500);
    this.play('match_bell');
  }

  // 6. Arena Classroom Ambience Controller
  startArenaAmbience(customSrc = null) {
    if (!this.soundEnabled) return;
    this.unlockAudio();
    this.isAmbienceActive = true;

    const src = customSrc || this.soundRegistry.arena_ambience.src;

    if (!this.arenaAmbienceAudio) {
      this.arenaAmbienceAudio = new Audio();
      this.arenaAmbienceAudio.loop = true;
    }

    if (this.arenaAmbienceAudio.src !== src && !this.arenaAmbienceAudio.src.endsWith(src)) {
      this.arenaAmbienceAudio.src = src;
    }

    this.arenaAmbienceAudio.volume = this.effectiveAmbianceVolume();
    this.arenaAmbienceAudio.play().catch(() => {});
  }

  stopArenaAmbience() {
    this.isAmbienceActive = false;
    clearTimeout(this._duckTimeout);
    this.isDucked = false;
    if (this.arenaAmbienceAudio) {
      this.arenaAmbienceAudio.pause();
      this.arenaAmbienceAudio.currentTime = 0;
    }
  }

  duckAmbience(durationMs = 1500, duckLevel = 0.3) {
    if (!this.arenaAmbienceAudio || !this.isAmbienceActive) return;
    this.isDucked = true;
    const originalVol = this.effectiveAmbianceVolume();
    this.arenaAmbienceAudio.volume = originalVol * duckLevel;

    clearTimeout(this._duckTimeout);
    this._duckTimeout = setTimeout(() => {
      if (this.arenaAmbienceAudio && this.isAmbienceActive) {
        this.arenaAmbienceAudio.volume = this.effectiveAmbianceVolume();
      }
      this.isDucked = false;
    }, durationMs);
  }
}

export const audioManager = new AudioManager();
if (typeof window !== 'undefined') {
  window.AudioManager = audioManager;
}
