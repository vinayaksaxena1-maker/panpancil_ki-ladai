// js/sound.js - Unified Audio Bridge (routes to AudioManager & AudioSynth)
import { audioManager } from './audio_manager.js';
import { audioSynth } from './audio_synth.js';

class SoundBridge {
  constructor() {
    this.manager = audioManager;
    this.synth = audioSynth;
  }

  init() {
    this.manager.unlockAudio();
  }

  playFlick(power = 1.0) {
    this.manager.playFlick(power);
  }

  playClack(impulse = 1.0) {
    this.manager.playClack(impulse);
  }

  playThud(velocity = 1.0) {
    this.manager.playThud(velocity);
  }

  playClick() {
    this.manager.playClick();
  }

  playBell() {
    this.manager.playBell();
  }
}

export const synth = new SoundBridge();
if (typeof window !== 'undefined') {
  window.gameSynth = synth;
}
