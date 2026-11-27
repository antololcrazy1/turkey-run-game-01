// WebAudio sound effects and a tiny banjo-ish loop, all synthesized offline.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = 0;
    this.noteIndex = 0;
  }
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }
  tone(freq, dur, type = "square", vol = 0.08, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  gobble() { this.tone(320, 0.12, "sawtooth", 0.06, 140); this.tone(260, 0.1, "sawtooth", 0.05, 120, 0.09); }
  corn() { this.tone(880, 0.08, "sine", 0.09); this.tone(1320, 0.1, "sine", 0.07, null, 0.06); }
  golden() { [660, 880, 1100, 1320].forEach((f, i) => this.tone(f, 0.1, "triangle", 0.09, null, i * 0.06)); }
  hit() { this.tone(160, 0.2, "sawtooth", 0.12, 60); }
  dash() { this.tone(500, 0.16, "sine", 0.07, 980); }
  knife() { this.tone(1800, 0.09, "square", 0.03, 900); }
  nearMiss() { this.tone(1200, 0.07, "sine", 0.06, 1600); }
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.16, "triangle", 0.1, null, i * 0.11)); }
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.18, "sawtooth", 0.07, null, i * 0.13)); }
  tickMusic(dt, playing) {
    if (!playing || !this.ctx || this.muted) return;
    this.musicTimer -= dt;
    if (this.musicTimer > 0) return;
    this.musicTimer = 0.24;
    const scale = [392, 440, 523, 587, 659, 587, 523, 440];
    this.tone(scale[this.noteIndex % scale.length], 0.18, "triangle", 0.025);
    this.noteIndex += 1;
  }
}
