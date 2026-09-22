/**
 * Web Audio API synthesizer for distraction-free study ambience and notification chimes.
 * Requires zero external audio files, completely reliable offline.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle meditation bell for session completion
export function playCompletionBell() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const baseFreq = 528; // Solfeggio 528Hz (Transformation/Miracle tone)
    const harmonics = [1, 2.01, 2.99, 4.02];
    const gains = [0.4, 0.25, 0.15, 0.08];

    harmonics.forEach((harmonic, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * harmonic, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gains[index], now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.6);
    });
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}

// Subtle soft tap sound
export function playStartSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}

// Ambient Sound Generator (Rain, White Noise, Gentle Library hum)
class AmbientPlayer {
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying = false;
  private currentType: string = 'none';

  start(type: 'none' | 'rain' | 'whitenoise' | 'library', volume: number = 0.5) {
    this.stop();
    if (type === 'none') return;

    try {
      const ctx = getAudioContext();
      this.currentType = type;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink/brown noise based on type
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'whitenoise') {
          // Soft pink noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        } else if (type === 'rain') {
          // Brownish rain noise
          b0 = (b0 + (0.02 * white)) / 1.02;
          data[i] = b0 * 1.5;
        } else {
          // Library hum: deeper low resonance
          b0 = (b0 + (0.015 * white)) / 1.015;
          data[i] = b0 * 1.1;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
      } else if (type === 'library') {
        filter.type = 'bandpass';
        filter.frequency.value = 350;
        filter.Q.value = 1.2;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 1800;
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      this.noiseNode = noiseSource;
      this.filterNode = filter;
      this.gainNode = gain;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Failed to start ambient sound:', e);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && audioCtx) {
      this.gainNode.gain.setValueAtTime(volume * 0.25, audioCtx.currentTime);
    }
  }

  stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
    this.currentType = 'none';
  }

  getActiveType() {
    return this.currentType;
  }
}

export const ambientPlayer = new AmbientPlayer();
