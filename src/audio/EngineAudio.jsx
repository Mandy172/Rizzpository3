import { useEffect } from 'react';
import { useScrollStore } from '../store/scroll.js';

const REFERENCE_RPM = 3000;
const MAX_SCROLL_VELOCITY = 4;

// Aprilia's 65° V4 has an uneven 720° combustion sequence. These pulse angles
// make the loop throb like that engine instead of sounding like a flat sine tone.
const FIRING_ANGLES = [0, 180, 425, 605];

function makeFiringLoop(context) {
  const cycleSeconds = 120 / REFERENCE_RPM;
  const frameCount = Math.round(context.sampleRate * cycleSeconds);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  const pulseAngles = FIRING_ANGLES.map((angle) => angle / 720);
  let peak = 0;

  for (let i = 0; i < frameCount; i += 1) {
    const phase = i / frameCount;
    let sample = 0;

    for (const pulse of pulseAngles) {
      const age = ((phase - pulse + 1) % 1) * cycleSeconds;
      if (age > 0.024) continue;

      const envelope = Math.exp(-age / 0.0065);
      sample += envelope * (
        0.62 * Math.sin(2 * Math.PI * 82 * age)
        + 0.3 * Math.sin(2 * Math.PI * 190 * age)
        + 0.2 * Math.sin(2 * Math.PI * 620 * age)
        + 0.1 * Math.sin(2 * Math.PI * 1320 * age)
      );
    }

    samples[i] = sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  const scale = peak > 0 ? 0.8 / peak : 1;
  for (let i = 0; i < frameCount; i += 1) samples[i] *= scale;
  return buffer;
}

function makeIntakeNoise(context) {
  const frameCount = context.sampleRate * 2;
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  const fadeFrames = Math.round(context.sampleRate * 0.04);

  for (let i = 0; i < frameCount; i += 1) {
    const edge = Math.min(1, i / fadeFrames, (frameCount - 1 - i) / fadeFrames);
    samples[i] = (Math.random() * 2 - 1) * Math.max(0, edge) * 0.35;
  }

  return buffer;
}

function smoothParam(param, value, now, timeConstant) {
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(now);
  } else {
    param.cancelScheduledValues(now);
  }
  param.setTargetAtTime(value, now, timeConstant);
}

function createEngine(context) {
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 16;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.16;

  const master = context.createGain();
  master.gain.value = 0;
  compressor.connect(master);
  master.connect(context.destination);

  const exhaustFilter = context.createBiquadFilter();
  exhaustFilter.type = 'lowpass';
  exhaustFilter.frequency.value = 1500;
  exhaustFilter.Q.value = 0.65;

  const exhaustGain = context.createGain();
  exhaustGain.gain.value = 0.74;
  exhaustFilter.connect(exhaustGain);
  exhaustGain.connect(compressor);

  const firing = context.createBufferSource();
  firing.buffer = makeFiringLoop(context);
  firing.loop = true;
  firing.playbackRate.value = 0.5;
  firing.connect(exhaustFilter);
  firing.start();

  const intakeFilter = context.createBiquadFilter();
  intakeFilter.type = 'bandpass';
  intakeFilter.frequency.value = 900;
  intakeFilter.Q.value = 0.55;

  const intakeGain = context.createGain();
  intakeGain.gain.value = 0.16;
  intakeFilter.connect(intakeGain);
  intakeGain.connect(compressor);

  const intake = context.createBufferSource();
  intake.buffer = makeIntakeNoise(context);
  intake.loop = true;
  intake.connect(intakeFilter);
  intake.start();

  return { context, master, firing, exhaustFilter, intakeFilter };
}

function tuneEngine(engine, state) {
  const { context } = engine;
  const now = context.currentTime;
  const velocity = Math.min(Math.abs(state.scrollVelocity) / MAX_SCROLL_VELOCITY, 1);
  const rpm = 1450 + Math.pow(velocity, 1.18) * 11550;
  const targetVolume = state.muted ? 0 : 0.018 + Math.pow(velocity, 1.45) * 0.2;

  smoothParam(engine.firing.playbackRate, rpm / REFERENCE_RPM, now, 0.09);
  smoothParam(engine.exhaustFilter.frequency, 1250 + velocity * 4100, now, 0.12);
  smoothParam(engine.intakeFilter.frequency, 750 + velocity * 2600, now, 0.12);
  smoothParam(engine.master.gain, targetVolume, now, 0.1);
}

export default function EngineAudio() {
  useEffect(() => {
    let engine = null;
    let audioContext = null;

    const startEngine = () => {
      const state = useScrollStore.getState();
      if (state.muted) return;

      try {
        if (!audioContext) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          const context = new AudioContextClass();
          try {
            engine = createEngine(context);
            audioContext = context;
          } catch (error) {
            context.close();
            throw error;
          }
        }

        if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
        tuneEngine(engine, state);
      } catch {
        // Unsupported audio devices should not interrupt the visual experience.
      }
    };

    const onScrollGesture = () => startEngine();
    const onKeyDown = (event) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) {
        startEngine();
      }
    };

    const unsubscribe = useScrollStore.subscribe((state, previous) => {
      if (state.muted !== previous.muted) {
        if (state.muted) {
          if (engine) tuneEngine(engine, state);
        } else {
          startEngine();
        }
      } else if (engine && state.scrollVelocity !== previous.scrollVelocity) {
        tuneEngine(engine, state);
      }
    });

    window.addEventListener('wheel', onScrollGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', onScrollGesture, { passive: true, capture: true });
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('click', onScrollGesture, true);

    return () => {
      unsubscribe();
      window.removeEventListener('wheel', onScrollGesture, true);
      window.removeEventListener('touchstart', onScrollGesture, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('click', onScrollGesture, true);
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  }, []);

  return null;
}
