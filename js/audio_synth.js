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
    const t0 = Math.max(ctx.currentTime, 0.005) + 0.002;
    const duration = 0.08 + clampedPower * 0.04; // 80ms - 180ms

    // Sine pitch drop for whoosh body
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    const startFreq = 260 + clampedPower * 140;
    const endFreq = 70;
    osc.frequency.setValueAtTime(startFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);

    const peakGain = Math.min(0.35 * clampedPower, 0.6);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.005);
  }

  // 2. Plastic-on-plastic sharp clack (Pen collision)
  playImpact(impulse = 1.0) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const t0 = Math.max(ctx.currentTime, 0.005) + 0.002;
    const intensity = Math.min(Math.max(impulse, 0.2), 3.0);
    const duration = 0.038; // 38ms sharp transient

    // High frequency triangle burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';

    const baseFreq = 950 + Math.random() * 250;
    osc.frequency.setValueAtTime(baseFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(240, t0 + duration);

    const vol = Math.min(0.25 * intensity, 0.7);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.005);
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

    const t0 = Math.max(ctx.currentTime, 0.005) + 0.002;
    const intensity = Math.min(Math.max(velocity, 0.3), 2.5);
    const duration = 0.16;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(140 + intensity * 20, t0);
    osc.frequency.exponentialRampToValueAtTime(45, t0 + duration);

    const vol = Math.min(0.4 * intensity, 0.8);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.005);
  }

  // 4. Subtle UI button / chit click (Tactile wooden pencil tap on desk)
  playClick() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const t0 = Math.max(ctx.currentTime, 0.005) + 0.002;
    const duration = 0.040; // 40ms natural tactile tap

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    // Warm wooden pencil tap frequency drop: 720 Hz down to 220 Hz
    osc.frequency.setValueAtTime(720, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + duration);

    // Anti-pop smooth envelope: 2ms micro-attack, exponential decay
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(0.20, t0 + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.005);
  }

  // 5. School period bell / brass harmonic chime
  playBell() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    const t0 = Math.max(ctx.currentTime, 0.005) + 0.002;
    const duration = 1.2;

    [659.25, 1318.5, 1975.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);

      const amp = (0.25 / (idx + 1));
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(amp, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t0);
      osc.stop(t0 + duration + 0.005);
    });
  }
}

export const audioSynth = new AudioSynth();
if (typeof window !== 'undefined') {
  window.AudioSynth = audioSynth;
}
