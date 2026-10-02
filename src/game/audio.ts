// Web Audio API Retro Synthwave Music & Sound Effects Engine

import { MusicTrack } from './types';

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'night_drive',
    title: 'Night Drive 1984',
    artist: 'Barrystudios Synth Lab',
    bpm: 122,
    style: 'Classic Outrun / Retrowave'
  },
  {
    id: 'cyber_pursuit',
    title: 'Cyber Pursuit (Robotic Chase)',
    artist: 'Barrystudios Synth Lab',
    bpm: 132,
    style: 'Darksynth / Action Pursuit'
  },
  {
    id: 'neon_skyline',
    title: 'Neon Skyline Horizon',
    artist: 'Barrystudios Synth Lab',
    bpm: 114,
    style: 'Dreamwave / Cyber Cruise'
  },
  {
    id: 'overdrive',
    title: 'Street Runner Overdrive',
    artist: 'Barrystudios Synth Lab',
    bpm: 128,
    style: 'High-Octane Cyberpunk'
  }
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isMusicPlaying = false;
  private currentTrackId: string = 'night_drive';
  private musicTimer: number | null = null;
  private stepIndex = 0;
  
  public musicVolume = 0.65;
  public sfxVolume = 0.8;
  public isMusicMuted = false;
  public isSfxMuted = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.isMusicMuted ? 0 : this.musicVolume;
      this.musicGain.connect(this.masterGain);
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isSfxMuted ? 0 : this.sfxVolume;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setTrack(trackId: string) {
    this.currentTrackId = trackId;
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && !this.isMusicMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && !this.isSfxMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  public toggleMusicMute(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : this.musicVolume, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.isMusicMuted;
  }

  public toggleSfxMute(): boolean {
    this.isSfxMuted = !this.isSfxMuted;
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.isSfxMuted ? 0 : this.sfxVolume, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.isSfxMuted;
  }

  public getCurrentTrack(): MusicTrack {
    return MUSIC_TRACKS.find(t => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
  }

  // Synthwave procedural music sequencer
  public startMusic() {
    this.initCtx();
    if (!this.ctx) return;
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.stepIndex = 0;

    const track = this.getCurrentTrack();
    const stepDurationMs = (60 / track.bpm / 4) * 1000; // 16th note steps

    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMusicMuted) {
        this.stepIndex = (this.stepIndex + 1) % 64;
        return;
      }
      this.playSynthwaveStep(this.currentTrackId, this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 64;
    }, stepDurationMs);
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.isMusicPlaying = false;
  }

  private playSynthwaveStep(trackId: string, step: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const beat = step % 16;
    const measure = Math.floor(step / 16);

    // Track musical scales and patterns
    switch (trackId) {
      case 'cyber_pursuit': {
        // Fast, aggressive D-minor cyberpunk bassline
        const bassNotes = [36.71, 36.71, 38.89, 36.71, 43.65, 41.20, 36.71, 38.89]; // D1, D1, Eb1, D1, F1, E1
        const note = bassNotes[beat % bassNotes.length];
        this.playBassSynth(note, 0.12, 'sawtooth', 700);

        // Drums: Four on floor kick, snappier snare on 4 & 12
        if (beat % 4 === 0) this.playKick(now);
        if (beat === 4 || beat === 12) this.playSnare(now, true);
        if (beat % 2 === 1) this.playHiHat(now, 0.05);

        // Dark synth lead arpeggio
        if (beat % 2 === 0) {
          const arpPitches = [146.83, 174.61, 220.0, 261.63, 293.66, 261.63, 220.0, 174.61];
          const arpPitch = arpPitches[(step % arpPitches.length)];
          this.playArpLead(arpPitch, 0.16, 'sawtooth');
        }
        break;
      }

      case 'neon_skyline': {
        // Lush Dreamwave chords (Fmaj7 - G - Am - Em)
        const roots = [43.65, 49.00, 55.00, 41.20]; // F, G, A, E
        const root = roots[measure % 4];
        if (beat % 4 === 0) {
          this.playBassSynth(root, 0.22, 'triangle', 450);
        }

        // Chords on beats 0 and 8
        if (beat === 0 || beat === 8) {
          const chordFreqs = [
            [174.61, 220.0, 261.63, 329.63], // Fmaj7
            [196.0, 246.94, 293.66, 392.0],  // G
            [220.0, 261.63, 329.63, 440.0],  // Am
            [164.81, 196.0, 246.94, 329.63], // Em
          ][measure % 4];
          this.playPadChord(chordFreqs, 0.7);
        }

        // Chill drums
        if (beat === 0 || beat === 8) this.playKick(now);
        if (beat === 4 || beat === 12) this.playSnare(now, false);
        if (beat % 2 === 0) this.playHiHat(now, 0.04);
        break;
      }

      case 'overdrive': {
        // High-energy cyberpunk anthem (C minor - G# - Bb - Eb)
        const bassProg = [32.7, 32.7, 51.91, 46.25];
        const bassFreq = bassProg[measure % 4];
        // 16th rolling synth bass
        this.playBassSynth(bassFreq, 0.1, 'sawtooth', 850);

        if (beat % 4 === 0) this.playKick(now);
        if (beat === 4 || beat === 12) this.playSnare(now, true);
        this.playHiHat(now, beat % 4 === 2 ? 0.08 : 0.03);

        // Fast synth arpeggios
        const leadScale = [261.63, 311.13, 392.0, 466.16, 523.25, 466.16, 392.0, 311.13];
        const leadFreq = leadScale[(step + 2) % leadScale.length];
        this.playArpLead(leadFreq * 1.5, 0.11, 'square');
        break;
      }

      case 'night_drive':
      default: {
        // Classic Retrowave 1984 in A Minor
        const bassNotesA = [55.0, 55.0, 55.0, 55.0, 43.65, 43.65, 48.99, 55.0];
        const bassFreq = bassNotesA[(step >> 1) % bassNotesA.length];
        if (beat % 2 === 0) {
          this.playBassSynth(bassFreq, 0.14, 'sawtooth', 600);
        }

        // Drums
        if (beat % 4 === 0) this.playKick(now);
        if (beat === 4 || beat === 12) this.playSnare(now, true);
        if (beat % 2 === 1) this.playHiHat(now, 0.05);

        // Melodic arpeggio
        const arpMelody = [220.0, 261.63, 329.63, 440.0, 392.0, 329.63, 261.63, 293.66];
        const melNote = arpMelody[step % arpMelody.length];
        if (beat % 2 === 0) {
          this.playArpLead(melNote, 0.15, 'sawtooth');
        }
        break;
      }
    }
  }

  // Instrument synthesizers
  private playKick(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playSnare(time: number, gatedReverb = true) {
    if (!this.ctx || !this.musicGain) return;
    // Noise buffer for snappy 80s gated snare
    const bufferSize = this.ctx.sampleRate * (gatedReverb ? 0.18 : 0.1);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (gatedReverb ? 0.18 : 0.1));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private playHiHat(time: number, vol = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(9000, time);

    filter.type = 'highpass';
    filter.frequency.value = 7000;

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private playBassSynth(freq: number, duration: number, type: OscillatorType, cutoff: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, now + duration);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playArpLead(freq: number, duration: number, type: OscillatorType) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, now);
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playPadChord(freqs: number[], duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    freqs.forEach(freq => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(1400, now + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // SFX Functions
  public playJump() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playSlide() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playSwipe() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCoin() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.05); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playPowerup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  public playHoverboard() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playPoliceWarning() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.12);
    osc.frequency.linearRampToValueAtTime(750, now + 0.24);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playCrash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.32);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.36);
  }

  public playGameOver() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [330, 311, 293, 220];
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playClick() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundEngine = new SoundEngine();
