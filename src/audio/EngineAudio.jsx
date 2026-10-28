import { useEffect } from 'react';
import { useScrollStore } from '../store/scroll.js';

const SAMPLE_URL = '/audio/motorcycle-engine.mp3';
const MAX_SCROLL_VELOCITY = 3.2;
const CROSSFADE_SECONDS = 0.12;

function makeLoopBuffer(context, source) {
  const channels = source.numberOfChannels;
  const crossfadeFrames = Math.min(
    Math.round(context.sampleRate * CROSSFADE_SECONDS),
    Math.floor(source.length / 4),
  );
  const outputLength = source.length - crossfadeFrames;
  const loop = context.createBuffer(channels, outputLength, context.sampleRate);
  const bodyLength = source.length - crossfadeFrames * 2;

  for (let channel = 0; channel < channels; channel += 1) {
    const input = source.getChannelData(channel);
    const output = loop.getChannelData(channel);

    for (let i = 0; i < bodyLength; i += 1) {
      output[i] = input[i + crossfadeFrames];
    }

    for (let i = 0; i < crossfadeFrames; i += 1) {
      const mix = i / crossfadeFrames;
      const tail = input[source.length - crossfadeFrames + i];
      const head = input[i];
      output[bodyLength + i] = tail * Math.cos(mix * Math.PI / 2) + head * Math.sin(mix * Math.PI / 2);
    }
  }

  return loop;
}

function smoothParam(param, value, now, timeConstant) {
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(now);
  } else {
    param.cancelScheduledValues(now);
  }
  param.setTargetAtTime(value, now, timeConstant);
}

function createEngine(context, recording) {
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.2;

  const master = context.createGain();
  master.gain.value = 0;
  compressor.connect(master);
  master.connect(context.destination);

  const highPass = context.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 65;
  highPass.Q.value = 0.7;

  const lowPass = context.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.value = 5200;
  lowPass.Q.value = 0.55;
  highPass.connect(lowPass);
  lowPass.connect(compressor);

  const source = context.createBufferSource();
  source.buffer = makeLoopBuffer(context, recording);
  source.loop = true;
  source.playbackRate.value = 0.74;
  source.connect(highPass);
  source.start();

  return { context, master, source, lowPass };
}

function tuneEngine(engine, state) {
  const now = engine.context.currentTime;
  const isRevving = state.isRevving;
  const velocity = isRevving ? 1.0 : Math.min(Math.abs(state.scrollVelocity) / MAX_SCROLL_VELOCITY, 1);
  const active = (velocity > 0.008 || isRevving) && !state.muted;
  const playbackRate = isRevving ? 1.52 : 0.74 + velocity * 0.68;
  const volume = active ? (isRevving ? 0.65 : 0.04 + Math.pow(velocity, 0.95) * 0.58) : 0;

  smoothParam(engine.source.playbackRate, playbackRate, now, isRevving ? 0.08 : 0.14);
  smoothParam(engine.lowPass.frequency, isRevving ? 9500 : 4200 + velocity * 5200, now, 0.16);
  smoothParam(engine.master.gain, volume, now, isRevving ? 0.06 : 0.13);
}

export default function EngineAudio() {
  useEffect(() => {
    let context = null;
    let engine = null;
    let loading = null;
    let idleTimer = null;
    let disposed = false;

    const recordingRequest = fetch(SAMPLE_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Motorcycle audio could not be loaded');
        return response.arrayBuffer();
      })
      .catch(() => null);

    const startEngine = () => {
      const state = useScrollStore.getState();
      if (state.muted) return;

      try {
        if (!context) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          context = new AudioContextClass();
        }

        if (context.state === 'suspended') context.resume().catch(() => {});

        if (!engine && !loading) {
          loading = recordingRequest
            .then((data) => {
              if (!data) return null;
              return context.decodeAudioData(data.slice(0));
            })
            .then((recording) => {
              if (!recording || disposed || !context || context.state === 'closed') return;
              engine = createEngine(context, recording);
              tuneEngine(engine, useScrollStore.getState());
            })
            .catch(() => {
              loading = null;
            });
        }

        if (engine) tuneEngine(engine, state);
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
          clearTimeout(idleTimer);
          if (engine) tuneEngine(engine, state);
        } else {
          startEngine();
        }
      } else if (state.scrollVelocity !== previous.scrollVelocity) {
        clearTimeout(idleTimer);
        if (engine) tuneEngine(engine, state);

        if (Math.abs(state.scrollVelocity) > 0.008) {
          idleTimer = setTimeout(() => {
            if (engine) tuneEngine(engine, { ...useScrollStore.getState(), scrollVelocity: 0 });
          }, 240);
        }
      }
    });

    window.addEventListener('wheel', onScrollGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', onScrollGesture, { passive: true, capture: true });
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('click', onScrollGesture, true);

    return () => {
      disposed = true;
      clearTimeout(idleTimer);
      unsubscribe();
      window.removeEventListener('wheel', onScrollGesture, true);
      window.removeEventListener('touchstart', onScrollGesture, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('click', onScrollGesture, true);
      if (context && context.state !== 'closed') context.close();
    };
  }, []);

  return null;
}
