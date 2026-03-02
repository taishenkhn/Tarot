/**
 * Audio manager for tarot app sound effects
 * Manages: shuffle, select, flip sounds + ambient background music
 *
 * Background music: "Evolving Gothic Cathedral" �?multi-section composition
 * with chord progressions (Cm→Ab→Eb→Gm→Fm→Cm), filter sweeps,
 * dynamic volume swells, varying chime density, melodic phrases,
 * and atmospheric textures. ~3-minute evolving cycle.
 * Generated via Web Audio API; zero external dependencies.
 */

type SfxName = 'shuffle' | 'select' | 'flip';

// ──────────────────── Chord & Section Definitions ────────────────────

interface ChordVoicing {
  /** Frequencies for organ voices */
  freqs: number[];
  /** Chime scale notes (higher register) */
  chimeNotes: number[];
  /** Mood label for internal reference */
  mood: string;
}

// Six-chord progression cycling over ~3 minutes (30s per section)
const CHORD_PROGRESSION: ChordVoicing[] = [
  {
    // Cm7 �?dark, mysterious opening
    freqs: [65.41, 130.81, 155.56, 196.0, 233.08],
    chimeNotes: [523.25, 622.25, 783.99, 932.33],
    mood: 'dark',
  },
  {
    // Ab maj7 �?warm, expansive
    freqs: [103.83, 130.81, 155.56, 207.65, 246.94],
    chimeNotes: [523.25, 622.25, 830.61, 1046.5],
    mood: 'warm',
  },
  {
    // Eb maj �?bright, hopeful
    freqs: [77.78, 155.56, 196.0, 233.08, 311.13],
    chimeNotes: [622.25, 783.99, 932.33, 1174.66],
    mood: 'bright',
  },
  {
    // Gm7 �?contemplative, flowing
    freqs: [98.0, 196.0, 233.08, 293.66, 349.23],
    chimeNotes: [587.33, 698.46, 783.99, 932.33],
    mood: 'flowing',
  },
  {
    // Fm9 �?deep, emotional
    freqs: [87.31, 130.81, 174.61, 207.65, 261.63],
    chimeNotes: [523.25, 698.46, 830.61, 1046.5],
    mood: 'deep',
  },
  {
    // Cm(add9) �?return, resolution with color
    freqs: [65.41, 130.81, 146.83, 196.0, 261.63],
    chimeNotes: [523.25, 587.33, 783.99, 1046.5],
    mood: 'resolve',
  },
];

const SECTION_DURATION = 30; // seconds per chord section
const CROSSFADE_TIME = 4;   // seconds for chord crossfade

// ──────────────────── Evolving Gothic Cathedral ────────────────────

class AmbientGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _playing = false;

  // Per-section oscillator groups for crossfading
  private currentVoices: { oscs: OscillatorNode[]; gains: GainNode[]; group: GainNode } | null = null;
  private sectionIndex = 0;
  private sectionTimer: ReturnType<typeof setTimeout> | null = null;
  private chimeTimer: ReturnType<typeof setTimeout> | null = null;
  private melodyTimer: ReturnType<typeof setTimeout> | null = null;

  // Shared effect chain
  private convolver: ConvolverNode | null = null;
  private warmthFilter: BiquadFilterNode | null = null;
  private dryBus: GainNode | null = null;
  private wetBus: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private tremoloLfo: OscillatorNode | null = null;

  // Track all sources for cleanup
  private allSources: (AudioBufferSourceNode | OscillatorNode)[] = [];
  private allNodes: AudioNode[] = [];

  get playing() {
    return this._playing;
  }

  start(volume = 0.64): void {
    if (this._playing) return;

    try {
      this.ctx = new AudioContext();
    } catch {
      console.warn('Web Audio API not supported');
      return;
    }

    const ctx = this.ctx;

    // ── Master gain with fade in ──
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);
    this.masterGain.connect(ctx.destination);

    // ── Cathedral reverb (dynamic IR ~5s) ──
    const irLen = ctx.sampleRate * 5;
    const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = irBuf.getChannelData(ch);
      for (let i = 0; i < irLen; i++) {
        const t = i / ctx.sampleRate;
        const earlyRef = t < 0.06 ? 0.5 : 1;
        const stereoSpread = ch === 0 ? 1 : 0.9 + Math.random() * 0.2;
        d[i] = (Math.random() * 2 - 1) * earlyRef * stereoSpread * Math.exp(-t / 2.2);
      }
    }
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = irBuf;
    this.allNodes.push(this.convolver);

    // Wet / dry routing
    this.dryBus = ctx.createGain();
    this.dryBus.gain.value = 0.35;
    this.dryBus.connect(this.masterGain);
    this.allNodes.push(this.dryBus);

    this.wetBus = ctx.createGain();
    this.wetBus.gain.value = 0.7;
    this.convolver.connect(this.wetBus);
    this.wetBus.connect(this.masterGain);
    this.allNodes.push(this.wetBus);

    // ── Warmth low-pass that will sweep over time ──
    this.warmthFilter = ctx.createBiquadFilter();
    this.warmthFilter.type = 'lowpass';
    this.warmthFilter.frequency.value = 1200;
    this.warmthFilter.Q.value = 0.5;
    this.warmthFilter.connect(this.dryBus);
    this.warmthFilter.connect(this.convolver);
    this.allNodes.push(this.warmthFilter);

    // ── Global tremolo LFO (rate evolves per section) ──
    this.tremoloLfo = ctx.createOscillator();
    this.tremoloLfo.type = 'sine';
    this.tremoloLfo.frequency.value = 0.2;
    this.tremoloLfo.start();
    this.allSources.push(this.tremoloLfo);

    // ── Breath / air texture with evolving filter ──
    this.setupNoiseTexture(ctx);

    // ── Start first section ──
    this.sectionIndex = 0;
    this.transitionToSection(0, true);

    // ── Schedule chimes and melody ──
    this.scheduleChimes();
    this.scheduleMelody();

    // ── Start filter sweep automation ──
    this.automateFilterSweeps(ctx);

    this._playing = true;
  }

  /** Build one organ voice group for a chord */
  private buildVoiceGroup(chord: ChordVoicing, fadeIn: boolean): {
    oscs: OscillatorNode[];
    gains: GainNode[];
    group: GainNode;
  } {
    const ctx = this.ctx!;
    const group = ctx.createGain();
    if (fadeIn) {
      group.gain.setValueAtTime(0, ctx.currentTime);
      group.gain.linearRampToValueAtTime(1, ctx.currentTime + CROSSFADE_TIME);
    } else {
      group.gain.value = 1;
    }
    group.connect(this.warmthFilter!);
    this.allNodes.push(group);

    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.12;
    this.tremoloLfo!.connect(tremoloDepth);
    this.allNodes.push(tremoloDepth);

    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    chord.freqs.forEach((fund, vi) => {
      const harmonics = [
        { mult: 1, gain: 0.026 },
        { mult: 2, gain: 0.012 },
        { mult: 3, gain: 0.005 },
      ];

      harmonics.forEach(({ mult, gain: g }) => {
        const osc = ctx.createOscillator();
        osc.type = mult === 1 ? 'square' : 'sine';
        osc.frequency.value = fund * mult;

        const oscGain = ctx.createGain();
        oscGain.gain.value = g;
        osc.connect(oscGain);
        oscGain.connect(group);

        // Tremolo modulation
        tremoloDepth.connect(oscGain.gain);

        // Per-voice slow drift for organic feel
        const drift = ctx.createOscillator();
        drift.frequency.value = 0.015 + vi * 0.006 + mult * 0.003;
        const driftGain = ctx.createGain();
        driftGain.gain.value = fund * mult * 0.005;
        drift.connect(driftGain);
        driftGain.connect(osc.detune);

        osc.start();
        drift.start();
        oscs.push(osc, drift);
        this.allSources.push(osc, drift);
        gains.push(oscGain);
        this.allNodes.push(oscGain, driftGain);
      });
    });

    return { oscs, gains, group };
  }

  /** Crossfade from current chord to the next section */
  private transitionToSection(index: number, isFirst = false): void {
    if (!this.ctx || !this._playing) return;
    const ctx = this.ctx;
    const chord = CHORD_PROGRESSION[index % CHORD_PROGRESSION.length];

    // Build new voices
    const newVoices = this.buildVoiceGroup(chord, !isFirst);

    // Fade out old voices
    if (this.currentVoices && !isFirst) {
      const old = this.currentVoices;
      old.group.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_TIME);
      // Cleanup old after crossfade
      setTimeout(() => {
        old.oscs.forEach(o => { try { o.stop(); } catch { /* */ } });
      }, (CROSSFADE_TIME + 1) * 1000);
    }

    this.currentVoices = newVoices;

    // Evolve tremolo rate per section (slow breathing effect)
    const tremoloRates = [0.2, 0.15, 0.3, 0.18, 0.12, 0.25];
    this.tremoloLfo!.frequency.linearRampToValueAtTime(
      tremoloRates[index % tremoloRates.length],
      ctx.currentTime + CROSSFADE_TIME
    );

    // Evolve noise character per section
    if (this.noiseFilter && this.noiseGain) {
      const noiseFreqs = [300, 450, 250, 380, 200, 350];
      const noiseVols = [0.012, 0.018, 0.008, 0.015, 0.020, 0.010];
      this.noiseFilter.frequency.linearRampToValueAtTime(
        noiseFreqs[index % noiseFreqs.length],
        ctx.currentTime + CROSSFADE_TIME * 2
      );
      this.noiseGain.gain.linearRampToValueAtTime(
        noiseVols[index % noiseVols.length],
        ctx.currentTime + CROSSFADE_TIME * 2
      );
    }

    // Schedule next section
    this.sectionTimer = setTimeout(() => {
      this.sectionIndex++;
      this.transitionToSection(this.sectionIndex);
    }, SECTION_DURATION * 1000);
  }

  /** Noise texture layer with evolving filter */
  private setupNoiseTexture(ctx: AudioContext): void {
    const noiseBufLen = ctx.sampleRate * 4;
    const noiseBuf = ctx.createBuffer(1, noiseBufLen, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseBufLen; i++) {
      nd[i] = Math.random() * 2 - 1;
    }
    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuf;
    this.noiseSource.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 300;
    this.noiseFilter.Q.value = 1.0;

    // Slow sweep on noise filter
    const sweepLfo = ctx.createOscillator();
    sweepLfo.frequency.value = 0.012;
    const sweepGain = ctx.createGain();
    sweepGain.gain.value = 180;
    sweepLfo.connect(sweepGain);
    sweepGain.connect(this.noiseFilter.frequency);

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.012;

    this.noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.warmthFilter!);

    this.noiseSource.start();
    sweepLfo.start();
    this.allSources.push(this.noiseSource, sweepLfo);
    this.allNodes.push(this.noiseFilter, this.noiseGain, sweepGain);
  }

  /** Automate the warmth filter frequency in slow waves */
  private automateFilterSweeps(ctx: AudioContext): void {
    const sweepCycle = () => {
      if (!this._playing || !this.warmthFilter || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Each sweep takes 20-40s
      const duration = 20 + Math.random() * 20;
      const peak = 800 + Math.random() * 1200; // 800-2000 Hz
      const valley = 600 + Math.random() * 400; // 600-1000 Hz

      this.warmthFilter.frequency.linearRampToValueAtTime(peak, now + duration * 0.4);
      this.warmthFilter.frequency.linearRampToValueAtTime(valley, now + duration);

      setTimeout(sweepCycle, duration * 1000);
    };

    setTimeout(sweepCycle, 8000); // Start first sweep after 8s
  }

  /** Schedule chimes with varying density per section mood */
  private scheduleChimes(): void {
    const scheduleNext = () => {
      if (!this._playing || !this.ctx) return;

      const chord = CHORD_PROGRESSION[this.sectionIndex % CHORD_PROGRESSION.length];
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Density varies by mood
      const densityMap: Record<string, [number, number]> = {
        dark: [5, 10],
        warm: [3, 7],
        bright: [2, 5],
        flowing: [3, 6],
        deep: [6, 12],
        resolve: [4, 8],
      };
      const [minGap, maxGap] = densityMap[chord.mood] || [4, 8];

      // Play 1-3 chimes in a small cluster
      const clusterSize = 1 + Math.floor(Math.random() * 3);
      for (let c = 0; c < clusterSize; c++) {
        const delay = c * (0.3 + Math.random() * 0.8);
        const freq = chord.chimeNotes[Math.floor(Math.random() * chord.chimeNotes.length)];
        const t = now + delay;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        // Gentle detuning for shimmer
        osc.detune.value = (Math.random() - 0.5) * 15;

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.012 + Math.random() * 0.008, t + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 3 + Math.random() * 1.5);

        osc.connect(env);
        env.connect(this.warmthFilter!);
        osc.start(t);
        osc.stop(t + 5);

        this.allSources.push(osc);
        this.allNodes.push(env);
      }

      const nextGap = minGap + Math.random() * (maxGap - minGap);
      this.chimeTimer = setTimeout(scheduleNext, nextGap * 1000);
    };

    // Start first chime after 2-4s
    this.chimeTimer = setTimeout(scheduleNext, (2 + Math.random() * 2) * 1000);
  }

  /** Schedule sparse melodic phrases that emerge and fade */
  private scheduleMelody(): void {
    const scheduleNext = () => {
      if (!this._playing || !this.ctx) return;
      const ctx = this.ctx;
      const chord = CHORD_PROGRESSION[this.sectionIndex % CHORD_PROGRESSION.length];

      // Build a 3-7 note phrase from the chord's chime notes + some passing tones
      const phraseLen = 3 + Math.floor(Math.random() * 5);
      const scale = [...chord.chimeNotes];
      // Add some passing tones (between existing notes)
      if (scale.length >= 2) {
        scale.push((scale[0] + scale[1]) / 2);
        scale.push(scale[0] * 2); // octave up
      }
      scale.sort((a, b) => a - b);

      const noteGap = 0.6 + Math.random() * 0.8; // time between notes
      const now = ctx.currentTime;

      for (let n = 0; n < phraseLen; n++) {
        const t = now + n * noteGap + Math.random() * 0.15;
        const freq = scale[Math.floor(Math.random() * scale.length)];

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = (Math.random() - 0.5) * 10;

        // Soft triangle sub-oscillator for body
        const sub = ctx.createOscillator();
        sub.type = 'triangle';
        sub.frequency.value = freq;

        const oscEnv = ctx.createGain();
        oscEnv.gain.setValueAtTime(0, t);
        oscEnv.gain.linearRampToValueAtTime(0.008, t + 0.08);
        oscEnv.gain.exponentialRampToValueAtTime(0.0001, t + 2.5 + Math.random());

        const subEnv = ctx.createGain();
        subEnv.gain.setValueAtTime(0, t);
        subEnv.gain.linearRampToValueAtTime(0.004, t + 0.1);
        subEnv.gain.exponentialRampToValueAtTime(0.0001, t + 2 + Math.random());

        osc.connect(oscEnv);
        sub.connect(subEnv);
        oscEnv.connect(this.warmthFilter!);
        subEnv.connect(this.warmthFilter!);

        osc.start(t);
        osc.stop(t + 4);
        sub.start(t);
        sub.stop(t + 3.5);

        this.allSources.push(osc, sub);
        this.allNodes.push(oscEnv, subEnv);
      }

      // Next melody phrase in 15-35s (sparse, not constant)
      const nextDelay = 15 + Math.random() * 20;
      this.melodyTimer = setTimeout(scheduleNext, nextDelay * 1000);
    };

    // First melody after 10-15s
    this.melodyTimer = setTimeout(scheduleNext, (10 + Math.random() * 5) * 1000);
  }

  stop(): void {
    if (!this._playing) return;
    this._playing = false;

    if (this.sectionTimer) { clearTimeout(this.sectionTimer); this.sectionTimer = null; }
    if (this.chimeTimer) { clearTimeout(this.chimeTimer); this.chimeTimer = null; }
    if (this.melodyTimer) { clearTimeout(this.melodyTimer); this.melodyTimer = null; }

    this.allSources.forEach(s => { try { s.stop(); } catch { /* */ } });
    this.allSources = [];
    this.allNodes = [];
    this.currentVoices = null;

    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.masterGain = null;
    this.convolver = null;
    this.warmthFilter = null;
    this.dryBus = null;
    this.wetBus = null;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.noiseGain = null;
    this.tremoloLfo = null;
    this.sectionIndex = 0;
  }

  setVolume(v: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = v;
    }
  }

  /** Resume AudioContext if suspended (browser autoplay policy) */
  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}

// ──────────────────── Audio Manager ────────────────────

class AudioManager {
  private sounds: Map<SfxName, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;
  private ambient = new AmbientGenerator();

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    const sfxFiles: Record<SfxName, string> = {
      shuffle: '/sounds/shuffle.mp3',
      select: '/sounds/select.mp3',
      flip: '/sounds/flip.mp3',
    };

    for (const [name, src] of Object.entries(sfxFiles)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.5;
      this.sounds.set(name as SfxName, audio);
    }

    this.initialized = true;
  }

  play(name: SfxName | 'ambient'): void {
    if (!this.enabled) return;

    if (name === 'ambient') {
      if (!this.ambient.playing) {
        this.ambient.start(0.64);
      } else {
        this.ambient.resume();
      }
      return;
    }

    const sound = this.sounds.get(name);
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  stop(name: SfxName | 'ambient'): void {
    if (name === 'ambient') {
      this.ambient.stop();
      return;
    }
    const sound = this.sounds.get(name);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  pauseAmbient(): void {
    this.ambient.stop();
  }

  resumeAmbient(): void {
    if (!this.enabled) return;
    if (!this.ambient.playing) {
      this.ambient.start(0.64);
    } else {
      this.ambient.resume();
    }
  }

  isAmbientPlaying(): boolean {
    return this.ambient.playing;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.ambient.stop();
      this.sounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    } else {
      this.resumeAmbient();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const audioManager = new AudioManager();
