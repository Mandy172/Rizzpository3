import React, { Component } from 'react';
import Sections from './sections';
import { ThreeCanvas } from './three/ThreeCanvas.jsx';
import { HUDOverlay } from './hud/HUDOverlay.jsx';
import { ScrollContainer } from './sections/ScrollContainer.jsx';
import { Preloader, Cursor, PartNavigator } from './hud';
import EngineAudio from './audio/EngineAudio.jsx';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("WebGL Canvas error caught, continuing with fallback HUD:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 w-full h-full bg-bg flex items-center justify-center font-mono text-xs text-muted">
          <div className="border border-blueprint p-6 bg-surface text-center">
            <span className="text-accent font-bold block mb-2">[LOW-POWER / WEBGL 2D FALLBACK]</span>
            <span className="text-hud">TELEMETRY & HUD ACTIVE</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <main className="relative w-full bg-bg text-text min-h-screen">
      {/* Interactive custom crosshair cursor */}
      <Cursor />

      {/* Boot sequence preloader with 13k RPM arc sweep */}
      <Preloader />
      <EngineAudio />

      {/* 4. Fixed full-screen Three.js Canvas behind the DOM (z-index 0) */}
      <CanvasErrorBoundary>
        <ThreeCanvas />
      </CanvasErrorBoundary>

      <Sections />

      {/* Persistent Technical Telemetry HUD & Leader Line */}
      <HUDOverlay />

      {/* Right-edge part navigator */}
      <PartNavigator />

      {/* GSAP & Lenis Scroll Container with sections */}
      <ScrollContainer />
    </main>
  );
}
