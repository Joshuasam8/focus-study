// Web Audio synthesizer for ambient focus sounds and timer alerts
// Clean, dependency-free, cross-browser audio engine

let audioCtx: AudioContext | null = null;
let activeNode: { stop: () => void } | null = null;

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

export function playTimerCompletionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonious major triad chime (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.4);
    });
  } catch (e) {
    console.warn('Audio chime failed:', e);
  }
}

export function startAmbientSound(type: 'rain' | 'white-noise' | 'binaural'): { stop: () => void } {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();

    if (type === 'white-noise' || type === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brownian noise for softer, comfortable sound
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Rain filter (Brown noise with mild low-pass)
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else {
          // Gentle smooth white noise
          data[i] = white * 0.15;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 1200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();

      const controller = {
        stop: () => {
          try {
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            setTimeout(() => {
              try {
                noiseSource.stop();
                noiseSource.disconnect();
              } catch (_) {}
            }, 600);
          } catch (_) {}
        },
      };
      activeNode = controller;
      return controller;
    } else if (type === 'binaural') {
      // Alpha wave binaural beats (e.g. 200Hz base and 210Hz beat = 10Hz Alpha Focus)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const gain = ctx.createGain();

      oscL.type = 'sine';
      oscL.frequency.value = 210; // Left ear
      oscR.type = 'sine';
      oscR.frequency.value = 200; // Right ear (10Hz difference)

      const merger = ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      merger.connect(gain);
      gain.connect(ctx.destination);

      oscL.start();
      oscR.start();

      const controller = {
        stop: () => {
          try {
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            setTimeout(() => {
              try {
                oscL.stop();
                oscR.stop();
                oscL.disconnect();
                oscR.disconnect();
              } catch (_) {}
            }, 600);
          } catch (_) {}
        },
      };
      activeNode = controller;
      return controller;
    }
  } catch (e) {
    console.warn('Could not start ambient sound:', e);
  }

  const noop = { stop: () => {} };
  activeNode = noop;
  return noop;
}

export function stopAmbientSound() {
  if (activeNode) {
    try {
      activeNode.stop();
    } catch (_) {}
    activeNode = null;
  }
}
