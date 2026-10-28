import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { StudioScene } from './StudioScene.jsx';
import { BikeModel } from './BikeModel.jsx';
import { PostProcessing } from './PostProcessing.jsx';
import { useScrollStore } from '../store/scroll.js';

export const ThreeCanvas = () => {
  const lowPower = useScrollStore((s) => s.lowPower);

  return (
    <div className="fixed inset-0 z-0 w-full h-full pointer-events-auto bg-bg">
      <Canvas
        camera={{ position: [3.30, 0.72, 0.0], fov: 33 }}
        dpr={lowPower ? 1 : Math.min(window.devicePixelRatio, 1.75)}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        shadows
      >
        <Suspense fallback={null}>
          <StudioScene />
          <BikeModel />
          <PostProcessing />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;
