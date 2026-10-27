import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { useScrollStore } from '../store/scroll.js';

/**
 * Postprocessing pipeline:
 * - Subtle bloom on emissive materials (e.g. active parts, HUD glow, headlights)
 * - Film grain
 * - Tech vignette
 * - Chromatic aberration driven dynamically by scrollVelocity
 * - Completely bypassed in lowPower mode
 */
export const PostProcessing = () => {
  const lowPower = useScrollStore((state) => state.lowPower);
  const scrollVelocity = useScrollStore((state) => state.scrollVelocity);

  // Reuse vector to prevent per-frame garbage collection
  const chromaOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    if (lowPower) return;
    // Map absolute velocity (normalized ~0-5) to chromatic aberration offset
    const vel = Math.abs(scrollVelocity);
    const targetOffset = Math.min(0.0006 + vel * 0.00045, 0.0045);
    chromaOffset.x = THREE.MathUtils.lerp(chromaOffset.x, targetOffset, 0.12);
    chromaOffset.y = THREE.MathUtils.lerp(chromaOffset.y, targetOffset * 0.7, 0.12);
  });

  if (lowPower) {
    return null;
  }

  return (
    <EffectComposer disableNormalPass multisampling={0}>
      {/* Subtle bloom on red emissives and HUD indicators */}
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.35}
        intensity={0.8}
        mipmapBlur
      />

      {/* Tech-brutalist film grain */}
      <Noise opacity={0.03} />

      {/* Heavy vignette for focused telemetry camera staging */}
      <Vignette offset={0.2} darkness={0.85} eskil={false} />

      {/* Velocity-reactive chromatic aberration */}
      <ChromaticAberration offset={chromaOffset} />
    </EffectComposer>
  );
};
