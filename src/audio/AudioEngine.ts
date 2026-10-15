// Son entièrement procédural (WebAudio) : ambiances, musique clairsemée, effets. Aucun fichier.

export type Ambience = 'none' | 'train' | 'moving' | 'exterior' | 'title';
export type Mood = 'none' | 'title' | 'calm' | 'tension' | 'expedition' | 'ending';

interface Vol { master: number; music: number; ambience: number; sfx: number }

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private ambBus!: GainNode;
  private sfxBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;
  private ambNodes: AudioNode[] = [];
  private ambTimers: number[] = [];
  private ambience: Ambience = 'none';
  private mood: Mood = 'none';
  private musicTimer = 0;
  private vol: Vol = { master: 0.8, music: 0.6, ambience: 0.7, sfx: 0.8 };

  /** À appeler lors d'un geste utilisateur (politique d'autoplay des navigateurs). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicBus = this.gainTo(this.master);
    this.ambBus = this.gainTo(this.master);
    this.sfxBus = this.gainTo(this.master);
    this.applyVolumes();
    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02; // bruit brun
      d[i] = last * 3.5;
    }
    const a = this.ambience;
    const m = this.mood;
    this.ambience = 'none';
    this.mood = 'none';
    this.setAmbience(a);
    this.setMood(m);
  }

  private gainTo(dest: AudioNode, v = 1): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = v;
    g.connect(dest);
    return g;
  }

  setVolumes(v: Vol) {
    this.vol = { ...v };
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.master, t, 0.05);
    this.musicBus.gain.setTargetAtTime(this.vol.music * 0.5, t, 0.05);
    this.ambBus.gain.setTargetAtTime(this.vol.ambience * 0.6, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(this.vol.sfx * 0.7, t, 0.05);
  }

  // ------------------------------------------------------------------ ambiances
  setAmbience(a: Ambience) {
    if (a === this.ambience) return;
    this.ambience = a;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const n of this.ambNodes) {
      if (n instanceof GainNode) n.gain.setTargetAtTime(0, t, 0.4);
    }
    const old = this.ambNodes;
    setTimeout(() => old.forEach((n) => { try { (n as AudioScheduledSourceNode).stop?.(); } catch { /* déjà arrêté */ } n.disconnect(); }), 2000);
    this.ambNodes = [];
    this.ambTimers.forEach((x) => clearInterval(x));
    this.ambTimers = [];
    if (a === 'none') return;
    const out = this.gainTo(this.ambBus, 0);
    out.gain.setTargetAtTime(1, t, 0.8);
    this.ambNodes.push(out);
    if (a === 'train' || a === 'moving' || a === 'title') {
      // Ronronnement grave : bruit brun filtré + basse
      this.ambNodes.push(...this.noiseLoop(out, 'lowpass', a === 'train' ? 160 : 260, 0.55));
      const o = this.ctx.createOscillator();
      o.frequency.value = a === 'train' ? 49 : 58;
      const og = this.gainTo(out, 0.05);
      o.connect(og);
      o.start();
      this.ambNodes.push(o, og);
      if (a !== 'train') {
        // Claquements des rails
        const clack = () => {
          if (!this.ctx) return;
          this.thump(out, 0.32, 90);
          setTimeout(() => this.thump(out, 0.26, 80), 140);
        };
        this.ambTimers.push(window.setInterval(clack, 1150));
      } else {
        // Craquements métalliques occasionnels
        this.ambTimers.push(window.setInterval(() => { if (Math.random() < 0.35) this.creak(out); }, 4200));
      }
    }
    if (a === 'exterior') {
      this.ambNodes.push(...this.noiseLoop(out, 'bandpass', 520, 0.35, true));
      this.ambNodes.push(...this.noiseLoop(out, 'lowpass', 120, 0.3));
      this.ambTimers.push(window.setInterval(() => { if (Math.random() < 0.25) this.bird(out); }, 3500));
    }
  }

  private noiseLoop(dest: AudioNode, type: BiquadFilterType, freq: number, vol: number, lfo = false): AudioNode[] {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = type === 'bandpass' ? 0.7 : 0.5;
    const g = this.gainTo(dest, vol);
    src.connect(f);
    f.connect(g);
    src.start();
    const nodes: AudioNode[] = [src, f, g];
    if (lfo) {
      const l = ctx.createOscillator();
      l.frequency.value = 0.07;
      const lg = ctx.createGain();
      lg.gain.value = freq * 0.5;
      l.connect(lg);
      lg.connect(f.frequency);
      l.start();
      nodes.push(l, lg);
    }
    return nodes;
  }

  private thump(dest: AudioNode, vol: number, freq: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq * 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(t, Math.random());
    src.stop(t + 0.15);
  }

  private creak(dest: AudioNode) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(180 + Math.random() * 120, t);
    o.frequency.linearRampToValueAtTime(140 + Math.random() * 60, t + 0.6);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.03, t + 0.1);
    g.gain.linearRampToValueAtTime(0, t + 0.7);
    o.connect(f);
    f.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + 0.75);
  }

  private bird(dest: AudioNode) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      const base = 2400 + Math.random() * 800;
      o.frequency.setValueAtTime(base, t + i * 0.18);
      o.frequency.exponentialRampToValueAtTime(base * 0.7, t + i * 0.18 + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.18);
      g.gain.linearRampToValueAtTime(0.012, t + i * 0.18 + 0.02);
      g.gain.linearRampToValueAtTime(0, t + i * 0.18 + 0.13);
      o.connect(g);
      g.connect(dest);
      o.start(t + i * 0.18);
      o.stop(t + i * 0.18 + 0.15);
    }
  }

  // ------------------------------------------------------------------ musique
  setMood(m: Mood) {
    if (m === this.mood) return;
    this.mood = m;
    clearTimeout(this.musicTimer);
    if (!this.ctx || m === 'none') return;
    const loop = () => {
      if (this.mood !== m) return;
      this.phrase(m);
      const gap = m === 'calm' ? 26000 + Math.random() * 30000 : m === 'tension' ? 14000 : 18000 + Math.random() * 12000;
      this.musicTimer = window.setTimeout(loop, gap);
    };
    this.musicTimer = window.setTimeout(loop, m === 'calm' ? 6000 : 800);
  }

  /** Une phrase musicale : nappe + quelques notes pincées. */
  private phrase(m: Mood) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.05;
    const prog: Record<string, number[][]> = {
      title: [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64]],
      calm: [[45, 52, 57, 60], [41, 48, 53, 57]],
      tension: [[40, 47, 52, 55], [41, 47, 53, 56]],
      expedition: [[38, 45, 50, 53], [39, 46, 51, 54]],
      ending: [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]],
    };
    const chords = prog[m] ?? prog.calm;
    const dur = m === 'tension' ? 3.2 : 5;
    chords.forEach((ch, ci) => {
      const t0 = t + ci * dur;
      for (const n of ch) this.pad(n, t0, dur + 0.8, m === 'tension' ? 0.022 : 0.018);
      const mel = ch[1 + Math.floor(Math.random() * 3)] + 12;
      if (Math.random() < 0.8) this.pluck(mel, t0 + 0.6 + Math.random() * 1.5, 0.05);
      if (Math.random() < 0.5) this.pluck(mel + (Math.random() < 0.5 ? 2 : -3), t0 + 2.4 + Math.random(), 0.04);
    });
    if (m === 'expedition') for (let i = 0; i < 8; i++) this.pulse(t + i * 1.25);
  }

  private hz(midi: number) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private pad(midi: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 1.2);
    g.gain.linearRampToValueAtTime(0, t + dur);
    f.connect(g);
    g.connect(this.musicBus);
    for (const det of [-6, 5]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = this.hz(midi);
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
  }

  private pluck(midi: number, t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = this.hz(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 2.2);
    o.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + 2.3);
  }

  private pulse(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + 0.4);
  }

  // ------------------------------------------------------------------ effets
  sfx(k: string) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const tone = (freq: number, at: number, dur: number, vol: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + at);
      g.gain.linearRampToValueAtTime(vol, t + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + at + dur);
      o.connect(g);
      g.connect(this.sfxBus);
      o.start(t + at);
      o.stop(t + at + dur + 0.05);
    };
    const noise = (at: number, dur: number, vol: number, freq: number, q = 1, type: BiquadFilterType = 'bandpass') => {
      const s = ctx.createBufferSource();
      s.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t + at);
      g.gain.exponentialRampToValueAtTime(0.0005, t + at + dur);
      s.connect(f);
      f.connect(g);
      g.connect(this.sfxBus);
      s.start(t + at, Math.random());
      s.stop(t + at + dur + 0.05);
    };
    switch (k) {
      case 'click': tone(880, 0, 0.05, 0.05, 'square'); break;
      case 'tick': tone(1300, 0, 0.03, 0.03, 'square'); break;
      case 'entry': tone(660, 0, 0.3, 0.06); tone(990, 0.09, 0.4, 0.05); break;
      case 'fact': tone(523, 0, 0.5, 0.06); tone(659, 0.1, 0.5, 0.05); tone(784, 0.2, 0.8, 0.05); break;
      case 'quest': tone(196, 0, 0.9, 0.06, 'triangle'); tone(294, 0.05, 0.9, 0.04, 'triangle'); break;
      case 'warn': tone(330, 0, 0.18, 0.07, 'square'); tone(330, 0.25, 0.18, 0.07, 'square'); break;
      case 'item': tone(740, 0, 0.12, 0.05, 'triangle'); tone(1110, 0.06, 0.15, 0.04, 'triangle'); break;
      case 'horn': {
        for (const f of [311, 370]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = f;
          const flt = ctx.createBiquadFilter();
          flt.type = 'lowpass';
          flt.frequency.value = 1200;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.07, t + 0.25);
          g.gain.setValueAtTime(0.07, t + 1.5);
          g.gain.linearRampToValueAtTime(0, t + 2);
          o.connect(flt);
          flt.connect(g);
          g.connect(this.sfxBus);
          o.start(t);
          o.stop(t + 2.1);
        }
        break;
      }
      case 'metal': noise(0, 0.5, 0.25, 1800, 6); tone(210, 0, 0.6, 0.04, 'square'); break;
      case 'repair': for (let i = 0; i < 5; i++) noise(i * 0.09, 0.05, 0.2, 3000, 4); tone(440, 0.5, 0.3, 0.04); break;
      case 'unlock': noise(0, 0.05, 0.3, 2500, 3); noise(0.12, 0.06, 0.3, 1800, 3); break;
      case 'lever': noise(0, 0.25, 0.3, 600, 2); tone(90, 0.05, 0.4, 0.07, 'triangle'); break;
      case 'vote': noise(0, 0.08, 0.4, 400, 1, 'lowpass'); noise(0.22, 0.08, 0.4, 400, 1, 'lowpass'); break;
      case 'piano': [57, 60, 64, 63].forEach((n, i) => tone(this.hz(n), i * 0.35, 1.2, 0.05, 'triangle')); break;
      case 'gramophone': [62, 66, 69, 66, 64].forEach((n, i) => tone(this.hz(n), i * 0.3, 0.6, 0.035, 'triangle')); noise(0, 2, 0.02, 3000, 0.5); break;
      case 'door': noise(0, 0.3, 0.15, 500, 1); break;
      case 'hurt': noise(0, 0.2, 0.3, 300, 1, 'lowpass'); tone(110, 0, 0.3, 0.06, 'sawtooth'); break;
      case 'dog': for (let i = 0; i < 2; i++) noise(i * 0.25, 0.12, 0.25, 700, 3); break;
      default: break;
    }
  }
}
