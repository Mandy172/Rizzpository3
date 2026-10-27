import React from 'react';
import { ThreeCanvas } from './three/ThreeCanvas.jsx';
import { HUDOverlay } from './hud/HUDOverlay.jsx';
import { ScrollContainer } from './sections/ScrollContainer.jsx';

export default function App() {
  return (
    <main className="relative w-full bg-bg text-text min-h-screen">
      {/* 4. Fixed full-screen Three.js Canvas behind the DOM (z-index 0) */}
      <ThreeCanvas />

      {/* Persistent Technical Telemetry HUD & Leader Line */}
      <HUDOverlay />

      {/* GSAP & Lenis Scroll Container with sections */}
      <ScrollContainer />
    </main>
  );
}
