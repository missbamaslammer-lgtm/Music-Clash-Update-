import { SynthRiffType, MasteringSettings } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;
  private isPlaybackOn: boolean = true; // Global Playback On/Off
  private activeLoopInterval: number | null = null;
  private currentPlayingRiff: SynthRiffType | null = null;
  private onPlaybackStateChange?: (isPlaying: boolean, riff: SynthRiffType | null) => void;

  // Mastering Nodes
  private masterGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private warmthNode: WaveShaperNode | null = null;
  private lowBoostNode: BiquadFilterNode | null = null;
  private highAirNode: BiquadFilterNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;

  // Mic Recorder
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecordingVocal: boolean = false;

  constructor() {
    // Lazy initialized
  }

  public registerStateListener(cb: (isPlaying: boolean, riff: SynthRiffType | null) => void) {
    this.onPlaybackStateChange = cb;
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.setupMasterChain();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private setupMasterChain() {
    if (!this.ctx) return;
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = this.volume;

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 64;

    this.lowBoostNode = this.ctx.createBiquadFilter();
    this.lowBoostNode.type = 'lowshelf';
    this.lowBoostNode.frequency.value = 90;
    this.lowBoostNode.gain.value = 2;

    this.highAirNode = this.ctx.createBiquadFilter();
    this.highAirNode.type = 'highshelf';
    this.highAirNode.frequency.value = 8500;
    this.highAirNode.gain.value = 2;

    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.value = -3;
    this.limiterNode.knee.value = 10;
    this.limiterNode.ratio.value = 12;
    this.limiterNode.attack.value = 0.003;
    this.limiterNode.release.value = 0.25;

    // Chain: Input -> LowBoost -> HighAir -> Limiter -> MasterGain -> Analyser -> Output
    this.lowBoostNode.connect(this.highAirNode);
    this.highAirNode.connect(this.limiterNode);
    this.limiterNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  public getMasterInput(): AudioNode {
    const ctx = this.initCtx();
    return this.lowBoostNode || ctx.destination;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(32);
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public setPlaybackOn(on: boolean) {
    this.isPlaybackOn = on;
    if (!on) {
      this.stopPreview();
    }
  }

  public getPlaybackOn(): boolean {
    return this.isPlaybackOn;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopPreview();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isPreviewPlaying(): boolean {
    return this.activeLoopInterval !== null;
  }

  public getCurrentPlayingRiff(): SynthRiffType | null {
    return this.currentPlayingRiff;
  }

  // Update real-time mastering settings
  public applyMasteringSettings(settings: MasteringSettings) {
    if (!this.ctx || !this.lowBoostNode || !this.highAirNode || !this.limiterNode) {
      this.initCtx();
    }
    if (!settings.enabled) {
      if (this.lowBoostNode) this.lowBoostNode.gain.value = 0;
      if (this.highAirNode) this.highAirNode.gain.value = 0;
      return;
    }

    if (this.lowBoostNode) {
      this.lowBoostNode.gain.value = (settings.subBassBoost / 100) * 8;
    }
    if (this.highAirNode) {
      this.highAirNode.gain.value = (settings.airClarity / 100) * 8;
    }
    if (this.limiterNode) {
      this.limiterNode.threshold.value = -1 - (settings.limiting / 100) * 12;
      this.limiterNode.ratio.value = 4 + (settings.limiting / 100) * 16;
    }
  }

  // --- INSTRUMENT SYNTHESIZERS ---

  public playKick(timeOffset: number = 0, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.38);

    gain.gain.setValueAtTime(0.9 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.getMasterInput());

    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playSnare(timeOffset: number = 0, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1100;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6 * this.volume * trackVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.getMasterInput());

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    oscGain.gain.setValueAtTime(0.5 * this.volume * trackVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.getMasterInput());

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.2);
    osc.stop(now + 0.2);
  }

  public playHiHat(timeOffset: number = 0, open: boolean = false, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;
    const dur = open ? 0.35 : 0.055;

    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getMasterInput());

    noise.start(now);
    noise.stop(now + dur);
  }

  public play808(timeOffset: number = 0, noteFreq: number = 48.99, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(noteFreq, now + 0.06);

    gain.gain.setValueAtTime(0.95 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.getMasterInput());

    osc.start(now);
    osc.stop(now + 0.85);
  }

  public playClap(timeOffset: number = 0, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    [0, 0.015, 0.03].forEach((delay) => {
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1300;
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4 * this.volume * trackVolume, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.getMasterInput());

      source.start(now + delay);
      source.stop(now + delay + 0.08);
    });
  }

  public playVocalChop(timeOffset: number = 0, freq: number = 440, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const form1 = ctx.createBiquadFilter();
    const form2 = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.15);

    // Formant filter (vocal "Ayy" formant)
    form1.type = 'bandpass';
    form1.frequency.value = 800;
    form1.Q.value = 4;

    form2.type = 'bandpass';
    form2.frequency.value = 1800;
    form2.Q.value = 5;

    gain.gain.setValueAtTime(0.45 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(form1);
    form1.connect(form2);
    form2.connect(gain);
    gain.connect(this.getMasterInput());

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playRimshot(timeOffset: number = 0, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

    gain.gain.setValueAtTime(0.6 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.getMasterInput());
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playPercussion(timeOffset: number = 0, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.5 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.getMasterInput());
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playSynthNote(freq: number, type: OscillatorType = 'sawtooth', duration: number = 0.25, timeOffset: number = 0, trackVolume: number = 1) {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + duration);

    gain.gain.setValueAtTime(0.4 * this.volume * trackVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getMasterInput());

    osc.start(now);
    osc.stop(now + duration);
  }

  public playChord(frequencies: number[], duration: number = 0.4, timeOffset: number = 0, trackVolume: number = 1) {
    frequencies.forEach(f => this.playSynthNote(f, 'triangle', duration, timeOffset, trackVolume));
  }

  // --- UI SOUND FX ---

  public playClick() {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.getMasterInput());
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playVoteWhoosh() {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.getMasterInput());
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playGong() {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    [110, 164.8, 220, 330, 440].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime((0.4 / (idx + 1)) * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      osc.connect(gain);
      gain.connect(this.getMasterInput());
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  public playCorrect() {
    if (this.isMuted || !this.isPlaybackOn) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      this.playSynthNote(freq, 'sine', 0.2, idx * 0.07);
    });
  }

  public playWrong() {
    if (this.isMuted || !this.isPlaybackOn) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);
    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.getMasterInput());
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playFanfare() {
    if (this.isMuted || !this.isPlaybackOn) return;
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.14 },
      { f: 523.25, d: 0.12, t: 0.28 },
      { f: 659.25, d: 0.3, t: 0.42 },
      { f: 783.99, d: 0.4, t: 0.65 },
      { f: 1046.50, d: 0.8, t: 0.95 }
    ];
    notes.forEach(n => {
      this.playSynthNote(n.f, 'triangle', n.d, n.t);
      this.playSynthNote(n.f / 2, 'sine', n.d, n.t);
    });
  }

  // --- RIFF PREVIEWS ---

  public playPreviewRiff(riff: SynthRiffType) {
    this.stopPreview();
    if (this.isMuted || !this.isPlaybackOn) return;
    this.initCtx();

    this.currentPlayingRiff = riff;
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(true, riff);
    }

    const bpm = 124;
    const stepTime = 60 / bpm / 4;
    let step = 0;

    const runPattern = () => {
      const offset = 0.01;
      const s = step % 16;

      switch (riff) {
        case 'rock': {
          if (s === 0 || s === 8) this.playKick(offset);
          if (s === 4 || s === 12) this.playSnare(offset);
          if (s % 2 === 0) this.playHiHat(offset);
          if (s === 0) this.playChord([146.83, 220, 293.66], 0.3, offset);
          if (s === 3) this.playChord([164.81, 246.94, 329.63], 0.2, offset);
          if (s === 6) this.playChord([174.61, 261.63, 349.23], 0.3, offset);
          if (s === 10) this.playChord([196.00, 293.66, 392.00], 0.2, offset);
          if (s === 14) this.playChord([174.61, 261.63, 349.23], 0.2, offset);
          break;
        }
        case 'pop': {
          if (s % 4 === 0) this.playKick(offset);
          if (s === 4 || s === 12) this.playClap(offset);
          if (s % 2 === 0) this.playHiHat(offset, s % 4 === 2);
          const popNotes = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33];
          if (s % 2 === 0) {
            this.playSynthNote(popNotes[(s / 2) % popNotes.length], 'sine', 0.15, offset);
            this.playSynthNote(popNotes[(s / 2) % popNotes.length] / 2, 'triangle', 0.15, offset);
          }
          break;
        }
        case 'hiphop': {
          if (s === 0 || s === 10) this.play808(offset, 48.99);
          if (s === 4 || s === 12) this.playSnare(offset);
          if (s % 2 === 0 || s === 7 || s === 15) this.playHiHat(offset);
          if (s === 0) this.playSynthNote(392.00, 'sawtooth', 0.3, offset);
          if (s === 3) this.playSynthNote(466.16, 'sawtooth', 0.2, offset);
          if (s === 6) this.playSynthNote(440.00, 'sawtooth', 0.3, offset);
          if (s === 11) this.playSynthNote(349.23, 'sawtooth', 0.2, offset);
          if (s === 14) this.playVocalChop(offset, 523.25);
          break;
        }
        case 'edm': {
          if (s % 4 === 0) this.playKick(offset);
          if (s === 4 || s === 12) this.playSnare(offset);
          if (s % 2 === 1) this.playHiHat(offset, true);
          const edmArp = [440, 523.25, 659.25, 880, 659.25, 523.25, 659.25, 783.99];
          this.playSynthNote(edmArp[s % edmArp.length], 'sawtooth', 0.1, offset);
          break;
        }
        case 'synthwave': {
          if (s % 4 === 0) this.playKick(offset);
          if (s === 4 || s === 12) this.playSnare(offset);
          if (s % 2 === 0) this.playHiHat(offset);
          const synthBass = [110, 110, 110, 110, 130.81, 130.81, 146.83, 146.83];
          this.playSynthNote(synthBass[(s / 2) | 0], 'sawtooth', 0.12, offset);
          if (s === 0 || s === 8) this.playChord([220, 277.18, 329.63, 440], 0.8, offset);
          break;
        }
        case 'soul':
        case 'funk': {
          if (s === 0 || s === 6 || s === 10) this.playKick(offset);
          if (s === 4 || s === 12) this.playSnare(offset);
          if (s % 2 === 0 || s === 3 || s === 11) this.playHiHat(offset);
          if (s === 0) this.playSynthNote(73.42, 'triangle', 0.15, offset);
          if (s === 2) this.playSynthNote(146.83, 'triangle', 0.12, offset);
          if (s === 6) this.playSynthNote(87.31, 'triangle', 0.15, offset);
          if (s === 8) this.playChord([293.66, 369.99, 440], 0.3, offset);
          break;
        }
        case 'latin': {
          if (s % 4 === 0) this.playKick(offset);
          if (s === 3 || s === 6 || s === 11 || s === 14) this.playSnare(offset);
          if (s % 2 === 0) this.playHiHat(offset);
          if (s === 0 || s === 3 || s === 6 || s === 10 || s === 12) {
            this.playChord([440, 523.25, 659.25], 0.18, offset);
          }
          break;
        }
      }
      step++;
    };

    runPattern();
    this.activeLoopInterval = window.setInterval(runPattern, stepTime * 1000);
  }

  public stopPreview() {
    if (this.activeLoopInterval !== null) {
      clearInterval(this.activeLoopInterval);
      this.activeLoopInterval = null;
    }
    this.currentPlayingRiff = null;
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(false, null);
    }
  }

  public togglePreviewRiff(riff: SynthRiffType) {
    if (this.currentPlayingRiff === riff && this.isPreviewPlaying()) {
      this.stopPreview();
    } else {
      this.playPreviewRiff(riff);
    }
  }

  // --- VOCAL MICROPHONE RECORDER ---

  public async startVocalRecording(): Promise<boolean> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecordingVocal = true;
      return true;
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      return false;
    }
  }

  public stopVocalRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecordingVocal) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.isRecordingVocal = false;
        resolve(audioUrl);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    });
  }

  public getIsRecording(): boolean {
    return this.isRecordingVocal;
  }
}

export const soundEngine = new SoundEngine();
