// Web Audio API Procedural Synthesizer for Native OS Sounds & Haptics

export interface SoundEffectsService {
  playAppOpen(): void;
  playTap(): void;
  playSuccess(): void;
  playInterventionShield(): void;
  playBrushStroke(speed?: number): void;
  playSparkle(pitchShift?: number): void;
  playStarBurst(): void;
  playTimerTick(isUrgent?: boolean): void;
  playVictoryFanfare(): void;
  vibrate(pattern?: number | number[]): void;
  resumeAudioContext(): Promise<void>;
}

export class SoundEffectsServiceImpl implements SoundEffectsService {
  private ctx: AudioContext | null = null;
  private lastBrushStrokeTime: number = 0;
  private noiseBuffer: AudioBuffer | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (err) {
          console.warn('[SoundEffects] AudioContext initialization deferred:', err);
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Resume may fail if no user interaction gesture occurred yet
      });
    }

    return this.ctx;
  }

  public async resumeAudioContext(): Promise<void> {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('[SoundEffects] Resume failed:', err);
      }
    }
  }

  public vibrate(pattern: number | number[] = 10): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently ignore unsupported or restricted vibration contexts
      }
    }
  }

  private getOrCreateNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
      const bufferSize = Math.floor(ctx.sampleRate * 0.2); // 200ms noise buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  public playAppOpen(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);

    this.vibrate(8);
  }

  public playTap(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);

    this.vibrate(5);
  }

  public playSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.07, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });

    this.vibrate([15, 30, 20]);
  }

  public playInterventionShield(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic chord (Major 7th chime)
    [523.25, 659.25, 783.99, 987.77].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.06, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.35);
    });

    this.vibrate([25, 40, 25]);
  }

  public playBrushStroke(speed: number = 0.5): void {
    const nowMs = performance.now();
    if (nowMs - this.lastBrushStrokeTime < 40) return; // rate-limit to avoid audio buffer saturation
    this.lastBrushStrokeTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const speedNorm = Math.max(0.1, Math.min(speed, 2.0));
    const duration = 0.06 + speedNorm * 0.05;

    // Filtered noise layer for paper/canvas friction
    const noiseBuffer = this.getOrCreateNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000 + speedNorm * 1200, now);
    filter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    const peakGain = Math.min(0.015 + speedNorm * 0.02, 0.035);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(peakGain, now + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);

    // Subtle low sine texture for brush weight
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160 + speedNorm * 80, now);
    oscGain.gain.setValueAtTime(0.008, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration * 0.8);
  }

  public playSparkle(pitchShift: number = 1.0): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 0.22;
    const shift = Math.max(0.5, Math.min(pitchShift, 2.5));

    // Carrier Oscillator (C6 -> C7)
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(1046.5 * shift, now);
    carrier.frequency.exponentialRampToValueAtTime(2093.0 * shift, now + duration);

    // Modulator for crystalline bell shimmer
    const modulator = ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(523.25 * shift, now);

    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(600 * shift, now);
    modGain.gain.exponentialRampToValueAtTime(1, now + duration);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    // Amplitude Envelope
    const ampGain = ctx.createGain();
    ampGain.gain.setValueAtTime(0.06, now);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    carrier.connect(ampGain);
    ampGain.connect(ctx.destination);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + duration);
    carrier.stop(now + duration);

    this.vibrate([6, 15, 6]);
  }

  public playStarBurst(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Voice 1: Ascending power surge sweep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(360, now);
    osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.16);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.24);

    // Voice 2: High shimmer harmonic sheen
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.28);
    gain2.gain.setValueAtTime(0.05, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.36);

    this.vibrate([10, 30, 15]);
  }

  public playTimerTick(isUrgent: boolean = false): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = isUrgent ? 0.03 : 0.02;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isUrgent ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isUrgent ? 1200 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(isUrgent ? 600 : 300, now + duration);

    gain.gain.setValueAtTime(isUrgent ? 0.08 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    if (isUrgent) {
      this.vibrate(8);
    }
  }

  public playVictoryFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chordNotes = [
      { freq: 523.25, time: 0.00, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.08 },
      { freq: 659.25, time: 0.10, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.08 },
      { freq: 783.99, time: 0.20, dur: 0.24, type: 'triangle' as OscillatorType, vol: 0.09 },
      { freq: 1046.50, time: 0.32, dur: 0.45, type: 'sawtooth' as OscillatorType, vol: 0.07 },
      { freq: 1567.98, time: 0.42, dur: 0.55, type: 'sine' as OscillatorType, vol: 0.06 }
    ];

    chordNotes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(n.vol, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });

    this.vibrate([20, 50, 20, 50, 40]);
  }
}

export const sounds: SoundEffectsService = new SoundEffectsServiceImpl();
export default sounds;
