// js/audio_synth.js - Pure Procedural Web Audio API Synthesizer (Zero Dependency Fallback)
// Generates tactile 90s classroom physical SFX purely via mathematics & oscillators

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  // 1. Tactile finger flick / slingshot whoosh
  playFlick(power = 1.0) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const clampedPower = Math.min(Math.max(power, 0.2), 2.5);
    const now = ctx.currentTime;
    const duration = 0.08 + clampedPower * 0.04; // 80ms - 180ms

    // Sine pitch drop for whoosh body
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    const startFreq = 260 + clampedPower * 140;
    const endFreq = 70;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    const peakGain = Math.min(0.35 * clampedPower, 0.6);
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  // 2. Plastic-on-plastic sharp clack (Pen collision)
  playImpact(impulse = 1.0) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    const intensity = Math.min(Math.max(impulse, 0.2), 3.0);
    const duration = 0.035; // 35ms sharp transient

    // High frequency triangle burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';

    const baseFreq = 950 + Math.random() * 250;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + duration);

    const vol = Math.min(0.25 * intensity, 0.7);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  // Backwards compatibility alias
  playClack(impulse = 1.0) {
    this.playImpact(impulse);
  }

  // 3. Wooden desk thud or floor out-of-bounds drop
  playThud(velocity = 1.0) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    const intensity = Math.min(Math.max(velocity, 0.3), 2.5);
    const duration = 0.16;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(140 + intensity * 20, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + duration);

    const vol = Math.min(0.4 * intensity, 0.8);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  // 4. Subtle UI button / chit click
  playClick() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.02);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  // 5. School period bell / brass harmonic chime
  playBell() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 1.2;

    [659.25, 1318.5, 1975.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = (0.25 / (idx + 1));
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration);
    });
  }
}

export const audioSynth = new AudioSynth();
if (typeof window !== 'undefined') {
  window.AudioSynth = audioSynth;
}
